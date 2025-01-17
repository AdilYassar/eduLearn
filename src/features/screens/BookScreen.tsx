import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios'; // For API calls
import RNFS from 'react-native-fs'; // For file handling
import FileViewer from 'react-native-file-viewer'; // For opening files
import { BASE_URL } from '@service/config';

interface Book {
  _id: string;
  title: string;
  author: string;
  publishedDate: string;
  pages: number;
  genre: string;
  language: string;
  pdf: string; // Base64-encoded PDF
}

const BookScreen = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch books from API
  const fetchBooks = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/books`
      );
      if (response.status === 200) {
        setBooks(response.data.data);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to fetch books');
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      Alert.alert('Error', 'An error occurred while fetching books');
    } finally {
      setLoading(false);
    }
  };

  // Save and open PDF using react-native-fs
  const displayPdf = async (base64Pdf: string, title: string) => {
    try {
      const path = `${RNFS.DocumentDirectoryPath}/${title}.pdf`;
      const pdfData = atob(base64Pdf); // Decode Base64 to binary data

      // Save the PDF to the file system
      await RNFS.writeFile(path, pdfData, 'ascii');
      console.log(`PDF saved at ${path}`);

      // Open the PDF
      await FileViewer.open(path, { showOpenWithDialog: true });
    } catch (error) {
      console.error('Error downloading or opening PDF:', error);
      Alert.alert('Error', 'Failed to download or open PDF');
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading Books...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {books.map((book) => (
        <View key={book._id} style={styles.bookCard}>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.detail}>Author: {book.author}</Text>
          <Text style={styles.detail}>
            Published: {new Date(book.publishedDate).toDateString()}
          </Text>
          <Text style={styles.detail}>Pages: {book.pages}</Text>
          <Text style={styles.detail}>Genre: {book.genre}</Text>
          <Text style={styles.detail}>Language: {book.language}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => displayPdf(book.pdf, book.title)}
          >
            <Text style={styles.buttonText}>View PDF</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  bookCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
  },
  detail: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 6,
  },
  button: {
    marginTop: 12,
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  loadingText: {
    fontSize: 18,
    color: '#3498db',
    marginTop: 12,
    fontWeight: '500',
  },
});

export default BookScreen;
