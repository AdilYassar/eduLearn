/* eslint-disable eqeqeq */
/* eslint-disable no-undef */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  TextInput,
  Animated,
  TouchableOpacity,
  NativeSyntheticEvent,
  TextInputContentSizeChangeEventData,
  Alert,
  PermissionsAndroid,
  Image,
} from 'react-native';
import { GlassCard, ThemedText } from '../ui/ThemedComponents';
import { useTheme } from '../../context/ThemeContext';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RFValue } from 'react-native-responsive-fontsize';
import useKeyboardOffsetHeight from '../../helpers/useKeyboardOffsetHeight';
import { useDispatch, useSelector } from 'react-redux';
import {
  addAssistantMessage,
  markMessageAsRead,
  updateChatSummary,
  addMessages,
  createNewChat,
  selectChats,
  selectCurrentChatId,
  updateAssistantMessage,
} from '../../redux/reducers/chatSlice';
import { PaperAirplaneIcon, StopIcon } from 'react-native-heroicons/solid';
import uuid from 'react-native-uuid';
import axios from 'axios';
import { Colors } from '@utils/Constants';

// Import audio icon
const audioIcon = require('../../assets/images/audio.png');
import { InferenceClient } from '@huggingface/inference';
import {
  HUGGING_API_KEY,
  STABLE_DIFFUSION_KEY,
  STABLE_DIFFUSION_URL,
} from '../../redux/API';

// Import Voice Recording Modal
import VoiceRecordingModal from './VoiceRecordingModal';

// Voice Recognition imports with safer loading
let Voice: any = null;
let Tts: any = null;

