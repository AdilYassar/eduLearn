import { View, Text, Modal, TouchableOpacity, FlatList, Image } from 'react-native';
import React from 'react';
import { RFValue } from 'react-native-responsive-fontsize';
import { X, Mic, MicOff, Video, VideoOff } from 'lucide-react-native';
import { participantsModalStyles } from '../../styles/participantsModalStyles';

const ParticipantsModal = ({ visible, onClose, participants = [] }) => {
  const renderParticipant = ({ item }) => (
    <View style={participantsModalStyles.participantItem}>
      <View style={participantsModalStyles.participantInfo}>
        <Image 
          source={{ uri: item.photo || item.avatar || 'https://via.placeholder.com/40' }} 
          style={participantsModalStyles.participantAvatar}
        />
        <View style={participantsModalStyles.participantDetails}>
          <Text style={participantsModalStyles.participantName}>
            {item.name || item.userName || `User ${item.userId || 'Unknown'}`}
          </Text>
          <Text style={participantsModalStyles.participantStatus}>
            {item.isHost ? 'Host' : 'Participant'}
          </Text>
        </View>
      </View>
      
      <View style={participantsModalStyles.participantControls}>
        {item.micOn ? (
          <Mic size={RFValue(16)} color="#4CAF50" />
        ) : (
          <MicOff size={RFValue(16)} color="#F44336" />
        )}
        {item.videoOn ? (
          <Video size={RFValue(16)} color="#4CAF50" style={participantsModalStyles.controlIcon} />
        ) : (
          <VideoOff size={RFValue(16)} color="#F44336" style={participantsModalStyles.controlIcon} />
        )}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={participantsModalStyles.modalOverlay}>
        <View style={participantsModalStyles.modalContainer}>
          {/* Header */}
          <View style={participantsModalStyles.header}>
            <Text style={participantsModalStyles.title}>
              Participants ({participants.length})
            </Text>
            <TouchableOpacity onPress={onClose} style={participantsModalStyles.closeButton}>
              <X size={RFValue(20)} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Participants List */}
          <FlatList
            data={participants}
            renderItem={renderParticipant}
            keyExtractor={(item, index) => `participant-${index}`}
            style={participantsModalStyles.participantsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={participantsModalStyles.emptyState}>
                <Text style={participantsModalStyles.emptyText}>No participants joined yet</Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

export default ParticipantsModal;
