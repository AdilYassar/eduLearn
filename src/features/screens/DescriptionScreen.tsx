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
import Markdown from 'react-native-markdown-display';
import { Play, Pause, Settings } from 'lucide-react-native';
import Modal from 'react-native-modal';


type DescriptionScreenRouteProp = RouteProp<{ params: { generatedContent: string } }, 'params'>;

const DescriptionScreen: React.FC = () => {
  const route = useRoute<DescriptionScreenRouteProp>();
  const { generatedContent } = route.params;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<Array<any>>([]);
  const [selectedVoice, setSelectedVoice] = useState<any>(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

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

        const allVoices = await Tts.voices();
        console.log('Available voices:', allVoices);

        const englishVoices = allVoices.filter(
          (voice) => voice.language.startsWith('en') && (voice.quality ?? 0) > 200 && !voice.notInstalled
        );
        
        setVoices(englishVoices);
        
        if (englishVoices.length > 0) {
          const defaultVoice = englishVoices[0];
          await Tts.setDefaultVoice(defaultVoice.id);
          setSelectedVoice(defaultVoice);
          console.log('Set voice to:', defaultVoice);
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

  const handleVoiceSelect = async (voice: any) => {
    try {
      await Tts.stop();
      await Tts.setDefaultVoice(voice.id);
      setSelectedVoice(voice);
      setShowVoiceModal(false);
      console.log('Selected voice:', voice);
    } catch (error) {
      console.error('Error selecting voice:', error);
      Alert.alert('Error', 'Failed to set voice. Please try again.');
    }
  };

  // Markdown styles configuration
  const markdownStyles = {
    body: {
      fontSize: RFValue(11),
      color: '#4A4A4A',
      lineHeight: RFValue(18),
      fontFamily: 'Inter-Regular',
    },
    heading1: {
      fontSize: RFValue(18),
      color: '#1A1A1A',
      fontWeight: '800',
      lineHeight: RFValue(24),
      marginTop: RFValue(16),
      marginBottom: RFValue(8),
      fontFamily: 'Inter-Bold',
    },
    heading2: {
      fontSize: RFValue(16),
      color: '#1F1F1F',
      fontWeight: '700',
      lineHeight: RFValue(22),
      marginTop: RFValue(14),
      marginBottom: RFValue(7),
      fontFamily: 'Inter-Bold',
    },
    heading3: {
      fontSize: RFValue(14),
      color: '#252525',
      fontWeight: '700',
      lineHeight: RFValue(20),
      marginTop: RFValue(12),
      marginBottom: RFValue(6),
      fontFamily: 'Inter-SemiBold',
    },
    heading4: {
      fontSize: RFValue(13),
      color: '#2A2A2A',
      fontWeight: '600',
      lineHeight: RFValue(18),
      marginTop: RFValue(10),
      marginBottom: RFValue(5),
      fontFamily: 'Inter-SemiBold',
    },
    heading5: {
      fontSize: RFValue(12),
      color: '#2F2F2F',
      fontWeight: '600',
      lineHeight: RFValue(16),
      marginTop: RFValue(8),
      marginBottom: RFValue(4),
      fontFamily: 'Inter-SemiBold',
    },
    heading6: {
      fontSize: RFValue(11),
      color: '#333333',
      fontWeight: '600',
      lineHeight: RFValue(15),
      marginTop: RFValue(6),
      marginBottom: RFValue(3),
      fontFamily: 'Inter-SemiBold',
    },
    paragraph: {
      fontSize: RFValue(11),
      color: '#4A4A4A',
      lineHeight: RFValue(18),
      marginTop: RFValue(6),
      marginBottom: RFValue(6),
      fontFamily: 'Inter-Regular',
    },
    strong: {
      fontSize: RFValue(11),
      color: '#2C2C2C',
      fontWeight: '700',
      fontFamily: 'Inter-Bold',
    },
    em: {
      fontSize: RFValue(11),
      fontStyle: 'italic',
      fontFamily: 'Inter-Regular',
    },
    list_item: {
      fontSize: RFValue(11),
      color: '#4A4A4A',
      lineHeight: RFValue(18),
      marginBottom: RFValue(4),
      fontFamily: 'Inter-Regular',
    },
    bullet_list: {
      marginTop: RFValue(6),
      marginBottom: RFValue(6),
      paddingLeft: RFValue(16),
    },
    ordered_list: {
      marginTop: RFValue(6),
      marginBottom: RFValue(6),
      paddingLeft: RFValue(16),
    },
    code_inline: {
      fontSize: RFValue(10),
      fontFamily: 'monospace',
      backgroundColor: '#F0F0F0',
      color: '#D63384',
      paddingHorizontal: RFValue(4),
      paddingVertical: RFValue(2),
      borderRadius: RFValue(3),
    },
    code_block: {
      fontSize: RFValue(10),
      fontFamily: 'monospace',
      backgroundColor: '#2D2D2D',
      color: '#E8E8E8',
      padding: RFValue(12),
      borderRadius: RFValue(8),
      marginTop: RFValue(8),
      marginBottom: RFValue(8),
      borderLeftWidth: RFValue(4),
      borderLeftColor: '#A599FF',
    },
    fence: {
      fontSize: RFValue(10),
      fontFamily: 'monospace',
      backgroundColor: '#2D2D2D',
      color: '#E8E8E8',
      padding: RFValue(12),
      borderRadius: RFValue(8),
      marginTop: RFValue(8),
      marginBottom: RFValue(8),
      borderLeftWidth: RFValue(4),
      borderLeftColor: '#A599FF',
    },
    blockquote: {
      backgroundColor: '#F5F7FF',
      borderLeftWidth: RFValue(4),
      borderLeftColor: '#A599FF',
      paddingLeft: RFValue(12),
      paddingRight: RFValue(12),
      paddingTop: RFValue(8),
      paddingBottom: RFValue(8),
      marginTop: RFValue(8),
      marginBottom: RFValue(8),
      borderRadius: RFValue(8),
    },
    table: {
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: RFValue(8),
      marginTop: RFValue(8),
      marginBottom: RFValue(8),
      overflow: 'hidden',
    },
    thead: {
      backgroundColor: '#F8F9FA',
    },
    tbody: {
      backgroundColor: '#FFFFFF',
    },
    th: {
      fontSize: RFValue(10),
      fontWeight: '700',
      color: '#1A1A1A',
      padding: RFValue(8),
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
      fontFamily: 'Inter-Bold',
    },
    td: {
      fontSize: RFValue(10),
      color: '#4A4A4A',
      padding: RFValue(8),
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
      fontFamily: 'Inter-Regular',
    },
    tr: {
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
  };

  // Parse text with inline formatting (bold, italic) - kept for TTS cleaning
  const parseInlineFormatting = (text: string) => {
    const parts: Array<{ text: string; bold?: boolean; italic?: boolean }> = [];
    let currentIndex = 0;
    let remainingText = text;

    // Match bold (**text** or __text__)
    const boldRegex = /(\*\*|__)(.+?)\1/g;
    // Match italic (*text* or _text_)
    const italicRegex = /(?<!\*)\*([^*]+?)\*(?!\*)|(?<!_)_([^_]+?)_(?!_)/g;
    // Match bold+italic (***text***)
    const boldItalicRegex = /(\*\*\*|___)(.+?)\1/g;

    const matches: Array<{ start: number; end: number; text: string; bold: boolean; italic: boolean }> = [];

    // Find all bold+italic first
    let match;
    while ((match = boldItalicRegex.exec(remainingText)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[2],
        bold: true,
        italic: true,
      });
    }

    // Find all bold
    remainingText = text;
    while ((match = boldRegex.exec(remainingText)) !== null) {
      const start = match.index;
      const end = match.index + match[0].length;
      // Check if already covered by bold+italic
      const isCovered = matches.some(m => start >= m.start && end <= m.end);
      if (!isCovered) {
        matches.push({
          start,
          end,
          text: match[2],
          bold: true,
          italic: false,
        });
      }
    }

    // Find all italic
    remainingText = text;
    while ((match = italicRegex.exec(remainingText)) !== null) {
      const start = match.index;
      const end = match.index + match[0].length;
      // Check if already covered
      const isCovered = matches.some(m => start >= m.start && end <= m.end);
      if (!isCovered) {
        matches.push({
          start,
          end,
          text: match[1] || match[2],
          bold: false,
          italic: true,
        });
      }
    }

    // Sort matches by start position
    matches.sort((a, b) => a.start - b.start);

    // Build parts array
    let lastIndex = 0;
    matches.forEach(match => {
      if (match.start > lastIndex) {
        parts.push({ text: text.substring(lastIndex, match.start) });
      }
      parts.push({ text: match.text, bold: match.bold, italic: match.italic });
      lastIndex = match.end;
    });

    if (lastIndex < text.length) {
      parts.push({ text: text.substring(lastIndex) });
    }

    return parts.length > 0 ? parts : [{ text }];
  };

  const renderFormattedContent = (text: string) => {
    // Normalize newlines
    const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalizedText.split('\n');
    const elements: JSX.Element[] = [];
    let currentParagraph: string[] = [];
    let listItems: Array<{ type: 'bullet' | 'numbered'; content: string }> = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let inBlockquote = false;
    let blockquoteContent: string[] = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const paragraphText = currentParagraph.join(' ').trim();
        if (paragraphText) {
          const parts = parseInlineFormatting(paragraphText);
          elements.push(
          <Animated.View
              key={`para-${elements.length}`}
            style={[
                styles.paragraphContainer,
              {
                opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
              },
            ]}
          >
              <View style={styles.contentCard}>
                <View style={styles.paragraphWrapper}>
                  {parts.map((part, idx) => (
            <CustomText
                      key={idx}
              variant="body"
                      size={RFValue(13)}
                      fontFamily={part.bold ? 'Inter-Bold' : 'Inter-Regular'}
                      style={[
                        styles.paragraphText,
                        part.bold && styles.boldText,
                        part.italic && styles.italicText,
                      ]}
                    >
                      {part.text}
            </CustomText>
                  ))}
                </View>
              </View>
          </Animated.View>
        );
      }
        currentParagraph = [];
      }
    };

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <Animated.View
            key={`list-${elements.length}`}
            style={[
              styles.listContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <View style={styles.contentCard}>
              {listItems.map((item, idx) => (
                <View
                  key={idx}
                  style={item.type === 'bullet' ? styles.bulletContainer : styles.numberedContainer}
                >
                  {item.type === 'bullet' ? (
                    <>
                      <View style={styles.bulletDot} />
                      <View style={styles.bulletTextContainer}>
                        {parseInlineFormatting(item.content).map((part, partIdx) => (
                          <CustomText
                            key={partIdx}
                            variant="body"
                            size={RFValue(13)}
                            fontFamily={part.bold ? 'Inter-Bold' : 'Inter-Regular'}
                            style={[
                              styles.bulletText,
                              part.bold && styles.boldText,
                              part.italic && styles.italicText,
                            ]}
                          >
                            {part.text}
                          </CustomText>
                        ))}
                      </View>
                    </>
                  ) : (
                    <>
            <View style={styles.numberedDot}>
              <CustomText
                variant="body"
                          size={RFValue(10)}
                fontFamily="Inter-Bold"
                style={styles.numberedText}
              >
                          {idx + 1}
              </CustomText>
            </View>
                      <View style={styles.bulletTextContainer}>
                        {parseInlineFormatting(item.content).map((part, partIdx) => (
            <CustomText
                            key={partIdx}
              variant="body"
                            size={RFValue(13)}
                            fontFamily={part.bold ? 'Inter-Bold' : 'Inter-Regular'}
                            style={[
                              styles.bulletText,
                              part.bold && styles.boldText,
                              part.italic && styles.italicText,
                            ]}
                          >
                            {part.text}
            </CustomText>
                        ))}
                      </View>
                    </>
                  )}
                </View>
              ))}
            </View>
          </Animated.View>
        );
        listItems = [];
      }
    };

    const flushCodeBlock = () => {
      if (codeBlockContent.length > 0) {
        elements.push(
          <Animated.View
            key={`code-${elements.length}`}
            style={[
              styles.codeBlockContainer,
              {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.codeBlock}>
              {codeBlockContent.map((line, idx) => (
            <CustomText
                  key={idx}
              variant="body"
                  size={RFValue(11)}
              fontFamily="Inter-Regular"
                  style={styles.codeText}
            >
              {line}
            </CustomText>
              ))}
            </View>
          </Animated.View>
        );
        codeBlockContent = [];
      }
    };

    const flushBlockquote = () => {
      if (blockquoteContent.length > 0) {
        const quoteText = blockquoteContent.join(' ').trim();
        if (quoteText) {
          const parts = parseInlineFormatting(quoteText);
          elements.push(
            <Animated.View
              key={`quote-${elements.length}`}
              style={[
                styles.blockquoteContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              <View style={styles.blockquote}>
                <View style={styles.blockquoteAccent} />
                <View style={styles.blockquoteContent}>
                  {parts.map((part, idx) => (
                    <CustomText
                      key={idx}
                      variant="body"
                      size={RFValue(13)}
                      fontFamily={part.bold ? 'Inter-Bold' : 'Inter-Regular'}
                      style={[
                        styles.blockquoteText,
                        part.bold && styles.boldText,
                        part.italic && styles.italicText,
                      ]}
                    >
                      {part.text}
                    </CustomText>
                  ))}
                </View>
              </View>
            </Animated.View>
          );
        }
        blockquoteContent = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Code blocks
      if (trimmedLine.startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock();
          inCodeBlock = false;
        } else {
          flushParagraph();
          flushList();
          flushBlockquote();
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Blockquotes
      if (trimmedLine.startsWith('>')) {
        if (!inBlockquote) {
          flushParagraph();
          flushList();
          inBlockquote = true;
        }
        blockquoteContent.push(trimmedLine.substring(1).trim());
        return;
      } else if (inBlockquote) {
        flushBlockquote();
        inBlockquote = false;
      }

      // Headers
      if (trimmedLine.match(/^#{1,6}\s+/)) {
        flushParagraph();
        flushList();
        flushBlockquote();

        const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          const headerText = headerMatch[2];
          const parts = parseInlineFormatting(headerText);

          const headerSizes = [RFValue(22), RFValue(20), RFValue(18), RFValue(16), RFValue(14), RFValue(12)];
          const headerSize = headerSizes[Math.min(level - 1, 5)];

          elements.push(
            <Animated.View
              key={`header-${index}`}
              style={[
                styles.headerContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.contentCard}>
                <View style={styles.headerWrapper}>
                  <View style={[styles.headerAccent, { height: level === 1 ? 32 : level === 2 ? 28 : 24 }]} />
                  <View style={styles.headerContent}>
                    {parts.map((part, idx) => (
                      <CustomText
                        key={idx}
                        variant="h1"
                        size={headerSize}
                        fontFamily={part.bold ? 'Inter-Bold' : 'Inter-SemiBold'}
                        style={[
                          styles[`header${level}` as keyof typeof styles],
                          part.bold && styles.boldText,
                        ]}
                      >
                        {part.text}
                      </CustomText>
                    ))}
                  </View>
                </View>
              </View>
            </Animated.View>
          );
        }
        return;
      }

      // Bullet lists
      if (trimmedLine.match(/^[-*]\s+/)) {
        flushParagraph();
        flushBlockquote();
        if (listItems.length > 0 && listItems[listItems.length - 1].type !== 'bullet') {
          flushList();
        }
        listItems.push({
          type: 'bullet',
          content: trimmedLine.replace(/^[-*]\s+/, ''),
        });
        return;
      }

      // Numbered lists
      if (trimmedLine.match(/^\d+\.\s+/)) {
        flushParagraph();
        flushBlockquote();
        if (listItems.length > 0 && listItems[listItems.length - 1].type !== 'numbered') {
          flushList();
        }
        listItems.push({
          type: 'numbered',
          content: trimmedLine.replace(/^\d+\.\s+/, ''),
        });
        return;
      }

      // Empty line
      if (trimmedLine === '') {
        flushParagraph();
        flushList();
        flushBlockquote();
        return;
      }

      // Regular paragraph text
      currentParagraph.push(trimmedLine);
    });

    // Flush any remaining content
    flushParagraph();
    flushList();
    flushCodeBlock();
    flushBlockquote();

    return elements.length > 0 ? elements : (
      <View style={styles.emptyContainer}>
        <CustomText variant="body" size={RFValue(12)} fontFamily="Inter-Regular" style={styles.emptyText}>
          No content available
        </CustomText>
      </View>
    );
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
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <CustomText
                variant="h1"
                size={RFValue(18)}
                fontFamily="Inter-Bold"
                style={styles.headerTitle}
              >
                Chapter Details
              </CustomText>
              {/* <CustomText
                variant="h3"
                size={RFValue(10)}
                fontFamily="Inter-Regular"
                style={styles.headerSubtitle}
              >
                AI Generated Content
              </CustomText> */}
            </View>
            <TouchableOpacity
              style={styles.voiceButton}
              onPress={() => setShowVoiceModal(true)}
            >
              <Settings size={RFValue(20)} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Content Section */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View style={styles.markdownContainer}>
            <Markdown style={markdownStyles}>{generatedContent}</Markdown>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Floating Action Button */}
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
          onPress={isSpeaking ? stopSpeaking : speakContent}
        >
          {isSpeaking ? (
            <Pause size={RFValue(24)} color="#FFFFFF" strokeWidth={2.5} fill="#FFFFFF" />
          ) : (
            <Play size={RFValue(24)} color="#FFFFFF" strokeWidth={2.5} fill="#FFFFFF" />
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Voice Selection Modal */}
      <Modal
        isVisible={showVoiceModal}
        onBackdropPress={() => setShowVoiceModal(false)}
        onBackButtonPress={() => setShowVoiceModal(false)}
        style={styles.modal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <CustomText
              variant="h1"
              size={RFValue(18)}
              fontFamily="Inter-Bold"
              style={styles.modalTitle}
            >
              Select Voice
            </CustomText>
            <TouchableOpacity
              onPress={() => setShowVoiceModal(false)}
              style={styles.closeButton}
            >
              <CustomText
                variant="h3"
                size={RFValue(16)}
                fontFamily="Inter-Bold"
                style={styles.closeButtonText}
              >
                ✕
              </CustomText>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.voiceList} showsVerticalScrollIndicator={true}>
            {voices.length > 0 ? (
              voices.map((voice, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.voiceItem,
                    selectedVoice?.id === voice.id && styles.selectedVoiceItem,
                  ]}
                  onPress={() => handleVoiceSelect(voice)}
                >
                  <View style={styles.voiceInfo}>
                    <CustomText
                      variant="body"
                      size={RFValue(13)}
                      fontFamily="Inter-SemiBold"
                      style={[
                        styles.voiceName,
                        selectedVoice?.id === voice.id && styles.selectedVoiceName,
                      ]}
                    >
                      {voice.name || voice.id}
                    </CustomText>
                    <CustomText
                      variant="body"
                      size={RFValue(11)}
                      fontFamily="Inter-Regular"
                      style={styles.voiceDetails}
                    >
                      {voice.language} • Quality: {voice.quality || 'N/A'}
                      {voice.networkConnectionRequired && ' • Requires Network'}
                    </CustomText>
                  </View>
                  {selectedVoice?.id === voice.id && (
                    <View style={styles.checkmark}>
                      <CustomText
                        variant="h3"
                        size={RFValue(16)}
                        fontFamily="Inter-Bold"
                        style={styles.checkmarkText}
                      >
                        ✓
                      </CustomText>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyVoices}>
                <CustomText
                  variant="body"
                  size={RFValue(12)}
                  fontFamily="Inter-Regular"
                  style={styles.emptyVoicesText}
                >
                  No voices available
                </CustomText>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 35,
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
    marginTop: -20,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -25,
  },
  headerTextContainer: {
    flex: 1,
    marginBottom:10
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    marginTop:-20,

  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    color: '#1A1A1A',
    fontWeight: '800',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#666666',
  },
  voiceList: {
    maxHeight: 400,
    paddingHorizontal: 20,
  },
  voiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedVoiceItem: {
    backgroundColor: '#F5F7FF',
    borderColor: '#A599FF',
    borderWidth: 2,
  },
  voiceInfo: {
    flex: 1,
  },
  voiceName: {
    color: '#1A1A1A',
    marginBottom: 4,
  },
  selectedVoiceName: {
    color: '#A599FF',
  },
  voiceDetails: {
    color: '#666666',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#A599FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  checkmarkText: {
    color: '#FFFFFF',
  },
  emptyVoices: {
    padding: 40,
    alignItems: 'center',
  },
  emptyVoicesText: {
    color: '#999999',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 120,
  },
  markdownContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#A599FF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#A599FF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  // Header styles
  headerContainer: {
    marginBottom: 8,
  },
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  headerAccent: {
    width: 5,
    backgroundColor: '#A599FF',
    borderRadius: 3,
    marginRight: 14,
    marginTop: 4,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  header1: {
    color: '#1A1A1A',
    fontWeight: '800',
    lineHeight: RFValue(28),
    marginBottom: 4,
  },
  header2: {
    color: '#1F1F1F',
    fontWeight: '700',
    lineHeight: RFValue(24),
    marginBottom: 4,
  },
  header3: {
    color: '#252525',
    fontWeight: '700',
    lineHeight: RFValue(22),
    marginBottom: 3,
  },
  header4: {
    color: '#2A2A2A',
    fontWeight: '600',
    lineHeight: RFValue(20),
    marginBottom: 3,
  },
  header5: {
    color: '#2F2F2F',
    fontWeight: '600',
    lineHeight: RFValue(18),
    marginBottom: 2,
  },
  header6: {
    color: '#333333',
    fontWeight: '600',
    lineHeight: RFValue(16),
    marginBottom: 2,
  },
  // Paragraph styles
  paragraphContainer: {
    marginBottom: 8,
  },
  paragraphWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  paragraphText: {
    color: '#4A4A4A',
    lineHeight: RFValue(22),
    textAlign: 'left',
  },
  boldText: {
    color: '#2C2C2C',
    fontWeight: '700',
  },
  italicText: {
    fontStyle: 'italic',
  },
  // List styles
  listContainer: {
    marginBottom: 8,
  },
  bulletContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingLeft: 4,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A599FF',
    marginTop: RFValue(7),
    marginRight: 14,
    shadowColor: '#A599FF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  bulletTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bulletText: {
    color: '#4A4A4A',
    lineHeight: RFValue(20),
    flex: 1,
  },
  numberedContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingLeft: 4,
  },
  numberedDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#A599FF',
    marginTop: RFValue(5),
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#A599FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  numberedText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Code block styles
  codeBlockContainer: {
    marginBottom: 16,
  },
  codeBlock: {
    backgroundColor: '#2D2D2D',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#A599FF',
  },
  codeText: {
    color: '#E8E8E8',
    fontFamily: 'monospace',
    lineHeight: RFValue(16),
    marginBottom: 4,
  },
  // Blockquote styles
  blockquoteContainer: {
    marginBottom: 16,
  },
  blockquote: {
    flexDirection: 'row',
    backgroundColor: '#F5F7FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#A599FF',
    marginLeft: 8,
  },
  blockquoteAccent: {
    width: 4,
    backgroundColor: '#A599FF',
    borderRadius: 2,
    marginRight: 12,
  },
  blockquoteContent: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  blockquoteText: {
    color: '#555555',
    lineHeight: RFValue(20),
    fontStyle: 'italic',
  },
  // Empty state
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#999999',
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
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
  fabText: {
    color: '#FFFFFF',
    fontSize: RFValue(16),
  },
});

export default DescriptionScreen;