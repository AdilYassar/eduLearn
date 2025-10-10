import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

const LegalModal = ({ 
  visible, 
  title, 
  content, 
  onAccept 
}) => {
  // Debug logging
  console.log('LegalModal rendering:', { visible, title, hasOnAccept: !!onAccept });
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>
          
          {/* Scrollable Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
            <View style={styles.contentPadding}>
              {content}
            </View>
          </ScrollView>
          
          {/* Always visible I Accept Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.acceptButton} 
              onPress={() => {
                console.log('I Accept button pressed for:', title);
                if (onAccept) {
                  onAccept();
                } else {
                  console.log('No onAccept function provided!');
                }
              }}
            >
              <Text style={styles.acceptButtonText}>I Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: '95%',
    maxHeight: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  title: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  content: {
    maxHeight: 400,
    backgroundColor: '#FFFFFF',
  },
  contentPadding: {
    padding: 20,
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  acceptButton: {
    backgroundColor: '#000000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: RFValue(14),
    fontWeight: 'bold',
  },
});

export default LegalModal;
