import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, ScrollView, TouchableOpacity, View, Alert } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import Tts from 'react-native-tts';

type DescriptionScreenRouteProp = RouteProp<{ params: { generatedContent: string } }, 'params'>;

const DescriptionScreen: React.FC = () => {
  const route = useRoute<DescriptionScreenRouteProp>();
  const { generatedContent } = route.params;
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const initializeTTS = async () => {
      try {
        // Initialize TTS with error handling
        await Tts.setDefaultLanguage('en-US');
        await Tts.setDefaultRate(0.6);
        await Tts.setDefaultPitch(1.2);

        // Add TTS event listeners
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

        // Check if TTS engines are available
        const engines = await Tts.engines();
        console.log('Available TTS engines:', engines);

        // Get available voices
        const voices = await Tts.voices();
        console.log('Available voices:', voices);

        // Set a specific voice if available
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
      // Cleanup
      Tts.stop();
      Tts.removeAllListeners('tts-start');
      Tts.removeAllListeners('tts-finish');
      Tts.removeAllListeners('tts-cancel');
      Tts.removeAllListeners('tts-error');
    };
  }, []);

  const cleanTextForSpeech = (text: string): string => {
    // Remove markdown formatting and clean text for better TTS
    return text
      .replace(/#{1,6}\s*/g, '') // Remove headers
      .replace(/\*\*/g, '') // Remove bold
      .replace(/\*/g, '') // Remove asterisks
      .replace(/\n{3,}/g, '\n\n') // Limit multiple newlines
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
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

      // Stop any current speech
      await Tts.stop();

      // Clean the text for better speech
      const cleanText = cleanTextForSpeech(generatedContent);
      console.log('Cleaned text length:', cleanText.length);

      // Check if TTS is available
      const isAvailable = await Tts.getInitStatus();
      console.log('TTS available:', isAvailable);

      if (!isAvailable) {
        Alert.alert('TTS Unavailable', 'Text-to-speech is not available on this device.');
        return;
      }

      // Split long text into smaller chunks (TTS has character limits)
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
              // Single sentence is too long, split it
              chunks.push(sentence.substring(0, maxChunkSize));
            }
          } else {
            currentChunk += sentence + '. ';
          }
        }
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }

        // Speak chunks sequentially
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

  const testTTS = async (): Promise<void> => {
    try {
      await Tts.speak('This is a test of the text to speech system.');
    } catch (error: any) {
      console.error('Test TTS error:', error);
      Alert.alert('Test Failed', 'TTS test failed: ' + (error.message ?? error));
    }
  };

  const renderFormattedContent = (text: string) => {
    const lines = text.split('\n').filter((line) => line.trim() !== '');

    return lines.map((line, index) => {
      if (line.startsWith('##')) {
        return (
          <Text key={index} style={styles.heading}>
            {line.replace(/^##\s*/, '')}
          </Text>
        );
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <Text key={index} style={styles.subheading}>
            {line.replace(/\*\*/g, '')}
          </Text>
        );
      } else if (line.startsWith('*')) {
        return (
          <Text key={index} style={styles.bullet}>
            • {line.replace(/^\*\s*/, '')}
          </Text>
        );
      } else if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <Text key={index} style={styles.paragraph}>
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <Text key={i} style={styles.bold}>
                  {part}
                </Text>
              ) : (
                part
              )
            )}
          </Text>
        );
      } else {
        return (
          <Text key={index} style={styles.paragraph}>
            {line}
          </Text>
        );
      }
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Chapter Details</Text>
      {renderFormattedContent(generatedContent)}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isSpeaking && styles.speakingButton]}
          onPress={speakContent}
          disabled={isSpeaking}
        >
          <Text style={styles.buttonText}>{isSpeaking ? 'Speaking...' : 'Play'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={stopSpeaking}>
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.testButton]} onPress={testTTS}>
          <Text style={styles.buttonText}>Test TTS</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#F4F7FB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 10,
    marginTop: 20,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 6,
    marginTop: 14,
  },
  paragraph: {
    fontSize: 16,
    color: '#34495E',
    lineHeight: 24,
    marginBottom: 10,
    textAlign: 'justify',
  },
  bullet: {
    fontSize: 16,
    color: '#34495E',
    marginLeft: 12,
    marginBottom: 6,
  },
  bold: {
    fontWeight: '600',
    color: '#2C3E50',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#2C3E50',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    marginVertical: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#E74C3C',
  },
  testButton: {
    backgroundColor: '#3498DB',
  },
  speakingButton: {
    backgroundColor: '#27AE60',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default DescriptionScreen;
