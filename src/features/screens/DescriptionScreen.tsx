import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  Alert,
  Animated,
  StatusBar,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import Tts from 'react-native-tts';
import CustomText from '../../components/ui/CustomText';
import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';


type DescriptionScreenRouteProp = RouteProp<{ params: { generatedContent: string } }, 'params'>;

const DescriptionScreen: React.FC = () => {
  const route = useRoute<DescriptionScreenRouteProp>();
  const { generatedContent } = route.params;
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Start entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    const initializeTTS = async () => {
      try {
        await Tts.setDefaultLanguage('en-US');
        await Tts.setDefaultRate(0.6);
        await Tts.setDefaultPitch(1.2);

        Tts.addEventListener('tts-start', (event) => {
          console.log('TTS Started:', event);
          setIsSpeaking(true);
        });

        Tts.addEventListener('tts-finish', (event) => {
          console.log('TTS Finished:', event);
          setIsSpeaking(false);
        });

        Tts.addEventListener('tts-cancel', (event) => {
          console.log('TTS Cancelled:', event);
          setIsSpeaking(false);
        });

        Tts.addEventListener('tts-error', (event) => {
          console.error('TTS Error:', event);
          setIsSpeaking(false);
          Alert.alert('TTS Error', 'There was an error with text-to-speech. Please try again.');
        });

        const engines = await Tts.engines();
        console.log('Available TTS engines:', engines);

        const voices = await Tts.voices();
        console.log('Available voices:', voices);

        const englishVoices = voices.filter(
          (voice) => voice.language.startsWith('en') && (voice.quality ?? 0) > 200
        );
        if (englishVoices.length > 0) {
          await Tts.setDefaultVoice(englishVoices[0].id);
          console.log('Set voice to:', englishVoices[0]);
        }
      } catch (error) {
        console.error('TTS Initialization Error:', error);
        Alert.alert('TTS Error', 'Failed to initialize text-to-speech');
      }
    };

    initializeTTS();

    return () => {
      Tts.stop();
      Tts.removeAllListeners('tts-start');
      Tts.removeAllListeners('tts-finish');
      Tts.removeAllListeners('tts-cancel');
      Tts.removeAllListeners('tts-error');
    };
  }, [fadeAnim, slideAnim, buttonScale]);

  const cleanTextForSpeech = (text: string): string => {
    return text
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const speakContent = async (): Promise<void> => {
    try {
      console.log('Attempting to speak content');

      if (!generatedContent || generatedContent.trim() === '') {
        console.warn('No content to speak!');
        Alert.alert('No Content', 'There is no content to read aloud.');
        return;
      }

      await Tts.stop();

      const cleanText = cleanTextForSpeech(generatedContent);
      console.log('Cleaned text length:', cleanText.length);

      const isAvailable = await Tts.getInitStatus();
      console.log('TTS available:', isAvailable);

      if (!isAvailable) {
        Alert.alert('TTS Unavailable', 'Text-to-speech is not available on this device.');
        return;
      }

      const maxChunkSize = 4000;
      if (cleanText.length > maxChunkSize) {
        const chunks: string[] = [];
        let currentChunk = '';
        const sentences = cleanText.split('. ');

        for (const sentence of sentences) {
          if ((currentChunk + sentence).length > maxChunkSize) {
            if (currentChunk) {
              chunks.push(currentChunk.trim());
              currentChunk = sentence + '. ';
            } else {
              chunks.push(sentence.substring(0, maxChunkSize));
            }
          } else {
            currentChunk += sentence + '. ';
          }
        }
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }

        for (let i = 0; i < chunks.length; i++) {
          await new Promise<void>((resolve) => {
            const onFinish = () => {
              Tts.removeEventListener('tts-finish', onFinish);
              resolve();
            };
            Tts.addEventListener('tts-finish', onFinish);
            Tts.speak(chunks[i]);
          });
        }
      } else {
        Tts.speak(cleanText);
      }
    } catch (error) {
      console.error('Error in speakContent:', error);
      Alert.alert('Speech Error', 'Failed to start text-to-speech. Please try again.');
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = async (): Promise<void> => {
    try {
      await Tts.stop();
      setIsSpeaking(false);
      console.log('TTS stopped');
    } catch (error) {
      console.error('Error stopping TTS:', error);
    }
  };

  const renderFormattedContent = (text: string) => {
    // First, clean up any remaining markdown syntax
    const cleanedText = text
      .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1') // Remove bold/italic markers
      .replace(/#{1,6}\s*/g, '') // Remove headers
      .replace(/\n{3,}/g, '\n\n'); // Normalize multiple newlines

    const lines = cleanedText.split('\n').filter((line) => line.trim() !== '');

    return lines.map((line, index) => {

      // Handle bullet points (lines starting with - or *)
      if (line.match(/^[-*]\s+/)) {
        return (
          <Animated.View
            key={index}
            style={[
              styles.bulletContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <View style={styles.bulletDot} />
            <CustomText
              variant="body"
              size={RFValue(14)}
              fontFamily="Inter-Regular"
              style={styles.bulletText}
            >
              {line.replace(/^[-*]\s*/, '')}
            </CustomText>
          </Animated.View>
        );
      }

      // Handle numbered lists
      else if (line.match(/^\d+\.\s+/)) {
        const match = line.match(/^(\d+)\.\s+(.*)/);
        const number = match ? match[1] : '';
        const content = match ? match[2] : line;
        return (
          <Animated.View
            key={index}
            style={[
              styles.numberedContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <View style={styles.numberedDot}>
              <CustomText
                variant="body"
                size={RFValue(12)}
                fontFamily="Inter-Bold"
                style={styles.numberedText}
              >
                {number}
              </CustomText>
            </View>
            <CustomText
              variant="body"
              size={RFValue(14)}
              fontFamily="Inter-Regular"
              style={styles.bulletText}
            >
              {content}
            </CustomText>
          </Animated.View>
        );
      }

      // Regular paragraphs
      else {
        return (
          <Animated.View
            key={index}
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <CustomText
              variant="body"
              size={RFValue(14)}
              fontFamily="Inter-Regular"
              style={styles.paragraph}
            >
              {line}
            </CustomText>
          </Animated.View>
        );
      }
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header Section */}
      <LinearGradient
        colors={['#CAC4FF', '#B5AEFF', '#A599FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: buttonScale }],
          }}
        >
          <CustomText
            variant="h1"
            size={RFValue(24)}
            fontFamily="Inter-Bold"
            style={styles.headerTitle}
          >
            Chapter Details
          </CustomText>
          <CustomText
            variant="h3"
            size={RFValue(12)}
            fontFamily="Inter-Regular"
            style={styles.headerSubtitle}
          >
            AI Generated Content
          </CustomText>
        </Animated.View>
      </LinearGradient>

      {/* Content Section */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderFormattedContent(generatedContent)}
      </ScrollView>

      {/* Floating Action Buttons */}
      <Animated.View
        style={[
          styles.fabContainer,
          {
            transform: [{ scale: buttonScale }],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.fab,
            styles.playFab,
            isSpeaking && styles.speakingFab,
          ]}
          onPress={speakContent}
          disabled={isSpeaking}
        >
          <CustomText
            variant="h3"
            size={RFValue(14)}
            fontFamily="Inter-Bold"
            style={styles.fabText}
          >
            {isSpeaking ? '🔊' : '▶️'}
          </CustomText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fab, styles.stopFab]}
          onPress={stopSpeaking}
        >
          <CustomText
            variant="h3"
            size={RFValue(14)}
            fontFamily="Inter-Bold"
            style={styles.fabText}
          >
            ⏹️
          </CustomText>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 15,
  },
  headingAccent: {
    width: 4,
    height: 24,
    backgroundColor: '#A599FF',
    borderRadius: 2,
    marginRight: 12,
  },
  heading: {
    color: '#2C2C2C',
    fontWeight: '800',
    flex: 1,
  },
  subheading: {
    color: '#4A4A4A',
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 10,
  },
  paragraph: {
    color: '#666666',
    lineHeight: 24,
    marginBottom: 12,
    textAlign: 'justify',
  },
  regularText: {
    color: '#666666',
  },
  bulletContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    marginLeft: 10,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A599FF',
    marginTop: 8,
    marginRight: 12,
  },
  bulletText: {
    color: '#666666',
    flex: 1,
    lineHeight: 22,
  },
  numberedContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    marginLeft: 10,
  },
  numberedDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#A599FF',
    marginTop: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberedText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  bold: {
    color: '#2C2C2C',
    fontWeight: '700',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    flexDirection: 'column',
    gap: 15,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playFab: {
    backgroundColor: '#A599FF',
  },
  speakingFab: {
    backgroundColor: '#27AE60',
  },
  stopFab: {
    backgroundColor: '#E74C3C',
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: RFValue(20),
  },
});

export default DescriptionScreen;