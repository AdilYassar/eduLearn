/* eslint-disable no-dupe-keys */
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

const THEORY_API = '/api/theory';

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
      const response = await fetch(`https://95a6-101-53-234-27.ngrok-free.app${THEORY_API}/${courseId}`);
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
                    <Icon name="book" size={24} color="#FF6347" style={styles.chapterIcon} />
                    <Text style={styles.chapterText}>
                      Chapter {index + 1}: {chapter.title}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={28} color="#FF6347" />
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
    backgroundColor: '#F4F7FB', // Soft light blue background
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F7FB',
  },
  loadingAnimation: {
    width: 250,
    height: 250,
  },
  loadingText: {
    fontSize: 18,
    color: '#FF6347',
    marginTop: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  theoryContainer: {
    paddingBottom: 30,
  },
  courseHeader: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 6,
    marginBottom: 30,
  },
  courseImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  courseTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'HelveticaNeue-Bold',
  },
  description: {
    fontSize: 18,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'HelveticaNeue',
  },
  chapterTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 20,
    paddingLeft: 10,
  },
  chapterCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  chapterContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chapterIcon: {
    marginRight: 16,
  },
  chapterText: {
    fontSize: 18,
    color: '#34495E',
    fontWeight: '500',
    fontFamily: 'HelveticaNeue',
  },
  noTheoryText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#BDC3C7',
    marginTop: 20,
  },
});

export default TheoryScreen;
