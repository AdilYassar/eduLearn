/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';

import { BASE_URL } from '../../service/config';
const THEORY_API = '/theory';

interface Chapter {
  title: string;
}

interface Theory {
  courseTitle: string;
  description: string;
  imageUrl: string;
  chapters: Chapter[];
}

const TheoryScreen = () => {
  type TheoryScreenRouteProp = RouteProp<{ params: { courseId: string } }, 'params'>;
  const route = useRoute<TheoryScreenRouteProp>();
  const { courseId } = route.params;

  const [theory, setTheory] = useState<Theory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTheory();
  }, []);

  const fetchTheory = async () => {
    try {
      const response = await fetch(`${BASE_URL}${THEORY_API}/${courseId}`);
      if (!response.ok) {
        console.error('Failed to fetch theory. Status code:', response.status);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setTheory(data.theory);
    } catch (error) {
      console.error('Error fetching theory:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <LottieView
            source={require('../../assets/animations/student.json')}
            autoPlay
            loop
            style={styles.loadingAnimation}
          />
          <Text style={styles.loadingText}>Fetching Course Details...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.theoryContainer}>
          {theory ? (
            <>
              <View style={styles.courseHeader}>
                <Image
                  source={{ uri: theory.imageUrl }}
                  style={styles.courseImage}
                />
                <Text style={styles.courseTitle}>{theory.courseTitle}</Text>
                <Text style={styles.description}>{theory.description}</Text>
              </View>
              <Text style={styles.chapterTitle}>Chapters</Text>
              {theory.chapters.map((chapter, index) => (
                <TouchableOpacity key={index} style={styles.chapterCard}>
                  <View style={styles.chapterContent}>
                    <Icon name="book" size={20} color="#00695c" style={styles.chapterIcon} />
                    <Text style={styles.chapterText}>
                      Chapter {index + 1}: {chapter.title}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={24} color="#00695c" />
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <Text style={styles.noTheoryText}>
              No theory available for this course.
            </Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e9',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
  },
  loadingAnimation: {
    width: 200,
    height: 200,
  },
  loadingText: {
    fontSize: 16,
    color: '#4caf50',
    marginTop: 10,
    fontWeight: '500',
  },
  theoryContainer: {
    padding: 16,
  },
  courseHeader: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  courseImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00695c',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#4f4f4f',
    textAlign: 'center',
    lineHeight: 22,
  },
  chapterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#004d40',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  chapterCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chapterContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chapterIcon: {
    marginRight: 8,
  },
  chapterText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  noTheoryText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#757575',
    marginTop: 20,
  },
});

export default TheoryScreen;
