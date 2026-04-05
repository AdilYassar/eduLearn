import React, { createContext, useContext, useState, ReactNode } from 'react';

interface VoiceMessageContextType {
  playingMessageId: string | null;
  setPlayingMessageId: (id: string | null) => void;
}

const VoiceMessageContext = createContext<VoiceMessageContextType | undefined>(undefined);

export const VoiceMessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  return (
    <VoiceMessageContext.Provider value={{ playingMessageId, setPlayingMessageId }}>
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

