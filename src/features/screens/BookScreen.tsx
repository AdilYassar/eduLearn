import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  useAnimatedScrollHandler,
  interpolate,
} from 'react-native-reanimated';
import RNFS from 'react-native-fs'; // For file handling
import FileViewer from 'react-native-file-viewer'; // For opening files
import { useLearningMaterials } from '@service/hooks/useLearningMaterials';
import { push } from '../../utils/Navigation';
import { Search, X, Video } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { ThemedContainer, GlassCard } from '../../components/ui/ThemedComponents';
import BottomNavigationBar from '../../components/ui/BottomNavigationBar';

interface BookName {
  _id: string;
  title: string;
  author?: string;
  genre?: string;
  pages?: number;
  language?: string;
  publishedDate?: string;
}

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.72; // High density sleek card width
const SPACING = (width - ITEM_WIDTH) / 2;

// Animated Book Card Component - Reanimated Wheeler Logic
const AnimatedBookCard = React.memo(({
  book,
  index,
  theme,
  downloadingBookId,
  onPress,
  scrollX,
}: {
  book: BookName;
  index: number;
  theme: any;
  downloadingBookId: string | null;
  onPress: (id: string) => void;
  scrollX: Animated.SharedValue<number>;
}) => {
  const inputRange = [
    (index - 1) * ITEM_WIDTH,
    index * ITEM_WIDTH,
    (index + 1) * ITEM_WIDTH,
  ];

  const animatedStyle = useAnimatedStyle(() => {
    // 3D Wheeler Effect Math
    const scale = interpolate(scrollX.value, inputRange, [0.85, 1, 0.85], 'clamp');
    const opacity = interpolate(scrollX.value, inputRange, [0.4, 1, 0.4], 'clamp');
    const translateY = interpolate(scrollX.value, inputRange, [30, 0, 30], 'clamp');
    const rotateY = interpolate(scrollX.value, inputRange, [15, 0, -15], 'clamp');

    return {
      opacity,
      transform: [
        { perspective: 800 },
        { translateY },
        { scale },
        { rotateY: `${rotateY}deg` }, // True horizontal wheeler rotation
      ],
    };
  });

  const isDownloading = downloadingBookId === book._id;

  return (
    <Animated.View style={[{ width: ITEM_WIDTH }, animatedStyle]}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => onPress(book._id)}>
        <GlassCard style={[styles.courseCard, { backgroundColor: theme.isDark ? 'rgba(20, 40, 30, 0.6)' : 'rgba(50, 120, 80, 0.4)' }]} opacity={0.15}>
          {/* Header Row - Language Badge + Pages Count */}
          <View style={styles.cardHeader}>
            <View style={[styles.languageBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.languageText}>{book.language?.toUpperCase() || 'ENGLISH'}</Text>
            </View>
            {book.pages && (
              <Text style={[styles.pagesCount, { color: theme.text.secondary }]}>
                {book.pages} pgs
              </Text>
            )}
          </View>

          {/* Book Cover Image */}
          <View style={styles.bookCoverBox}>
            <Text style={styles.bookCoverEmoji}>📚</Text>
          </View>

          {/* Title */}
          <Text style={[styles.bookTitle, { color: theme.text.primary }]} numberOfLines={2}>
            {book.title}
          </Text>

          {/* Author */}
          <Text style={[styles.authorText, { color: theme.text.secondary }]} numberOfLines={1}>
            📚 {book.author || 'Unknown Author'}
          </Text>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />

          {/* Stats Row - Pages, Format, Rating */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Pages</Text>
              <Text style={[styles.statValue, { color: theme.text.primary }]}>
                {book.pages || '—'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Format</Text>
              <Text style={[styles.statValue, { color: theme.text.primary }]}>PDF</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Rating</Text>
              <Text style={[styles.statValue, { color: theme.text.primary }]}>4.8</Text>
            </View>
          </View>

          {/* Download Button */}
          <TouchableOpacity
            onPress={() => onPress(book._id)}
            disabled={isDownloading}
            style={[styles.downloadButton, { backgroundColor: theme.primary }]}
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.downloadButtonText}>Download</Text>
            )}
          </TouchableOpacity>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );
});