// Enhanced module loading with better error handling and fresh reference
const getVoiceModule = () => {
  try {
    // Always get a fresh reference to avoid stale references
    const VoiceModule = require('@react-native-voice/voice');
    const freshVoice = VoiceModule.default || VoiceModule;
    
    // Validate that Voice is properly loaded and has essential methods
    if (freshVoice && typeof freshVoice === 'object') {
      const requiredMethods = ['start', 'stop', 'destroy'];
      const hasRequiredMethods = requiredMethods.every(method => 
        typeof freshVoice[method] === 'function'
      );
      
      if (hasRequiredMethods) {
        console.log('Voice module loaded successfully:', Object.keys(freshVoice));
        console.log('Voice module methods available:', Object.getOwnPropertyNames(freshVoice));
        console.log('Voice module prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(freshVoice)));
        Voice = freshVoice; // Update the global reference
        return freshVoice;
      } else {
        console.warn('Voice module missing required methods:', requiredMethods.filter(method => typeof freshVoice[method] !== 'function'));
        return null;
      }
    } else {
      console.warn('Voice module loaded but object is invalid');
      return null;
    }
  } catch (error: any) {
    console.warn('Voice recognition module not available:', error.message);
    return null;
  }
};

const loadVoiceModule = () => {
  return getVoiceModule();
};

const loadTtsModule = () => {
  try {
    const TtsModule = require('react-native-tts');
    const loadedTts = TtsModule.default || TtsModule;
    
    if (loadedTts && typeof loadedTts === 'object') {
      console.log('TTS module loaded successfully:', !!loadedTts);
      Tts = loadedTts; // Store the reference
      return loadedTts;
    } else {
      console.warn('TTS module loaded but object is invalid');
      return null;
    }
  } catch (error: any) {
    console.warn('TTS module not available:', error.message);
    return null;
  }
};

const windowHeight = Dimensions.get('window').height;

interface SendButtonProps {
  isTyping: boolean;
  setIsTyping: (isTyping: boolean) => void;
  setCurrentChatId: (chatId: string) => void;
  length: number;
  setHeightOfMessageBox?: (height: number) => void;
  messages: Array<{
    content: string;
    time: string;
    role: string;
    id: string;
    isMessageRead: boolean;
  }>;
  presetMessage?: string;
  onMessageSent?: () => void;
}

const SendButton: React.FC<SendButtonProps> = ({
  isTyping,
  setIsTyping,
  setCurrentChatId,
  length,
  setHeightOfMessageBox,
  messages,
  presetMessage,
  onMessageSent,
}) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const chats = useSelector(selectChats) as Array<{ id: string }>;
  const currentChatId = useSelector(selectCurrentChatId);
  const animationValue = useRef(new Animated.Value(0)).current;
  const keyboardOffsetHeight = useKeyboardOffsetHeight();
  const [message, setMessage] = useState<string>('');
  const TextInputRef = useRef<TextInput>(null);

  // Voice-related states
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [speechToTextResult, setSpeechToTextResult] = useState<string>('');
  const [isVoiceMode, setIsVoiceMode] = useState<boolean>(false);
  const [voiceAvailable, setVoiceAvailable] = useState<boolean>(false);
  const [hasPermissions, setHasPermissions] = useState<boolean>(false);
  const [voiceInitialized, setVoiceInitialized] = useState<boolean>(false);
  
  // Voice recording modal states
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Track if current message is from voice input
  const [isCurrentMessageFromVoice, setIsCurrentMessageFromVoice] = useState<boolean>(false);
  
  // Flag to prevent recovery when intentionally stopping
  const isIntentionallyStoppingRef = useRef<boolean>(false);

  const client = new InferenceClient(HUGGING_API_KEY);

  // Handle preset message from cards
  useEffect(() => {
    if (presetMessage && presetMessage.trim() !== '') {
      setMessage(presetMessage);
      // Focus on the text input
      if (TextInputRef.current) {
        TextInputRef.current.focus();
      }
      // Clear the preset message after setting
      if (onMessageSent) {
        onMessageSent();
      }
    }
  }, [presetMessage, onMessageSent]);

  // Initialize modules once
  useEffect(() => {
    const initModules = () => {
      const loadedVoice = loadVoiceModule();
      const loadedTts = loadTtsModule();
      
      // Ensure Voice reference is maintained
      if (loadedVoice) {
        Voice = loadedVoice;
      }
      if (loadedTts) {
        Tts = loadedTts;
      }
    };
    
    initModules();
  }, []);

  // Request microphone permission
  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone for voice recognition.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        const hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
        setHasPermissions(hasPermission);
        return hasPermission;
      } catch (err) {
        console.warn('Permission request error:', err);
        return false;
      }
    }
    // iOS permissions are handled in Info.plist
    setHasPermissions(true);
    return true;
  }, []);

  // Simplified voice availability check
  const checkVoiceAvailability = useCallback(async () => {
    if (!Voice) {
      console.log('Voice module not available');
      setVoiceAvailable(false);
      return false;
    }

    try {
      // Check if Voice has the essential methods
      const requiredMethods = ['start', 'stop', 'destroy'];
      const hasRequiredMethods = requiredMethods.every(method => 
        typeof Voice[method] === 'function'
      );

      if (!hasRequiredMethods) {
        console.log('Voice module missing required methods');
        setVoiceAvailable(false);
        return false;
      }

      // Just assume available on supported platforms if module loaded correctly
      const available = Platform.OS === 'android' || Platform.OS === 'ios';
      console.log('Voice recognition available:', available);
      setVoiceAvailable(available);
      return available;
    } catch (error) {
      console.error('Voice availability check error:', error);
      setVoiceAvailable(false);
      return false;
    }
  }, []);

  // Initialize TTS
  useEffect(() => {
    const initializeTts = async () => {
      if (!Tts) {
        console.log('TTS module not available');
        return;
      }

      try {
        // Initialize TTS settings
        if (typeof Tts.setDefaultLanguage === 'function') {
          await Tts.setDefaultLanguage('en-US');
        }
        if (typeof Tts.setDefaultRate === 'function') {
          await Tts.setDefaultRate(0.5);
        }
        if (typeof Tts.setDefaultPitch === 'function') {
          await Tts.setDefaultPitch(1.0);
        }
        
        console.log('TTS initialized successfully');
      } catch (error) {
        console.error('TTS initialization error:', error);
      }
    };

    initializeTts();

    return () => {
      if (Tts && typeof Tts.removeAllListeners === 'function') {
        try {
          Tts.removeAllListeners('tts-start');
          Tts.removeAllListeners('tts-finish');
          Tts.removeAllListeners('tts-cancel');
        } catch (error) {
          console.error('TTS cleanup error:', error);
        }
      }
    };
  }, []);

  // Voice Recognition Event Handlers
  const onSpeechStart = useCallback((e: any) => {
    console.log('Speech recognition started', e);
    setIsListening(true);
  }, []);

  const onSpeechRecognized = useCallback((e: any) => {
    console.log('Speech recognized', e);
  }, []);

  const onSpeechEnd = useCallback((e: any) => {
    console.log('Speech recognition ended', e);
    setIsListening(false);
    
    // Set flag to ignore subsequent errors from the ending session
    isIntentionallyStoppingRef.current = true;
    setTimeout(() => {
      isIntentionallyStoppingRef.current = false;
    }, 1000);
  }, []);

  const onSpeechError = useCallback((e: any) => {
    console.log('Speech recognition error:', e);
    
    const errorCode = e?.error?.code || e?.code || '';
    const errorMessage = e?.error?.message || e?.message || '';
    
    // If we're intentionally stopping, ignore all errors
    if (isIntentionallyStoppingRef.current) {
      console.log('Ignoring error during intentional stop:', errorCode);
      return;
    }
    
    setIsListening(false);
    setIsVoiceMode(false);
    setShowVoiceModal(false);
    
    // Clear recording timer
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    
    // Handle specific error codes
    switch (errorCode) {
      case '7': // ERROR_NO_MATCH
      case '6': // ERROR_SPEECH_TIMEOUT
      case '11': // Didn't understand
      case '5': // ERROR_CLIENT
        // Just stop silently, don't show alerts or try to recover
        console.log(`Error ${errorCode}: Stopping silently`);
        break;
      case '4': // ERROR_SERVER
        Alert.alert('Server Error', 'Please check your internet connection.');
        break;
      case '3': // ERROR_AUDIO
        Alert.alert('Audio Error', 'Please check your microphone permissions.');
        break;
      case '2': // ERROR_NETWORK
        Alert.alert('Network Error', 'Please check your internet connection.');
        break;
      case '1': // ERROR_NETWORK_TIMEOUT
        Alert.alert('Network Timeout', 'Please check your internet connection.');
        break;
      default:
        if (errorMessage.includes('No speech input')) {
          Alert.alert('No Speech Detected', 'Please try speaking again.');
        } else if (errorMessage.includes('Permission')) {
          Alert.alert('Permission Required', 'Microphone permission is required.');
        } else {
          Alert.alert('Voice Recognition Error', 'Please try again.');
        }
    }
  }, []);

  const onSpeechResults = useCallback((e) => {
    console.log('Final speech results:', e);
    const result = e.value?.[0] || '';
    if (result) {
      console.log('Final speech result:', result);
      setSpeechToTextResult(result);
      setMessage(result);
      setIsTyping(!!result);
      setIsVoiceMode(false);
      setIsListening(false);
      setShowVoiceModal(false); // Close the modal when we get results
      setIsCurrentMessageFromVoice(true); // Mark that this message came from voice
      
      // Clear recording timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      // Set flag to ignore subsequent errors
      isIntentionallyStoppingRef.current = true;
      setTimeout(() => {
        isIntentionallyStoppingRef.current = false;
      }, 1000);
      
      // REMOVED: Auto-send functionality - user will manually send
    }
  }, []);

  const onSpeechPartialResults = useCallback((e) => {
    console.log('Partial speech results:', e);
    const partialResult = e.value?.[0] || '';
    if (partialResult) {
      console.log('Partial speech result:', partialResult);
      setRecognizedText(partialResult);
      setMessage(partialResult);
    }
  }, []);

  const onSpeechVolumeChanged = useCallback((e) => {
    console.log('Speech volume changed:', e.value);
  }, []);

  // Initialize Voice Recognition
  useEffect(() => {
    const initializeVoice = async () => {
      // Get a fresh Voice module reference
      const freshVoiceRef = getVoiceModule();
      
      if (!freshVoiceRef) {
        console.log('Voice recognition module not available');
        setVoiceAvailable(false);
        return;
      }

      try {
        // Check permissions first
        const hasPermission = await requestMicrophonePermission();
        if (!hasPermission) {
          console.log('No microphone permission');
          return;
        }

        // Check voice availability with fresh reference
        const available = await checkVoiceAvailability();
        if (!available || !freshVoiceRef) {
          console.log('Voice recognition not available or freshVoiceRef is null');
          return;
        }

        // Destroy any existing instance first
        try {
          if (freshVoiceRef && typeof freshVoiceRef.destroy === 'function') {
            await freshVoiceRef.destroy();
            console.log('Previous Voice instance destroyed');
          }
        } catch (destroyError) {
          console.log('No previous Voice instance to destroy');
        }

        // Get another fresh reference after destroy (in case destroy affected the reference)
        const postDestroyVoice = getVoiceModule();
        if (!postDestroyVoice) {
          console.error('Voice became null after destroy operation');
          setVoiceAvailable(false);
          return;
        }

        // Set up event listeners using the fresh reference
        if (postDestroyVoice && typeof postDestroyVoice === 'object') {
          postDestroyVoice.onSpeechStart = onSpeechStart;
          postDestroyVoice.onSpeechRecognized = onSpeechRecognized;
          postDestroyVoice.onSpeechEnd = onSpeechEnd;
          postDestroyVoice.onSpeechError = onSpeechError;
          postDestroyVoice.onSpeechResults = onSpeechResults;
          postDestroyVoice.onSpeechPartialResults = onSpeechPartialResults;
          postDestroyVoice.onSpeechVolumeChanged = onSpeechVolumeChanged;
          
          console.log('Voice event listeners set up successfully');
          
          // Update the global reference with the working one
          Voice = postDestroyVoice;
        } else {
          console.error('Voice object is not valid for setting up listeners');
          setVoiceAvailable(false);
          return;
        }

        setVoiceInitialized(true);
        console.log('Voice recognition initialized successfully');
        
      } catch (error) {
        console.error('Voice initialization error:', error);
        setVoiceAvailable(false);
        setVoiceInitialized(false);
      }
    };

    // Delay initialization to ensure modules are ready
    const timer = setTimeout(initializeVoice, 1000);

    return () => {
      clearTimeout(timer);
      
      // Clear recording timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      if (Voice && voiceInitialized) {
        try {
          // Clean up event handlers
          if (Voice && typeof Voice === 'object') {
            Voice.onSpeechStart = null;
            Voice.onSpeechRecognized = null;
            Voice.onSpeechEnd = null;
            Voice.onSpeechError = null;
            Voice.onSpeechResults = null;
            Voice.onSpeechPartialResults = null;
            Voice.onSpeechVolumeChanged = null;
          }
          
          if (typeof Voice.destroy === 'function') {
            Voice.destroy();
          }
          
          console.log('Voice cleanup completed');
        } catch (error) {
          console.error('Voice cleanup error:', error);
        }
      }
    };
  }, [requestMicrophonePermission, checkVoiceAvailability, onSpeechStart, onSpeechRecognized, onSpeechEnd, onSpeechError, onSpeechResults, onSpeechPartialResults, onSpeechVolumeChanged]);

  // Start Voice Recognition
  const startListening = async () => {
    // Get a fresh Voice module reference
    const freshVoice = getVoiceModule();
    
    if (!freshVoice) {
      Alert.alert('Voice Recognition Unavailable', 'Voice recognition module is not available.');
      return;
    }

    if (!voiceInitialized) {
      Alert.alert('Voice Recognition Not Ready', 'Please wait a moment and try again.');
      return;
    }

    try {
      // Double-check permissions
      if (!hasPermissions) {
        const hasPermission = await requestMicrophonePermission();
        if (!hasPermission) {
          Alert.alert('Permission Required', 'Microphone permission is required for voice recognition.');
          return;
        }
      }

      // Use the fresh Voice reference instead of the global one
      if (!freshVoice || typeof freshVoice.start !== 'function') {
        console.error('Fresh Voice module is null or start method unavailable');
        Alert.alert('Voice Error', 'Voice recognition service is not available. Please restart the app.');
        setVoiceAvailable(false);
        setVoiceInitialized(false);
        return;
      }

      // Stop any ongoing speech recognition first
      try {
        if (typeof freshVoice.stop === 'function') {
          await freshVoice.stop();
          console.log('Stopped previous voice session');
        }
      } catch (stopError) {
        console.log('No previous voice session to stop');
      }

      // Wait a bit before starting
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Reset flag before starting new session
      isIntentionallyStoppingRef.current = false;

      // Reset states
      setIsVoiceMode(true);
      setRecognizedText('');
      setSpeechToTextResult('');
      setMessage('');
      setRecordingDuration(0);
      setShowVoiceModal(true);
      
      // Start recording timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      // Start voice recognition with proper locale
      const locale = Platform.OS === 'ios' ? 'en-US' : 'en-US';
      
      // Use the fresh Voice reference and double-check it's still valid
      if (freshVoice && typeof freshVoice.start === 'function') {
        console.log('Starting voice recognition with fresh reference...');
        console.log('Fresh Voice object structure:', Object.keys(freshVoice));
        console.log('Fresh Voice start method type:', typeof freshVoice.start);
        
        try {
          await freshVoice.start(locale);
          console.log(`Voice recognition started successfully with locale: ${locale}`);
          
          // Update the global reference with the working one
          Voice = freshVoice;
        } catch (startError) {
          console.error('Detailed start error:', startError);
          console.error('Start error name:', startError?.name);
          console.error('Start error message:', startError?.message);
          console.error('Start error stack:', startError?.stack);
          throw startError;
        }
      } else {
        throw new Error('Fresh Voice reference became invalid during execution');
      }
      
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      setIsVoiceMode(false);
      setIsListening(false);
      setShowVoiceModal(false);
      
      // Clear timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      const errorMessage = error?.message || '';
      
      if (errorMessage.includes('Permission') || errorMessage.includes('RECORD_AUDIO')) {
        Alert.alert('Permission Required', 'Please grant microphone permission in your device settings.');
      } else if (errorMessage.includes('null') || errorMessage.includes('undefined') || errorMessage.includes('invalid')) {
        Alert.alert('Voice Service Error', 'Voice recognition service is not available. Please restart the app.');
        // Reset voice module
        setVoiceAvailable(false);
        setVoiceInitialized(false);
        // Try to reinitialize
        setTimeout(() => {
          const reinitVoice = getVoiceModule();
          if (reinitVoice) {
            Voice = reinitVoice;
            setVoiceAvailable(true);
          }
        }, 1000);
      } else {
        Alert.alert('Error', `Failed to start voice recognition: ${errorMessage}`);
      }
    }
  };

  // Stop Voice Recognition
  const stopListening = async () => {
    // Set flag to ignore errors during stop
    isIntentionallyStoppingRef.current = true;
    
    if (!Voice) {
      setIsVoiceMode(false);
      setIsListening(false);
      setShowVoiceModal(false);
      
      // Reset flag after a delay
      setTimeout(() => {
        isIntentionallyStoppingRef.current = false;
      }, 1000);
      
      return;
    }

    try {
      if (typeof Voice.stop === 'function') {
        await Voice.stop();
        console.log('Voice recognition stopped');
      }
      setIsVoiceMode(false);
      setIsListening(false);
      setShowVoiceModal(false);
      
      // Clear timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      // Reset flag after a delay to allow for any delayed error events
      setTimeout(() => {
        isIntentionallyStoppingRef.current = false;
      }, 1000);
      
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
      setIsVoiceMode(false);
      setIsListening(false);
      setShowVoiceModal(false);
      
      // Reset flag
      setTimeout(() => {
        isIntentionallyStoppingRef.current = false;
      }, 1000);
      
      // Clear timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  // Text-to-Speech function
  const speakText = async (text: string) => {
    if (!Tts || typeof Tts.speak !== 'function') {
      console.log('TTS not available');
      return;
    }

    try {
      // Stop any current speech
      if (typeof Tts.stop === 'function') {
        await Tts.stop();
      }
      
      // Clean the text
      const cleanText = text
        .replace(/[*_~#]/g, '') // Remove markdown characters
        .replace(/\n+/g, '. ') // Replace newlines with periods
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();

      if (cleanText.length > 0) {
        await Tts.speak(cleanText);
      }
    } catch (error) {
      console.error('TTS Error:', error);
    }
  };

  const handleTextChange = (text: string) => {
    setIsTyping(!!text);
    setMessage(text);
  };

  const handleContentSizeChange = (
    event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>
  ) => {
    setHeightOfMessageBox?.(event.nativeEvent.contentSize.height);
  };

  useEffect(() => {
    Animated.timing(animationValue, {
      toValue: isTyping ? 1 : 0,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [isTyping, animationValue]);

  const sendButtonStyle = {
    opacity: animationValue,
    transform: [
      {
        scale: animationValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1],
        }),
      },
    ],
  };

  const identifyImageApi = (prompt: string): boolean => {
    const imageRegex = /\b(generate\s*image|imagine)\b/i;
    return imageRegex.test(prompt);
  };

  const addChat = async (newId?: string | unknown) => {
    let selectedChatId = (newId as string) || currentChatId;

    if (length === 0 && message.trim().length > 0) {
      dispatch(
        updateChatSummary({
          chatId: selectedChatId || '',
          summary: message?.trim().slice(0, 40),
        })
      );
    }

    dispatch(
      addMessages({
        chatId: selectedChatId || '',
        message: {
          content: message,
          time: new Date().toString(),
          role: 'user',
          id: uuid.v4() as string,
          isMessageRead: false,
          isVoiceMessage: isCurrentMessageFromVoice, // Add voice flag
        },
      })
    );

    setMessage('');
    setIsTyping(false);

    let promptForAssistant = {
      content: message,
      time: new Date().toString(),
      role: 'user',
      id: length + 1,
      isMessageRead: false,
      isVoiceMessage: isCurrentMessageFromVoice, // Add voice flag
    };

    if (!identifyImageApi(message)) {
      fetchResponse(promptForAssistant, selectedChatId as string);
    } else {
      generateImage(promptForAssistant, selectedChatId as string);
    }

    dispatch(
      markMessageAsRead({
        chatId: selectedChatId,
        messageId: length + 1,
      })
    );
    
    // Reset voice flag after sending
    setIsCurrentMessageFromVoice(false);
  };

  const fetchResponse = async (
    mes: {
      content: string;
      time: string;
      role: string;
      id: number;
      isMessageRead: boolean;
      isVoiceMessage?: boolean;
    },
    selectedChatId: string
  ) => {
    let id = length + 2;

    dispatch(
      addAssistantMessage({
        chatId: selectedChatId,
        message: {
          content: '',
          time: mes.time,
          role: 'assistant',
          id: id.toString(),
          isLoading: true,
        },
      })
    );

    try {
      const chatCompletion = await client.chatCompletion({
        provider: 'novita',
        model: 'meta-llama/Llama-4-Scout-17B-16E-Instruct',
        messages: [...messages, mes],
        max_tokens: 750,
        stream: false,
      });

      const content =
        chatCompletion.choices[0]?.message?.content || 'No response from assistant';

      dispatch(
        updateAssistantMessage({
          chatId: selectedChatId,
          message: {
            content,
            time: new Date().toString(),
            role: 'assistant',
            id: id.toString(),
            isVoiceMessage: mes.isVoiceMessage, // Mark assistant response as voice if user sent via voice
          },
          messageId: id.toString(),
        })
      );

      // Speak the AI response if it was a voice message
      if (mes.isVoiceMessage || speechToTextResult.length > 0) {
        await speakText(content);
        setSpeechToTextResult(''); // Reset after speaking
      }

    } catch (error) {
      console.log('Fetch response error:', error);
      const errorMessage = 'Oops, something is not working';
      
      dispatch(
        updateAssistantMessage({
          chatId: selectedChatId,
          message: {
            content: errorMessage,
            time: new Date().toString(),
            role: 'assistant',
            id: id.toString(),
            isVoiceMessage: mes.isVoiceMessage, // Mark error message as voice too if original was voice
          },
          messageId: id.toString(),
        })
      );

      // Speak error message if it was a voice message
      if (mes.isVoiceMessage || speechToTextResult.length > 0) {
        await speakText(errorMessage);
        setSpeechToTextResult('');
      }
    }
  };

  const generateImage = async (
    mes: {
      content: string;
      time: string;
      role: string;
      id: number;
      isMessageRead: boolean;
    },
    selectedChatId: string
  ) => {
    let id = length + 2;

    dispatch(
      addAssistantMessage({
        chatId: selectedChatId,
        message: {
          content: '',
          time: mes.time,
          role: 'assistant',
          id: id.toString(),
          isLoading: true,
        },
      })
    );

    try {
      const res = await axios.post(
        STABLE_DIFFUSION_URL,
        {
          key: STABLE_DIFFUSION_KEY,
          prompt: message,
          negative_prompt: 'low-quality',
          width: '512',
          height: '512',
          safety_checkers: false,
          seed: null,
          samples: 1,
          base64: false,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const responseMessage = "I've generated an image for you based on your request.";

      dispatch(
        updateAssistantMessage({
          chatId: selectedChatId,
          message: {
            imageUri: res.data?.output[0],
            content: res.data?.output[0],
            time: new Date().toString(),
            role: 'assistant',
            id: id.toString(),
          },
          messageId: id.toString(),
        })
      );

      // Speak response for image generation if it was a voice message
      if (speechToTextResult.length > 0) {
        await speakText(responseMessage);
        setSpeechToTextResult('');
      }

    } catch (error) {
      console.log(error);
      const errorMessage = 'Oops, something is not working';
      
      dispatch(
        updateAssistantMessage({
          chatId: selectedChatId,
          message: {
            content: errorMessage,
            time: new Date().toString(),
            role: 'assistant',
            id: id.toString(),
          },
          messageId: id.toString(),
        })
      );

      // Speak error message if it was a voice message
      if (speechToTextResult.length > 0) {
        await speakText(errorMessage);
        setSpeechToTextResult('');
      }
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          bottom:
            Platform.OS === 'android'
              ? 10
              : Math.max(keyboardOffsetHeight, 10),
        },
      ]}
    >
      <VoiceRecordingModal
        isVisible={showVoiceModal}
        onClose={stopListening}
        isListening={isListening}
        recognizedText={recognizedText}
        recordingDuration={recordingDuration}
      />

      <View style={styles.subContainer}>
        <GlassCard 
            style={[styles.inputWrapper, isVoiceMode && styles.voiceActiveBorder]} 
            opacity={0.12}
            glow={isVoiceMode}
            glowColor={isVoiceMode ? '#2DD4BF' : 'transparent'}
        >
          <TextInput
            editable={!isVoiceMode}
            multiline
            ref={TextInputRef}
            value={message}
            style={[styles.textinput, { color: theme.text.primary }]}
            placeholder={isVoiceMode ? 'Neural Voice Listening...' : 'Query Neural Brain...'}
            placeholderTextColor="rgba(255,255,255,0.3)"
            onChangeText={handleTextChange}
            onContentSizeChange={handleContentSizeChange}
          />
        </GlassCard>

        <View style={styles.buttonRow}>
            {voiceAvailable && hasPermissions && voiceInitialized && (
            <TouchableOpacity
                style={[
                    styles.circleBtn,
                    { backgroundColor: isListening ? '#FF4F4F' : 'rgba(255,255,255,0.05)' }
                ]}
                onPress={isListening ? stopListening : startListening}
            >
                {isListening ? (
                <StopIcon color="#fff" size={20} />
                ) : (
                <Image source={audioIcon} style={[styles.audioIcon, { tintColor: theme.primary }]} />
                )}
            </TouchableOpacity>
            )}

            {isTyping && (
            <Animated.View style={sendButtonStyle}>
                <TouchableOpacity
                style={[styles.circleBtn, { backgroundColor: theme.primary }]}
                onPress={async () => {
                    const chatIndex: number = chats.findIndex(
                    (chat: { id: string }) => chat.id === currentChatId
                    );
                    if (chatIndex === -1) {
                    const newId = uuid.v4() as string;
                    setCurrentChatId(newId);
                    await dispatch(
                        createNewChat({
                        chatId: newId,
                        messages: [],
                        summary: 'New Chat',
                        })
                    );
                    await addChat(newId);
                    return;
                    }
                    await addChat();
                }}
                >
                <PaperAirplaneIcon color="#fff" size={20} />
                </TouchableOpacity>
            </Animated.View>
            )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'transparent',
    width: '100%',
  },
  subContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    marginHorizontal: 0,
    marginVertical: 0,
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 24,
    minHeight: 52,
    justifyContent: 'center',
  },
  voiceActiveBorder: {
    borderColor: '#2DD4BF',
    borderWidth: 1.5,
  },
  textinput: {
    fontSize: RFValue(13),
    fontFamily: 'Inter-Medium',
    maxHeight: 120,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  circleBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  audioIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  voiceIndicator: {
    padding: 10,
    borderRadius: 15,
    marginBottom: 10,
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
    alignItems: 'center',
  },
  voiceIndicatorText: {
    fontSize: 12,
    color: '#2DD4BF',
    fontWeight: 'bold',
  },
});

export default SendButton;
