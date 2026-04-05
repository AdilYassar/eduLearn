import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Star, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { push } from '../../utils/Navigation';

const QuizChallenge = () => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Daily Challenge</Text>
      </View>

      <TouchableOpacity activeOpacity={0.9} onPress={() => push('QuizScreen')}>
        <View style={[styles.card, { backgroundColor: 'rgba(179, 136, 255, 0.06)', borderColor: 'rgba(179, 136, 255, 0.1)' }]}>
          
          <View style={styles.contentLeft}>
            <Text style={[styles.title, { color: theme.text.primary }]}>Ready for a quiz?</Text>
            
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => push('QuizScreen')}>
              <Text style={styles.buttonText}>Start Quiz</Text>
              <ChevronRight size={14} color="#000" style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.contentRight}>
            <View style={[styles.starRing, { borderColor: 'rgba(179, 136, 255, 0.3)' }]}>
              <View style={[styles.starInner, { backgroundColor: 'transparent' }]}>
                <Star size={24} color={theme.primary} />
              </View>
            </View>
          </View>

        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  card: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentLeft: {
    flex: 1,
  },
  subtext: {
    fontSize: 10,
    marginBottom: 6,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentRight: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  starRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  starInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QuizChallenge;