AnimatedBookCard.displayName = 'AnimatedBookCard';

const BookScreen = () => {
  const { theme } = useTheme();
  const [bookNames, setBookNames] = useState<BookName[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<BookName[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingBookId, setDownloadingBookId] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);
  const { getAllBooks, getBookPdf } = useLearningMaterials();
  
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

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

  return (
    <ThemedContainer>
      <View style={styles.container}>
        {/* Header with Video Icon */}
        <View style={styles.header}>
           <TouchableOpacity onPress={() => push('VideoLibraryScreen')}>
              <Video size={22} color={theme.text.primary} />
           </TouchableOpacity>
           <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Digital Library</Text>
           <TouchableOpacity onPress={() => setShowSearchBar(!showSearchBar)}>
              <Search size={22} color={theme.text.primary} />
           </TouchableOpacity>
        </View>

        {/* Search Bar */}
        {showSearchBar && (
             <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.searchWrap}>
                <View style={[styles.searchBar, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                   <Search size={18} color={theme.text.secondary} />
                   <TextInput 
                      placeholder="Search books..." 
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      style={[styles.input, { color: theme.text.primary }]}
                      value={searchQuery}
                      onChangeText={handleSearch}
                   />
                   {searchQuery.length > 0 && (
                       <TouchableOpacity onPress={() => handleSearch('')}>
                          <X size={18} color={theme.text.secondary} />
                       </TouchableOpacity>
                   )}
                </View>
             </Animated.View>
        )}

        {isInitialLoading ? (
            <View style={styles.center}>
               <ActivityIndicator size="large" color={theme.primary} />
               <Animated.Text
                  entering={FadeInDown.delay(200).duration(400)}
                  style={[styles.loadingText, { color: theme.primary }]}
               >
                  Loading Library...
               </Animated.Text>
            </View>
        ) : (
            <View style={styles.wheelerContainer}>
              {filteredBooks.length === 0 ? (
                <Animated.View entering={FadeIn.delay(300).duration(400)} style={styles.center}>
                  <Text style={[styles.emptyText, { color: theme.text.secondary }]}>
                    {searchQuery ? 'No books found matching your search' : 'No books available'}
                  </Text>
                </Animated.View>
              ) : (
                <Animated.FlatList
                  data={filteredBooks}
                  keyExtractor={item => item._id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={ITEM_WIDTH}
                  decelerationRate="fast"
                  bounces={false}
                  onScroll={scrollHandler}
                  scrollEventThrottle={16}
                  contentContainerStyle={{ paddingHorizontal: SPACING, alignItems: 'center' }}
                  renderItem={({ item, index }) => (
                    <AnimatedBookCard
                      book={item}
                      index={index}
                      theme={theme}
                      downloadingBookId={downloadingBookId}
                      onPress={handleBookSelect}
                      scrollX={scrollX}
                    />
                  )}
                />
              )}
            </View>
        )}

        {/* Bottom Navigation Bar */}
        <BottomNavigationBar backgroundColor={theme.componentBackground[0]} currentScreen="BookScreen" />
      </View>
    </ThemedContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Manrope',
    letterSpacing: 1,
  },
  searchWrap: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 10,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Manrope',
  },
  wheelerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  courseCard: {
    height: 420,
    marginHorizontal: 8,
    padding: 16,
    borderRadius: 20,
    justifyContent: 'space-between',
    flexDirection: 'column',
  },

  // New Card Header - Language Badge + Pages
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  languageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  languageText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  pagesCount: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },

  // Book Cover Image
  bookCoverBox: {
    width: '100%',
    height: 140,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  bookCoverEmoji: {
    fontSize: 60,
  },

  // Title
  bookTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    lineHeight: 24,
    marginBottom: 6,
  },

  // Author
  authorText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    marginBottom: 12,
  },

  // Divider
  divider: {
    height: 1,
    marginVertical: 12,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },

  // Download Button
  downloadButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  exploreVideoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  exploreLinkText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default BookScreen;
