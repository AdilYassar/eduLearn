import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { X, Send } from 'lucide-react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useLiveMeetStore } from '../src/service/meetStore';
import { useWS } from '../src/service/api/WSProvider';
import { useUserStore } from '../src/service/userStore';

const ChatModal = ({ visible, onClose }) => {
  const { messages, sessionId, participants } = useLiveMeetStore();
  const { user } = useUserStore();
  const { emit } = useWS();
  const [inputMessage, setInputMessage] = useState('');
  const flatListRef = useRef(null);

  const sendMessage = () => {
    if (!inputMessage.trim()) {
      return;
    }
    emit('send-chat', { sessionId, userId: user.id, message: inputMessage.trim() });
    setInputMessage('');
  };

  const renderMessage = ({ item }) => {
    const participant = participants.find(p => p.userId === item.userId);
    const photo = item.userId === user.id ? user.photo : participant?.photo || 'https://via.placeholder.com/40';

    return (
      <View style={styles.messageContainer}>
        <Image source={{ uri: photo }} style={styles.avatar} />
        <View style={styles.messageBubble}>
          <Text style={styles.messageText}>
            <Text style={styles.senderName}>{item.name}</Text>: {item.message}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerLeft} />
            <View style={styles.headerCenter}>
              <Text style={styles.title}>Chat</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => index.toString()}
            style={styles.messageList}
            ListEmptyComponent={<Text style={styles.emptyText}>No messages yet</Text>}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={inputMessage}
              onChangeText={setInputMessage}
              placeholder="Type a message..."
              maxLength={200}
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Send size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: RFValue(4),
    paddingBottom: RFValue(20),
    maxHeight: '70%',
    minHeight: '45%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: RFValue(8),
    marginBottom: RFValue(4),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: RFValue(20),
    paddingHorizontal: RFValue(16),
    paddingTop: RFValue(4),
  },
  headerLeft: {
    width: 30,
  },
  headerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: RFValue(18),
    fontWeight: '700',
    color: '#1a1a1a',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
  },
  messageList: {
    flex: 1,
    paddingHorizontal: RFValue(16),
  },
  messageContainer: {
    marginBottom: 8,
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  messageBubble: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 16,
    maxWidth: '80%',
  },
  senderName: {
    fontWeight: 'bold',
    color: '#007AFF',
    fontSize: RFValue(14),
  },
  messageText: {
    color: '#000',
    fontSize: RFValue(14),
    flexWrap: 'wrap',
  },
  emptyText: {
    textAlign: 'center',
    color: '#000',
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: RFValue(16),
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    color: '#000',
    placeholderTextColor: '#333',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatModal;
