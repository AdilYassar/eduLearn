import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import RNFS from 'react-native-fs'; // For file handling
import FileViewer from 'react-native-file-viewer'; // For opening files
import { useLearningMaterials } from '@service/hooks/useLearningMaterials';

interface BookName {
  _id: string;
  title: string;
  author?: string;
  genre?: string;
  pages?: number;
  language?: string;
  publishedDate?: string;
}

const BookScreen = () => {
  const [bookNames, setBookNames] = useState<BookName[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<BookName[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingBookId, setDownloadingBookId] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { getAllBooks, getBookPdf } = useLearningMaterials();

  // Fetch all books with metadata (no PDFs) from API
  const fetchBookNames = async () => {
    try {
      setIsInitialLoading(true);
      const result = await getAllBooks();
      console.log('📚 Books fetched:', result);
      if (result && Array.isArray(result)) {
        setBookNames(result);
        setFilteredBooks(result);
      } else {
        console.error('Invalid books result:', result);
        setBookNames([]);
        setFilteredBooks([]);
      }
    } catch (fetchError) {
      console.error('Error fetching books:', fetchError);
      Alert.alert('Error', 'An error occurred while fetching books');
      setBookNames([]);
      setFilteredBooks([]);
    } finally {
      setIsInitialLoading(false);
    }
  };

  // Filter books based on search query
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredBooks(bookNames);
    } else {
      const filtered = bookNames.filter(book =>
        book.title.toLowerCase().includes(query.toLowerCase()),
      );
      setFilteredBooks(filtered);
    }
  };

  // Fetch full book details when a book is selected
  const handleBookSelect = async (bookId: string) => {
    try {
      setDownloadingBookId(bookId);
      console.log('🔍 Fetching PDF for book ID:', bookId);
      const result = await getBookPdf(bookId);
      
      if (!result) {
        console.error('❌ No result returned from API');
        Alert.alert('Error', 'Failed to fetch book PDF');
        return;
      }
      
      console.log('📦 PDF fetched successfully:', {
        title: result.title,
        pdfLength: result.pdf?.length || 0,
      });
      
      if (result.pdf) {
        console.log('✅ PDF found, starting download...');
        await displayPdf(result.pdf, result.title);
      } else {
        console.error('❌ No PDF property in result');
        Alert.alert('Error', 'This book does not have a PDF available');
      }
    } catch (error) {
      console.error('Error fetching book PDF:', error);
      Alert.alert('Error', 'An error occurred while loading the book');
    } finally {
      setDownloadingBookId(null);
    }
  };

  // Save and open PDF using react-native-fs
  const displayPdf = async (base64Pdf: string | undefined, title: string) => {
    try {
      if (!base64Pdf || base64Pdf.trim() === '') {
        console.error('❌ PDF data is empty or undefined');
        Alert.alert('Error', 'PDF data is not available');
        return;
      }

      // Sanitize the title for filename
      const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
      const path = `${RNFS.DocumentDirectoryPath}/${sanitizedTitle}.pdf`;

      // Remove data URL prefix if present
      const cleanBase64 = base64Pdf.replace(/^data:application\/pdf;base64,/, '');
      
      console.log('💾 Saving PDF to:', path);
      console.log('📏 PDF base64 length:', cleanBase64.length);

      // Save the PDF to the file system
      await RNFS.writeFile(path, cleanBase64, 'base64');
      console.log(`✅ PDF saved at ${path}`);

      // Open the PDF
      await FileViewer.open(path, { showOpenWithDialog: true });
      console.log('📖 PDF opened successfully');
    } catch (pdfError) {
      console.error('Error downloading or opening PDF:', pdfError);
      Alert.alert('Error', `Failed to download or open PDF: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    fetchBookNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isInitialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading Books...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search books..."
            placeholderTextColor="#a0a0a0"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => handleSearch('')}
              style={styles.clearButton}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Book Grid */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.headerText}>
          📚 Available Books ({filteredBooks?.length || 0})
        </Text>

        {!filteredBooks || filteredBooks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No books found matching your search' : 'No books available'}
            </Text>
          </View>
        ) : (
          <View style={styles.bookGrid}>
            {filteredBooks.map((book) => (
              <TouchableOpacity
                key={book._id}
                style={styles.bookCard}
                onPress={() => handleBookSelect(book._id)}
                disabled={downloadingBookId === book._id}
              >
                {/* Illustration Area */}
                <View style={styles.illustrationContainer}>
                  <Text style={styles.bookEmoji}>📚</Text>
                  <View style={styles.decorCircle1} />
                  <View style={styles.decorCircle2} />
                </View>

                {/* Content Area */}
                <View style={styles.contentArea}>
                  <Text style={styles.bookTitle} numberOfLines={2}>
                    {book.title}
                  </Text>
                  
                  {/* Book Details */}
                  <View style={styles.detailsContainer}>
                    {book.author && (
                      <Text style={styles.detailText} numberOfLines={1}>
                        ✍️ {book.author}
                      </Text>
                    )}
                    {book.genre && (
                      <Text style={styles.detailText} numberOfLines={1}>
                        📖 {book.genre}
                      </Text>
                    )}
                    <View style={styles.bottomDetails}>
                      {book.pages && (
                        <Text style={styles.detailBadge}>
                          {book.pages} pages
                        </Text>
                      )}
                      {book.language && (
                        <Text style={styles.detailBadge}>
                          {book.language}
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  <Text style={styles.tapPrompt}>
                    {downloadingBookId === book._id ? '⏳ Loading PDF...' : '👆 Tap to open PDF'}
                  </Text>
                </View>

                {/* Loading Indicator */}
                {downloadingBookId === book._id && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: 'transparent',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: '#2C3E50',
    fontFamily: 'Inter-Regular',
  },
  clearButton: {
    padding: 6,
    marginLeft: 4,
  },
  clearIcon: {
    fontSize: 16,
    color: '#95a5a6',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  headerText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 20,
    fontFamily: 'Inter-Bold',
  },
  bookGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bookCard: {
    width: '48%',
    backgroundColor: '#1a5f5f',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  illustrationContainer: {
    backgroundColor: '#fff',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  bookEmoji: {
    fontSize: 40,
    zIndex: 10,
  },
  decorCircle1: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e3f2fd',
    top: -10,
    left: -10,
  },
  decorCircle2: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff3e0',
    bottom: -5,
    right: -5,
  },
  contentArea: {
    padding: 12,
    backgroundColor: '#1a5f5f',
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    minHeight: 38,
    fontFamily: 'Inter-SemiBold',
  },
  detailsContainer: {
    marginBottom: 10,
  },
  detailText: {
    fontSize: 11,
    color: '#d4ebe4',
    marginBottom: 4,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  bottomDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  detailBadge: {
    fontSize: 10,
    color: '#1a5f5f',
    backgroundColor: '#b8e0d2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontWeight: '600',
    overflow: 'hidden',
    fontFamily: 'Inter-SemiBold',
  },
  tapPrompt: {
    fontSize: 11,
    color: '#b8e0d2',
    fontWeight: '600',
    marginTop: 4,
    fontFamily: 'Inter-Medium',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    fontSize: 18,
    color: '#1a5f5f',
    marginTop: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});

export default BookScreen;
