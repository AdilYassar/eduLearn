import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Colors } from '../../utils/Constants';
import { useThemedStyles } from '../../context/ThemeContext';
import { ThemedText, ThemedCard } from './ThemedComponents';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface QuestionCardProps {
  question: string;
  questionNumber: number;
  totalQuestions: number;
  questionType: string;
  options?: string[];
  selectedAnswer: string | undefined;
  correctAnswer?: string;
  isSubmitted: boolean;
  isTrueFalse: boolean;
  onSelectAnswer: (answer: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  questionType,
  options,
  selectedAnswer,
  correctAnswer,
  isSubmitted,
  isTrueFalse,
  onSelectAnswer,
}) => {
  const theme = useThemedStyles();
  const isShortAnswer = questionType === 'text' || questionType === 'short-answer';
  
  // Generate default options for True/False if missing
  const displayOptions = isTrueFalse && (!options || options.length === 0) 
    ? ['True', 'False'] 
    : options;
  
  const getOptionStyle = (originalOption: string) => {
    const normalizedAnswer = selectedAnswer?.toLowerCase();
    const normalizedOption = originalOption.toLowerCase();
    const normalizedCorrect = correctAnswer?.toLowerCase();
    
    const isSelected = normalizedAnswer === normalizedOption;
    const isCorrect = normalizedOption === normalizedCorrect;

    if (isSubmitted) {
      if (isSelected && isCorrect) {
        return [styles.optionButton, styles.selectedCorrect];
      } else if (isSelected && !isCorrect) {
        return [styles.optionButton, styles.selectedIncorrect];
      } else if (isCorrect) {
        return [styles.optionButton, styles.correctAnswerHighlight];
      }
      return [styles.optionButton, styles.disabledOption];
    } else if (isSelected) {
      return [styles.optionButton, styles.selectedOption];
    }
    return styles.optionButton;
  };

  const getOptionIconStyle = (originalOption: string) => {
    const normalizedAnswer = selectedAnswer?.toLowerCase();
    const normalizedOption = originalOption.toLowerCase();
    const normalizedCorrect = correctAnswer?.toLowerCase();
    
    const isSelected = normalizedAnswer === normalizedOption;
    const isCorrect = normalizedOption === normalizedCorrect;

    if (isSubmitted) {
      if (isSelected && isCorrect) return styles.iconCorrect;
      if (isSelected && !isCorrect) return styles.iconIncorrect;
      if (isCorrect) return styles.iconCorrect;
      return styles.iconDisabled;
    } else if (isSelected) {
      return styles.iconSelected;
    }
    return styles.iconDefault;
  };

  const getDisplayOption = (option: string) => {
    if (isTrueFalse) {
      return option.toLowerCase() === 'true' ? 'True' : 
             option.toLowerCase() === 'false' ? 'False' : option;
    }
    return option;
  };

  const getOptionIcon = (originalOption: string, index: number) => {
    const normalizedAnswer = selectedAnswer?.toLowerCase();
    const normalizedOption = originalOption.toLowerCase();
    const normalizedCorrect = correctAnswer?.toLowerCase();
    
    const isSelected = normalizedAnswer === normalizedOption;
    const isCorrect = normalizedOption === normalizedCorrect;

    if (isSubmitted) {
      if (isCorrect) return '✓';
      if (isSelected && !isCorrect) return '✕';
    }
    
    if (isTrueFalse) {
      return getDisplayOption(originalOption) === 'True' ? 'T' : 'F';
    }
    
    return String.fromCharCode(65 + index);
  };

  return (
    <ThemedCard style={styles.container}>
      {/* Compact Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.questionBadge, { backgroundColor: theme.primary }]}>
            <Text style={styles.questionBadgeText}>{questionNumber}</Text>
          </View>
          <Text style={styles.headerText}>
            of <Text style={styles.headerTextBold}>{totalQuestions}</Text>
          </Text>
        </View>
        
        {isTrueFalse && (
          <View style={styles.typePill}>
            <Text style={styles.typePillText}>T/F</Text>
          </View>
        )}
        {isShortAnswer && (
          <View style={[styles.typePill, styles.typePillShortAnswer]}>
            <Text style={styles.typePillText}>Short Answer</Text>
          </View>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${(questionNumber / totalQuestions) * 100}%`, backgroundColor: theme.primary }
          ]} 
        />
      </View>

      {/* Question */}
      <ThemedText style={styles.question}>{question}</ThemedText>

      {/* Short Answer Input */}
      {isShortAnswer ? (
        <View style={styles.shortAnswerContainer}>
          <TextInput
            style={[
              styles.shortAnswerInput,
              isSubmitted && styles.shortAnswerInputDisabled,
            ]}
            placeholder="Type your answer here..."
            placeholderTextColor="#999"
            value={selectedAnswer || ''}
            onChangeText={(text) => onSelectAnswer(text)}
            editable={!isSubmitted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {isSubmitted && correctAnswer && (
            <View style={styles.shortAnswerFeedback}>
              <Text style={styles.yourAnswerLabel}>Your Answer:</Text>
              <Text style={styles.yourAnswerText}>{selectedAnswer || 'No answer provided'}</Text>
              <Text style={styles.correctAnswerLabelShort}>Correct Answer:</Text>
              <Text style={styles.correctAnswerTextShort}>{correctAnswer}</Text>
            </View>
          )}
        </View>
      ) : (
        /* Options Grid for Multiple Choice / True-False */
        <View style={styles.optionsGrid}>
          {(!displayOptions || displayOptions.length === 0) ? (
            <Text style={styles.errorText}>No options available</Text>
          ) : (
            displayOptions.map((originalOption, index) => {
          const displayOption = getDisplayOption(originalOption);
          const icon = getOptionIcon(originalOption, index);
          
          return (
            <TouchableOpacity
              key={index}
              style={getOptionStyle(originalOption)}
              onPress={() => onSelectAnswer(originalOption)}
              disabled={isSubmitted}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIcon, getOptionIconStyle(originalOption)]}>
                <Text style={styles.optionIconText}>{icon}</Text>
              </View>
              <Text 
                style={styles.optionText}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {displayOption}
              </Text>
            </TouchableOpacity>
          );
        }))}
        </View>
      )}

      {/* Result Badge */}
      {isSubmitted && !isShortAnswer && (
        <View style={[
          styles.resultBadge,
          selectedAnswer?.toLowerCase() === correctAnswer?.toLowerCase()
            ? styles.resultCorrect
            : styles.resultIncorrect
        ]}>
          <Text style={styles.resultIcon}>
            {selectedAnswer?.toLowerCase() === correctAnswer?.toLowerCase() ? '✓' : '✕'}
          </Text>
          <Text style={styles.resultText}>
            {selectedAnswer?.toLowerCase() === correctAnswer?.toLowerCase()
              ? 'Correct!'
              : `Correct: ${correctAnswer}`}
          </Text>
        </View>
      )}
    </ThemedCard>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    paddingHorizontal: RFValue(20),
    paddingVertical: RFValue(16),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: RFValue(8),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  questionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionBadgeText: {
    color: '#fff',
    fontSize: RFValue(13),
    fontWeight: '700',
  },
  headerText: {
    fontSize: RFValue(13),
    color: '#666',
    fontWeight: '500',
  },
  headerTextBold: {
    fontWeight: '700',
    color: '#333',
  },
  typePill: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typePillText: {
    fontSize: RFValue(11),
    fontWeight: '600',
    color: '#666',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#E8E8E8',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: RFValue(20),
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  question: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: RFValue(26),
    marginBottom: RFValue(20),
  },
  optionsGrid: {
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: RFValue(12),
    padding: RFValue(14),
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 12,
  },
  selectedOption: {
    backgroundColor: '#F3F4F6',
    borderColor: '#8B5CF6',
  },
  selectedCorrect: {
    backgroundColor: '#E8F8F0',
    borderColor: '#10B981',
  },
  selectedIncorrect: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  correctAnswerHighlight: {
    backgroundColor: '#E8F8F0',
    borderColor: '#10B981',
  },
  disabledOption: {
    opacity: 0.5,
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconDefault: {
    backgroundColor: '#E0E0E0',
  },
  iconSelected: {
    backgroundColor: '#8B5CF6',
  },
  iconCorrect: {
    backgroundColor: '#10B981',
  },
  iconIncorrect: {
    backgroundColor: '#EF4444',
  },
  iconDisabled: {
    backgroundColor: '#E0E0E0',
  },
  optionIconText: {
    fontSize: RFValue(14),
    fontWeight: '700',
    color: '#fff',
  },
  optionText: {
    flex: 1,
    fontSize: RFValue(15),
    color: '#333',
    fontWeight: '500',
    lineHeight: RFValue(20),
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: RFValue(16),
    padding: RFValue(12),
    borderRadius: RFValue(12),
    gap: 8,
  },
  resultCorrect: {
    backgroundColor: '#E8F8F0',
  },
  resultIncorrect: {
    backgroundColor: '#FEF2F2',
  },
  resultIcon: {
    fontSize: RFValue(16),
    fontWeight: '700',
  },
  resultText: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#333',
  },
  typePillShortAnswer: {
    backgroundColor: '#FFF3E0',
  },
  shortAnswerContainer: {
    marginTop: RFValue(8),
  },
  shortAnswerInput: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: RFValue(12),
    padding: RFValue(16),
    fontSize: RFValue(15),
    color: '#333',
    backgroundColor: '#FAFAFA',
    minHeight: RFValue(120),
    textAlignVertical: 'top',
  },
  shortAnswerInputDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#BDBDBD',
    color: '#666',
  },
  shortAnswerFeedback: {
    marginTop: RFValue(16),
    padding: RFValue(16),
    backgroundColor: '#F5F5F5',
    borderRadius: RFValue(12),
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  yourAnswerLabel: {
    fontSize: RFValue(13),
    fontWeight: '600',
    color: '#666',
    marginBottom: RFValue(4),
  },
  yourAnswerText: {
    fontSize: RFValue(14),
    color: '#333',
    marginBottom: RFValue(12),
    fontWeight: '500',
  },
  correctAnswerLabelShort: {
    fontSize: RFValue(13),
    fontWeight: '600',
    color: '#10B981',
    marginBottom: RFValue(4),
  },
  correctAnswerTextShort: {
    fontSize: RFValue(14),
    color: '#10B981',
    fontWeight: '600',
  },
  errorText: {
    fontSize: RFValue(14),
    color: '#EF4444',
    textAlign: 'center',
    padding: RFValue(20),
  },
});

export default QuestionCard;