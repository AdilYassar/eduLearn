import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';

interface VoiceMessageContextType {
  playingMessageId: string | null;
  setPlayingMessageId: (id: string | null) => void;
  playMessage: (messageId: string, text: string) => Promise<void>;
  pauseMessage: () => Promise<void>;
  stopMessage: () => Promise<void>;
  isPlaying: boolean;
}

const VoiceMessageContext = createContext<VoiceMessageContextType | undefined>(undefined);

// Load TTS module
let Tts: any = null;

const loadTtsModule = () => {
  try {
    const TtsModule = require('react-native-tts');
    const loadedTts = TtsModule.default || TtsModule;
    
    if (loadedTts && typeof loadedTts === 'object') {
      Tts = loadedTts;
      return loadedTts;
    }
    return null;
  } catch (error: any) {
    console.warn('TTS module not available:', error.message);
    return null;
  }
};

export const VoiceMessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const ttsInitializedRef = useRef<boolean>(false);

  // Initialize TTS
  useEffect(() => {
    const initializeTts = async () => {
      if (!Tts) {
        const module = loadTtsModule();
        if (!module) return;
      }

      try {
        if (typeof Tts.setDefaultLanguage === 'function') {
          await Tts.setDefaultLanguage('en-US');
        }
        if (typeof Tts.setDefaultRate === 'function') {
          await Tts.setDefaultRate(0.5);
        }
        if (typeof Tts.setDefaultPitch === 'function') {
          await Tts.setDefaultPitch(1.0);
        }

        // Setup TTS event listeners
        if (typeof Tts.addEventListener === 'function') {
          Tts.addEventListener('tts-start', () => {
            setIsPlaying(true);
          });
          Tts.addEventListener('tts-finish', () => {
            setIsPlaying(false);
            setPlayingMessageId(null);
          });
          Tts.addEventListener('tts-cancel', () => {
            setIsPlaying(false);
          });
        }

        ttsInitializedRef.current = true;
        console.log('TTS initialized successfully in VoiceMessageContext');
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

  const playMessage = async (messageId: string, text: string) => {
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

      setPlayingMessageId(messageId);
      setIsPlaying(true);

      if (cleanText.length > 0) {
        await Tts.speak(cleanText);
      }
    } catch (error) {
      console.error('TTS Error:', error);
      setIsPlaying(false);
    }
  };

  const pauseMessage = async () => {
    if (!Tts || typeof Tts.pause !== 'function') {
      return;
    }

    try {
      await Tts.pause();
      setIsPlaying(false);
    } catch (error) {
      console.error('TTS Pause Error:', error);
    }
  };

  const stopMessage = async () => {
    if (!Tts || typeof Tts.stop !== 'function') {
      return;
    }

    try {
      await Tts.stop();
      setIsPlaying(false);
      setPlayingMessageId(null);
    } catch (error) {
      console.error('TTS Stop Error:', error);
    }
  };

  const value: VoiceMessageContextType = {
    playingMessageId,
    setPlayingMessageId,
    playMessage,
    pauseMessage,
    stopMessage,
    isPlaying,
  };

  return (
    <VoiceMessageContext.Provider value={value}>
      {children}
    </VoiceMessageContext.Provider>
  );
};

export const useVoiceMessage = (): VoiceMessageContextType => {
  const context = useContext(VoiceMessageContext);
  if (!context) {
    throw new Error('useVoiceMessage must be used within a VoiceMessageProvider');
  }
  return context;
};

