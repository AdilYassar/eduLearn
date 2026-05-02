import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { 
  Star, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  ArrowRight,
  Smile,
  Frown,
  Meh,
  Heart,
  Zap
} from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { RFValue } from 'react-native-responsive-fontsize';
import { ThemedContainer, ThemedText, ThemedHeader, GlassCard, ThemedButton } from '../../components/ui/ThemedComponents';
import { useTheme } from '../../context/ThemeContext';
import { goBack } from '../../utils/Navigation';
import { feedbackService } from '../../service/feedbackService';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'Bug', label: 'Bug Report', icon: Zap, color: '#EF4444' },
  { id: 'Suggestion', label: 'Suggestion', icon: Smile, color: '#10B981' },
  { id: 'Praise', label: 'Praise', icon: Heart, color: '#EC4899' },
  { id: 'Other', label: 'Other', icon: MessageSquare, color: '#6366F1' },
];

const RATING_LABELS = ['', 'Terrible', 'Bad', 'Okay', 'Good', 'Amazing!'];

const FeedbackScreen = () => {
  const { theme } = useTheme();
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState('Suggestion');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const ratingAnim = useSharedValue(0);
  const successAnim = useSharedValue(0);

  useEffect(() => {
    ratingAnim.value = withSpring(rating);
  }, [rating]);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    try {
      await feedbackService.submitFeedback({
        rating,
        category,
        comment: comment.trim(),
      });
      setSubmitted(true);
      successAnim.value = withSpring(1);
    } catch (error: any) {
      Alert.alert('Submission Error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const emojiStyle = useAnimatedStyle(() => {
    const scale = interpolate(ratingAnim.value, [0, 5], [0.8, 1.2], Extrapolate.CLAMP);
    return { transform: [{ scale }] };
  });

  const RatingIcon = () => {
    if (rating <= 2 && rating > 0) return <Frown size={64} color="#EF4444" strokeWidth={1.5} />;
    if (rating === 3) return <Meh size={64} color="#F59E0B" strokeWidth={1.5} />;
    if (rating >= 4) return <Smile size={64} color="#10B981" strokeWidth={1.5} />;
    return <Smile size={64} color={theme.text.secondary + '30'} strokeWidth={1.5} />;
  };

  if (submitted) {
    return (
      <ThemedContainer style={styles.successContainer}>
        <Animated.View style={[styles.successContent, { opacity: successAnim }]}>
          <View style={[styles.successIconOuter, { borderColor: theme.primary + '20' }]}>
            <View style={[styles.successIconInner, { backgroundColor: theme.primary }]}>
              <CheckCircle2 size={48} color="#FFF" />
            </View>
          </View>
          <ThemedText weight="bold" size="xlarge" style={styles.successTitle}>
            We Value Your Feedback!
          </ThemedText>
          <ThemedText variant="secondary" style={styles.successSubtitle}>
            Your insights are crucial to building the future of EduLearn. Our team will review this shortly.
          </ThemedText>
          <TouchableOpacity 
            style={[styles.doneButton, { backgroundColor: theme.primary }]}
            onPress={() => goBack()}
          >
            <ThemedText weight="bold" style={{ color: '#FFF' }}>Back to Profile</ThemedText>
            <ArrowRight size={20} color="#FFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </Animated.View>
      </ThemedContainer>
    );
  }

  return (
    <ThemedContainer>
      <ThemedHeader title="Feedback" showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* 1. RATING SECTION */}
          <GlassCard style={styles.ratingCard}>
            <Animated.View style={[styles.emojiContainer, emojiStyle]}>
              <RatingIcon />
            </Animated.View>
            <ThemedText weight="bold" size="large" style={styles.ratingLabel}>
              {rating > 0 ? RATING_LABELS[rating] : 'How was your experience?'}
            </ThemedText>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  activeOpacity={0.6}
                  style={styles.starTouch}
                >
                  <Star
                    size={36}
                    color={star <= rating ? '#FFD700' : theme.text.secondary + '20'}
                    fill={star <= rating ? '#FFD700' : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>

          {/* 2. CATEGORY SECTION */}
          <ThemedText weight="bold" style={styles.sectionTitle}>What's this about?</ThemedText>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((item) => {
              const isActive = category === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.categoryPill,
                    { 
                      backgroundColor: isActive ? item.color : theme.card,
                      borderColor: isActive ? item.color : theme.border,
                    }
                  ]}
                  onPress={() => setCategory(item.id)}
                >
                  <item.icon size={16} color={isActive ? '#FFF' : theme.text.secondary} />
                  <ThemedText 
                    weight="semibold" 
                    size="small" 
                    style={[styles.categoryText, { color: isActive ? '#FFF' : theme.text.primary }]}
                  >
                    {item.label}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 3. INPUT SECTION */}
          <ThemedText weight="bold" style={styles.sectionTitle}>Share your thoughts</ThemedText>
          <GlassCard style={styles.inputWrapper}>
            <TextInput
              style={[styles.textInput, { color: theme.text.primary }]}
              placeholder="Tell us what you love or what needs improvement..."
              placeholderTextColor={theme.text.secondary + '60'}
              multiline
              numberOfLines={6}
              value={comment}
              onChangeText={setComment}
              textAlignVertical="top"
            />
            <View style={styles.inputFooter}>
              <ThemedText variant="secondary" style={{ fontSize: 10 }}>
                {comment.length} / 500 characters
              </ThemedText>
            </View>
          </GlassCard>

          {/* 4. SUBMIT BUTTON */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { 
                backgroundColor: rating === 0 || !comment.trim() || isSubmitting ? theme.text.secondary + '20' : theme.primary,
                opacity: isSubmitting ? 0.7 : 1
              }
            ]}
            onPress={handleSubmit}
            disabled={rating === 0 || !comment.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ThemedText weight="bold" style={{ color: '#FFF' }}>Sending...</ThemedText>
            ) : (
              <>
                <ThemedText weight="bold" style={{ color: rating === 0 || !comment.trim() ? theme.text.secondary : '#FFF' }}>
                  Send Feedback
                </ThemedText>
                <Send size={18} color={rating === 0 || !comment.trim() ? theme.text.secondary : '#FFF'} style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  ratingCard: {
    marginTop: 10,
    paddingVertical: 32,
    alignItems: 'center',
    borderRadius: 24,
  },
  emojiContainer: {
    marginBottom: 16,
  },
  ratingLabel: {
    marginBottom: 20,
    textAlign: 'center',
  },
  starRow: {
    flexDirection: 'row',
  },
  starTouch: {
    paddingHorizontal: 6,
  },
  sectionTitle: {
    fontSize: 14,
    marginTop: 32,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.7,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    marginLeft: 8,
  },
  inputWrapper: {
    padding: 16,
    borderRadius: 20,
    minHeight: 160,
  },
  textInput: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    height: 120,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  submitButton: {
    marginTop: 32,
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successContent: {
    alignItems: 'center',
    width: '100%',
  },
  successIconOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  successIconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 28,
  },
  successSubtitle: {
    textAlign: 'center',
    marginBottom: 48,
    paddingHorizontal: 10,
    lineHeight: 24,
    fontSize: 16,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
  },
});

export default FeedbackScreen;
