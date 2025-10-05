import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { navigate } from '@utils/Navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface QuizChallengeProps {
  bgColor?: string;
}

const QuizChallenge: React.FC<QuizChallengeProps> = ({ bgColor = '#fff' }) => {
  const handleStartQuiz = () => {
    navigate('QuizScreen');
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.challengeCard}>
        <View style={styles.contentLeft}>
          <Text style={styles.title}>Challenge{'\n'}Yourself?</Text>
          
          <TouchableOpacity style={styles.startButton} onPress={handleStartQuiz}>
            <Text style={styles.buttonText}>Start Quiz</Text>
            <Icon name="arrow-forward" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.contentRight}>
          <Image
            source={require('@assets/animations/student.gif')}
            style={styles.studentGif}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  challengeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 140,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  contentLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  contentRight: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    width: 150,
    height: 150,
    overflow: 'hidden',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
    lineHeight: 32,
  },
  startButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginRight: 8,
    fontFamily: 'Inter-SemiBold',
  },
  studentGif: {
    width: 180,
    height: 180,
  },
});

export default QuizChallenge;
