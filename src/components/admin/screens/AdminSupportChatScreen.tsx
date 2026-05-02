import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, User, Headphones, CheckCircle } from 'lucide-react-native';
import { useAppTheme } from '../../../context/ThemeContext';
import AdminHeader from '../ui/AdminHeader';
import { adminSupportService } from '../services/adminAPI';
import { useWS } from '../../src/service/api/WSProvider';
import { useSelector } from 'react-redux';

const AdminSupportChatScreen = ({ route, navigation }: any) => {
  const { theme } = useAppTheme();
  const { ticketId, ticket } = route.params;
  const currentAdmin = useSelector((state: any) => state.admin.currentAdmin);
  const { on, off, emit } = useWS();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(ticket?.status || 'Open');
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
    };
  }, [ticketId]);

  const fetchMessages = async () => {
    try {
      const response = await adminSupportService.getTicketMessages(ticketId);
      console.log('AdminSupportChatScreen: Messages Response:', response.data);
      // Backend returns messages inside the .data key
      setMessages(response.data.data || []);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 200);
    } catch (error) {
      console.error('AdminSupportChatScreen: Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !currentAdmin?._id) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      await adminSupportService.sendReply(ticketId, messageContent, currentAdmin._id);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send reply.');
    }
  };

  const toggleStatus = async () => {
    const nextStatus = status === 'Resolved' ? 'Open' : 'Resolved';
    try {
      await adminSupportService.updateTicketStatus(ticketId, { status: nextStatus });
      setStatus(nextStatus);
    } catch (error) {
      Alert.alert('Error', 'Failed to update ticket status.');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.dark ? '#1c1b21' : '#F8F6FD',
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 32,
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
      width: 32,
      height: 32,
      borderRadius: 16,
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
      backgroundColor: theme.dark ? '#25232a' : '#ffffff',
      borderTopWidth: 1,
      borderTopColor: theme.dark ? '#312f36' : '#EDE5F8',
    },
    textInput: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 10,
      maxHeight: 100,
      fontSize: 14,
      color: theme.dark ? '#fdf7ff' : '#2D2560',
      backgroundColor: theme.dark ? '#312f36' : '#F8F6FD',
      borderRadius: 20,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 12,
    },
    statusButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <AdminHeader
        title={ticket?.subject || 'Ticket Chat'}
        subtitle={`Student: ${ticket?.studentName || 'User'}`}
        showBack
        onBackPress={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity 
            style={[styles.statusButton, { backgroundColor: status === 'Resolved' ? '#5D4BA3' : theme.dark ? '#312f36' : '#EDE5F8' }]}
            onPress={toggleStatus}
          >
            <CheckCircle size={14} color={status === 'Resolved' ? '#FFF' : '#5D4BA3'} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: status === 'Resolved' ? '#FFF' : '#5D4BA3' }}>
              {status === 'Resolved' ? 'Resolved' : 'Mark Resolved'}
            </Text>
          </TouchableOpacity>
        }
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#5D4BA3" style={{ marginTop: 20 }} />
          ) : (
            messages.map((msg: any, index) => {
              const isMe = msg.senderType === 'Admin';
              return (
                <View 
                  key={msg._id || index} 
                  style={[styles.messageWrapper, isMe ? styles.myMessageWrapper : styles.theirMessageWrapper]}
                >
                  {!isMe && (
                    <View style={[styles.avatar, { backgroundColor: theme.dark ? '#312f36' : '#F8F6FD' }]}>
                      <User size={16} color="#5D4BA3" />
                    </View>
                  )}
                  <View style={[
                    styles.messageBubble, 
                    isMe ? 
                    { backgroundColor: '#5D4BA3', borderBottomRightRadius: 4 } : 
                    { backgroundColor: theme.dark ? '#312f36' : '#ffffff', borderBottomLeftRadius: 4, borderColor: theme.dark ? '#484551' : '#EDE5F8', borderWidth: 1 }
                  ]}>
                    <Text style={{ color: isMe ? '#FFF' : (theme.dark ? '#fdf7ff' : '#2D2560'), fontSize: 14 }}>
                      {msg.message}
                    </Text>
                    <Text style={[
                      styles.timestamp, 
                      { color: isMe ? 'rgba(255,255,255,0.7)' : (theme.dark ? '#cac4d3' : '#797582') }
                    ]}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a reply..."
            placeholderTextColor={theme.dark ? '#cac4d380' : '#79758280'}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity 
            onPress={handleSend}
            disabled={!newMessage.trim()}
            style={[styles.sendButton, { backgroundColor: newMessage.trim() ? '#5D4BA3' : (theme.dark ? '#312f36' : '#EDE5F8') }]}
          >
            <Send size={20} color={newMessage.trim() ? '#FFF' : '#cac4d3'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AdminSupportChatScreen;
