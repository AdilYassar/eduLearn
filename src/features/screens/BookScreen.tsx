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
        'https://adef-101-53-234-27.ngrok-free.app/api/books'
      ); // Replace with your baseURL setup
      if (response.status === 200) {
        setBooks(response.data.data); // Assuming the API response format
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
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading Books...</Text>
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
    padding: 16,
  },
  bookCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detail: {
    fontSize: 14,
    marginBottom: 4,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BookScreen;
