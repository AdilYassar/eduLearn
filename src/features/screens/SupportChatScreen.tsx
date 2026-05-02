import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Send, User, Headphones } from 'lucide-react-native';
import { useRoute } from '@react-navigation/native';
import { ThemedContainer, ThemedText, ThemedHeader, GlassCard } from '../../components/ui/ThemedComponents';
import { useTheme } from '../../context/ThemeContext';
import { supportService } from '../../service/supportService';
import { useWS } from '../../components/src/service/api/WSProvider';
import { useUser } from '../../service/hooks/useUser';

const SupportChatScreen = () => {
  const { theme } = useTheme();
  const route = useRoute();
  const { ticketId, subject } = route.params as { ticketId: string; subject: string };
  const { userData } = useUser();
  const { on, off, emit } = useWS();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchMessages();
    
    // Join ticket room
    emit('join', `ticket_${ticketId}`);

    // Listen for new messages
    on('support:message', (data: any) => {
      if (data.ticketId === ticketId) {
        setMessages((prev) => [...prev, data]);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      }
    });

    return () => {
      off('support:message');
      // No explicit leave mentioned in docs, but good practice if backend supports it
      // emit('leave', `ticket_${ticketId}`); 
    };
  }, [ticketId]);

  const fetchMessages = async () => {
    try {
      const response = await supportService.getMessages(ticketId);
      // Backend returns messages inside the .data key
      setMessages(response.data.data || []);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 200);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      // Optmistic update or wait for API? 
      // The user's backend emits the message, so we'll likely receive it via socket.
      await supportService.sendMessage({ ticketId, message: messageContent });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <ThemedContainer>
      <ThemedHeader title={subject || 'Support Chat'} showBack />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.primary} style={{ marginTop: 20 }} />
          ) : (
            messages.map((msg: any, index) => {
              const isMe = msg.senderType === 'User';
              return (
                <View 
                  key={msg._id || index} 
                  style={[styles.messageWrapper, isMe ? styles.myMessageWrapper : styles.theirMessageWrapper]}
                >
                  {!isMe && (
                    <View style={[styles.avatar, { backgroundColor: theme.primary + '20' }]}>
                      <Headphones size={14} color={theme.primary} />
                    </View>
                  )}
                  <View style={[
                    styles.messageBubble, 
                    isMe ? 
                    { backgroundColor: theme.primary, borderBottomRightRadius: 4 } : 
                    { backgroundColor: theme.card, borderBottomLeftRadius: 4, borderColor: theme.border, borderWidth: 1 }
                  ]}>
                    <ThemedText style={{ color: isMe ? '#FFF' : theme.text.primary, fontSize: 14 }}>
                      {msg.message}
                    </ThemedText>
                    <ThemedText style={[
                      styles.timestamp, 
                      { color: isMe ? 'rgba(255,255,255,0.7)' : theme.text.secondary }
                    ]}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </ThemedText>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        <GlassCard style={styles.inputContainer}>
          <TextInput
            style={[styles.textInput, { color: theme.text.primary }]}
            placeholder="Type your message..."
            placeholderTextColor={theme.text.secondary + '60'}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity 
            onPress={handleSend}
            disabled={!newMessage.trim()}
            style={[styles.sendButton, { backgroundColor: newMessage.trim() ? theme.primary : theme.text.secondary + '20' }]}
          >
            <Send size={18} color={newMessage.trim() ? '#FFF' : theme.text.secondary} />
          </TouchableOpacity>
        </GlassCard>
      </KeyboardAvoidingView>
    </ThemedContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  myMessageWrapper: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  theirMessageWrapper: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 'auto',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  timestamp: {
    fontSize: 9,
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'ios' ? 24 : 16,
    borderRadius: 24,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default SupportChatScreen;
