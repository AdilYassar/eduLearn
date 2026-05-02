import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
  Linking,
} from 'react-native';
import FileViewer from 'react-native-file-viewer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useAppTheme } from '../../../context/ThemeContext';
import { getBooks, createBook, deleteBook, getBookDetails, uploadBook } from '../../../redux/reducers/adminSlice';
import { AppDispatch, RootState } from '../../../redux/store';
import AdminHeader from '../ui/AdminHeader';
import { AdminCard } from '../ui/AdminCard';
import { AdminEmptyState, AdminErrorBanner } from '../ui/AdminEmpty';
import AdminInput from '../ui/AdminInput';
import AdminButton from '../ui/AdminButton';
import { Book as BookIcon, Trash2, Plus, Upload, X, FileText, ChevronLeft, ChevronRight, MoreVertical, Eye } from 'lucide-react-native';
import { pick, isCancel } from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useAnimatedScrollHandler,
  interpolate,
} from 'react-native-reanimated';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.72;
const SPACING = (width - ITEM_WIDTH) / 2;

interface Props {
  navigation: any;
}

const AnimatedAdminBookCard = React.memo(({
  item,
  index,
  theme,
  styles,
  onOpenOptions,
  onReadBook,
  scrollX,
  isReading,
}: {
  item: any;
  index: number;
  theme: any;
  styles: any;
  onOpenOptions: (item: any) => void;
  onReadBook: (item: any) => void;
  scrollX: Animated.SharedValue<number>;
  isReading: boolean;
}) => {
  const inputRange = [
    (index - 1) * ITEM_WIDTH,
    index * ITEM_WIDTH,
    (index + 1) * ITEM_WIDTH,
  ];

  const animatedStyle = useAnimatedStyle(() => {
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
        { rotateY: `${rotateY}deg` },
      ],
    };
  });

  return (
    <Animated.View style={[{ width: ITEM_WIDTH }, animatedStyle]}>
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={() => onReadBook(item)}
      >
        <AdminCard style={styles.courseCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.languageBadge, { backgroundColor: '#5D4BA3' }]}>
              <Text style={styles.languageText}>{item.language?.toUpperCase() || 'EN'}</Text>
            </View>
            {item.pages && (
              <Text style={[styles.pagesCount, { color: theme.dark ? '#cac4d3' : '#797582' }]}>
                {item.pages} pgs
              </Text>
            )}
          </View>

          <View style={styles.bookCoverBox}>
            {isReading ? (
              <ActivityIndicator size="large" color="#5D4BA3" />
            ) : (
              <Text style={styles.bookCoverEmoji}>📚</Text>
            )}
          </View>

          <View style={styles.titleRow}>
             <Text style={[styles.bookTitle, { color: theme.dark ? '#fdf7ff' : '#2D2560' }]} numberOfLines={2}>
               {item.title}
             </Text>
             <TouchableOpacity onPress={() => onOpenOptions(item)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <MoreVertical size={20} color={theme.dark ? '#cac4d3' : '#797582'} />
             </TouchableOpacity>
          </View>

          <Text style={[styles.authorText, { color: theme.dark ? '#cac4d3' : '#797582' }]} numberOfLines={1}>
            ✏️ {item.author || 'Unknown Author'}
          </Text>

          <View style={[styles.divider, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.dark ? '#cac4d3' : '#797582' }]}>Genre</Text>
              <Text style={[styles.statValue, { color: theme.dark ? '#fdf7ff' : '#2D2560' }]} numberOfLines={1}>
                {item.genre || '—'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.dark ? '#cac4d3' : '#797582' }]}>Format</Text>
              <Text style={[styles.statValue, { color: theme.dark ? '#fdf7ff' : '#2D2560' }]}>PDF</Text>
            </View>
          </View>
        </AdminCard>
      </TouchableOpacity>
    </Animated.View>
  );
});

const AdminBookLibraryScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useAppTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { books, isLoading, error, pagination } = useSelector(
    (state: RootState) => state.admin
  );

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [uploadData, setUploadData] = useState({
    title: '',
    author: '',
    genre: '',
    pages: '',
    language: 'English',
    pdf: null as any,
  });
  const [readingBookId, setReadingBookId] = useState<string | null>(null);

  const scrollX = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  useEffect(() => {
    fetchBooks(1);
  }, [dispatch]);

  const fetchBooks = (page: number) => {
    dispatch(getBooks({ page, limit: 10 }));
  };

  const handlePageChange = (newPage: number) => {
    const totalPages = Math.ceil((pagination.total || 0) / (pagination.limit || 10));
    if (newPage >= 1 && newPage <= totalPages) {
      fetchBooks(newPage);
    }
  };

  const handlePickDocument = async () => {
    try {
      const [res] = await pick({
        type: ['application/pdf'],
      });
      setUploadData({ ...uploadData, pdf: res });
    } catch (err) {
      if (!isCancel(err)) {
        Alert.alert('Error', 'Failed to pick document');
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadData.title || !uploadData.author || !uploadData.genre || !uploadData.pdf) {
      Alert.alert('Error', 'Title, Author, Genre, and PDF file are required.');
      return;
    }

    try {
      console.log('📦 [UI] Starting Google Drive cloud upload...');
      
      const formData = new FormData();
      formData.append('title', uploadData.title);
      formData.append('author', uploadData.author);
      formData.append('genre', uploadData.genre);
      formData.append('pages', uploadData.pages || '0');
      formData.append('language', uploadData.language);
      formData.append('publishedDate', new Date().toISOString());

      // Correctly format the file for multipart/form-data
      const fileUri = uploadData.pdf.uri;
      const fileName = uploadData.pdf.name || 'document.pdf';
      
      formData.append('pdf', {
        uri: fileUri,
        name: fileName,
        type: 'application/pdf',
      } as any);

      await dispatch(uploadBook(formData)).unwrap();
      Alert.alert('Success', 'Book uploaded to Google Drive successfully!');
      setShowUploadModal(false);
      setUploadData({ title: '', author: '', genre: '', pages: '', language: 'English', pdf: null });
      fetchBooks(1);
    } catch (err) {
      console.error('❌ [UI] Cloud upload failed:', err);
      Alert.alert('Cloud Upload Failed', typeof err === 'string' ? err : 'Check your cloud configuration and network.');
    }
  };

  const handleDeleteBook = (id: string) => {
    Alert.alert('Delete Book', 'Are you sure? This will remove the book and its binary data permanently.', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: () => dispatch(deleteBook(id)) 
      },
    ]);
  };

  const handleReadBook = async (book: any) => {
    const bookId = book._id || book.id;
    if (!bookId) return;

    try {
      setReadingBookId(bookId);
      
      // Fetch full book details (including PDF) from server
      const result = await dispatch(getBookDetails(bookId)).unwrap();
      
      console.log('📖 [BookDebug] Result keys:', Object.keys(result));
      if (result.data) console.log('📖 [BookDebug] Result.data keys:', Object.keys(result.data));

      // Be extremely flexible with response structure
      let fullBook = result.data || result.book || result;
      if (Array.isArray(fullBook) && fullBook.length > 0) fullBook = fullBook[0];
      if (result.data && Array.isArray(result.data) && result.data.length > 0) fullBook = result.data[0];

      // PRIORITIZE pdfUrl from Google Drive
      const pdfData = 
        fullBook.pdfUrl || 
        result.pdfUrl || 
        result.pdf || 
        fullBook.pdf || 
        result.base64Pdf || 
        fullBook.base64Pdf || 
        (result.data && result.data.pdf);

      if (!pdfData) {
        const availableFields = Object.keys(fullBook).join(', ');
        Alert.alert(
          'Not Available', 
          `This book does not have a recognizable PDF field. Found fields: ${availableFields}. Please check backend field naming.`
        );
        return;
      }

      if (pdfData.startsWith('http')) {
        // Direct Google Drive Link or URL
        await Linking.openURL(pdfData);
      } else {
        // Base64 handling
        const cleanTitle = (fullBook.title || book.title).replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filePath = `${RNFS.CachesDirectoryPath}/${cleanTitle}.pdf`;
        
        // Remove data URL prefix if present
        const cleanBase64 = pdfData.replace(/^data:application\/pdf;base64,/, '');
        
        await RNFS.writeFile(filePath, cleanBase64, 'base64');
        await FileViewer.open(filePath, { showOpenWithDialog: true });
      }
    } catch (err: any) {
      console.error('PDF Open Error:', err);
      Alert.alert('Error', err || 'Could not fetch or open the PDF. Please ensure you have a PDF reader installed.');
    } finally {
      setReadingBookId(null);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.dark ? '#1c1b21' : '#F8F6FD',
    },
    wheelerContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    courseCard: {
      height: 380,
      marginHorizontal: 8,
      padding: 16,
      borderRadius: 20,
      justifyContent: 'space-between',
      flexDirection: 'column',
    },
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
      color: '#FFF',
      letterSpacing: 0.5,
    },
    pagesCount: {
      fontSize: 12,
      fontWeight: '500',
    },
    bookCoverBox: {
      width: '100%',
      height: 140,
      backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : '#EDE5F8',
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    bookCoverEmoji: {
      fontSize: 60,
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    bookTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: '700',
      color: theme.dark ? '#fdf7ff' : '#2D2560',
      marginBottom: 6,
      marginRight: 8,
    },
    authorText: {
      fontSize: 12,
      color: theme.dark ? '#cac4d3' : '#797582',
      fontWeight: '500',
      marginBottom: 12,
    },
    divider: {
      height: 1,
      marginVertical: 12,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 8,
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statLabel: {
      fontSize: 11,
      fontWeight: '500',
      marginBottom: 4,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '700',
    },
    moreButton: {
      width: 30,
      height: 30,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.dark ? '#1c1b21' : '#ffffff',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      paddingBottom: 32,
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.dark ? '#fdf7ff' : '#2D2560',
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.dark ? '#312f36' : '#F8F6FD',
      justifyContent: 'center',
      alignItems: 'center',
    },
    pickerButton: {
      height: 80,
      borderRadius: 16,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: theme.dark ? '#484551' : '#EDE5F8',
      backgroundColor: theme.dark ? '#25232a' : '#F8F6FD',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    pickerText: {
      marginTop: 8,
      fontSize: 13,
      fontWeight: '600',
      color: theme.dark ? '#cac4d3' : '#797582',
    },
    selectedFile: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#EDE5F8',
      padding: 10,
      borderRadius: 10,
      marginBottom: 12,
    },
    selectedFileName: {
      flex: 1,
      fontSize: 12,
      fontWeight: '700',
      color: '#5D4BA3',
      marginLeft: 8,
    },
    hintText: {
      fontSize: 11,
      color: '#797582',
      marginBottom: 12,
      marginTop: -4,
    },
    paginationContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 16,
      gap: 16,
    },
    pageButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.dark ? '#312f36' : '#ffffff',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#2D2560',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    pageText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.dark ? '#fdf7ff' : '#2D2560',
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(93,75,163,0.08)',
    },
    optionIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.dark ? '#312f36' : '#ffdad6',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    optionText: {
      fontSize: 15,
      fontWeight: '600',
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <AdminHeader
        title="Book Library"
        subtitle="Manage academic PDF documents"
        showBack
        onBackPress={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={() => setShowUploadModal(true)}
            style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#5D4BA3', justifyContent: 'center', alignItems: 'center', shadowColor: '#5D4BA3', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}
          >
            <Plus size={20} color="#ffffff" />
          </TouchableOpacity>
        }
      />

      {error ? <View style={{paddingHorizontal: 20, paddingVertical: 10}}><AdminErrorBanner message={error} /></View> : null}

      <View style={styles.wheelerContainer}>
        <Animated.FlatList
          data={books}
          renderItem={({ item, index }) => (
              <AnimatedAdminBookCard
                item={item}
                index={index}
                theme={theme}
                styles={styles}
                onOpenOptions={(b) => {
                  setSelectedBook(b);
                  setOptionsVisible(true);
                }}
                onReadBook={(b) => handleReadBook(b)}
                scrollX={scrollX}
                isReading={readingBookId === (item._id || item.id)}
              />
          )}
          keyExtractor={(item) => String(item._id || item.id || Math.random())}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          bounces={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingHorizontal: SPACING, alignItems: 'center' }}
          ListEmptyComponent={
            <View style={{ padding: 20, marginTop: 40, width: width }}>
              <AdminEmptyState
                title="Library Empty"
                description="No academic books found. Upload a PDF document to begin."
                icon={<BookIcon size={64} color="#5D4BA3" />}
              />
            </View>
          }
        />
      </View>
      
      {books && books.length > 0 && pagination && pagination.total > (pagination.limit || 10) && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity 
            style={styles.pageButton}
            onPress={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            <ChevronLeft size={20} color={pagination.page <= 1 ? '#cac4d3' : '#5D4BA3'} />
          </TouchableOpacity>
          <Text style={styles.pageText}>
            Page {pagination.page} of {Math.ceil(pagination.total / (pagination.limit || 10))}
          </Text>
          <TouchableOpacity 
            style={styles.pageButton}
            onPress={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= Math.ceil(pagination.total / (pagination.limit || 10))}
          >
            <ChevronRight size={20} color={pagination.page >= Math.ceil(pagination.total / (pagination.limit || 10)) ? '#cac4d3' : '#5D4BA3'} />
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={showUploadModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Document</Text>
              <TouchableOpacity onPress={() => setShowUploadModal(false)} style={styles.closeButton}>
                <X size={20} color={theme.dark ? '#cac4d3' : '#797582'} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity style={styles.pickerButton} onPress={handlePickDocument}>
                <Upload size={32} color="#5D4BA3" />
                <Text style={styles.pickerText}>Select PDF Document</Text>
              </TouchableOpacity>

              {uploadData.pdf && (
                <View style={styles.selectedFile}>
                  <FileText size={20} color="#5D4BA3" />
                  <Text style={styles.selectedFileName} numberOfLines={1}>
                    {uploadData.pdf.name || 'Document selected'}
                  </Text>
                  <TouchableOpacity onPress={() => setUploadData({ ...uploadData, pdf: null })}>
                    <X size={16} color="#5D4BA3" />
                  </TouchableOpacity>
                </View>
              )}

              <AdminInput
                label="Book Title"
                placeholder="e.g. Mastering React Native"
                value={uploadData.title}
                onChangeText={(text) => setUploadData({ ...uploadData, title: text })}
              />

              <AdminInput
                label="Author"
                placeholder="e.g. John Doe"
                value={uploadData.author}
                onChangeText={(text) => setUploadData({ ...uploadData, author: text })}
              />

              <AdminInput
                label="Genre"
                placeholder="e.g. Technology"
                value={uploadData.genre}
                onChangeText={(text) => setUploadData({ ...uploadData, genre: text })}
              />
              <Text style={styles.hintText}>Must exactly match backend (e.g. Technology, Science, Mathematics)</Text>

              <AdminInput
                label="Page Count"
                placeholder="e.g. 350"
                value={uploadData.pages}
                keyboardType="numeric"
                onChangeText={(text) => setUploadData({ ...uploadData, pages: text })}
              />

              <AdminButton
                title={isLoading ? "Uploading to Cloud..." : "Publish to Google Drive"}
                onPress={handleUpload}
                variant="primary"
                style={{ marginTop: 24, marginBottom: 40 }}
                disabled={isLoading}
                icon={isLoading ? <ActivityIndicator color="#fff" size="small" /> : <Upload size={20} color="#fff" />}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Options Modal */}
      <Modal
        visible={optionsVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setOptionsVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOptionsVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Options</Text>
              <TouchableOpacity onPress={() => setOptionsVisible(false)} style={styles.closeButton}>
                <X size={20} color={theme.dark ? '#cac4d3' : '#797582'} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.optionItem}
              activeOpacity={0.7}
              onPress={() => {
                setOptionsVisible(false);
                if (selectedBook) {
                  setTimeout(() => handleReadBook(selectedBook), 300);
                }
              }}
            >
              <View style={[styles.optionIconContainer, { backgroundColor: theme.dark ? '#312f36' : '#F0EEFA' }]}>
                <Eye size={18} color="#5D4BA3" />
              </View>
              <Text style={[styles.optionText, { color: theme.dark ? '#fdf7ff' : '#2D2560' }]}>Read Book</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionItem}
              activeOpacity={0.7}
              onPress={() => {
                setOptionsVisible(false);
                if (selectedBook) {
                  setTimeout(() => handleDeleteBook(selectedBook._id || selectedBook.id), 300);
                }
              }}
            >
              <View style={styles.optionIconContainer}>
                <Trash2 size={18} color="#ba1a1a" />
              </View>
              <Text style={[styles.optionText, { color: '#ba1a1a' }]}>Delete Book</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default AdminBookLibraryScreen;
