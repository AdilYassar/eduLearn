import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { 
  Share2, 
  Copy, 
  Mail, 
  MessageCircle, 
  Link, 
  Users,
  X,
} from 'lucide-react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Share from 'react-native-share';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

const ShareModal = ({ visible, onClose, meetingData }) => {
  const { theme } = useTheme();
  const handleCopyLink = async () => {
    try {
      Clipboard.setString(meetingData.meetingLink);
      Alert.alert('Success', 'Meeting link copied to clipboard!');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to copy link');
    }
  };

  const handleWhatsAppShare = async () => {
    try {
      const shareOptions = {
        message: `Join my meeting: ${meetingData.meetingLink}\nMeeting ID: ${meetingData.meetingId}`,
        social: Share.Social.WHATSAPP,
      };
      await Share.shareSingle(shareOptions);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to share via WhatsApp');
    }
  };

  const handleEmailShare = async () => {
    try {
      const shareOptions = {
        title: 'Meeting Invitation',
        message: `You're invited to join my meeting!\n\nMeeting Link: ${meetingData.meetingLink}\nMeeting ID: ${meetingData.meetingId}`,
        email: '',
        subject: 'Meeting Invitation',
      };
      await Share.open(shareOptions);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to share via email');
    }
  };

  const handleGeneralShare = async () => {
    try {
      const shareOptions = {
        title: 'Meeting Invitation',
        message: `Join my meeting: ${meetingData.meetingLink}\nMeeting ID: ${meetingData.meetingId}`,
      };
      await Share.open(shareOptions);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to share meeting');
    }
  };

  const handleCopyMeetingId = async () => {
    try {
      Clipboard.setString(meetingData.meetingId);
      Alert.alert('Success', 'Meeting ID copied to clipboard!');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to copy meeting ID');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.modalContainer, { backgroundColor: theme.background[0] || theme.card }]}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: theme.border }]} />
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft} />
            <View style={styles.headerCenter}>
              <Users size={22} color={theme.primary} />
              <Text style={[styles.title, { color: theme.text.primary }]}>Share Meeting</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: theme.componentBackground[0] }]}>
              <X size={20} color={theme.text.secondary} />
            </TouchableOpacity>
          </View>

            {/* Primary Actions */}
            <View style={styles.primaryActions}>
              <TouchableOpacity
                style={[styles.shareInviteButton, { backgroundColor: theme.primary }]}
                onPress={handleGeneralShare}
                activeOpacity={0.8}
              >
                <Share2 size={20} color="#fff" />
                <Text style={[styles.shareInviteText, { color: '#fff' }]}>Share Invite</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.copyLinkButton, { borderColor: theme.primary, backgroundColor: theme.componentBackground[0] }]}
                onPress={handleCopyLink}
                activeOpacity={0.7}
              >
                <Link size={20} color={theme.primary} />
              </TouchableOpacity>
            </View>

            {/* Secondary Options */}
            <View style={styles.secondaryOptions}>
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>More Options</Text>
              
              <TouchableOpacity
                style={styles.secondaryOption}
                onPress={handleCopyMeetingId}
                activeOpacity={0.7}
              >
                <View style={[styles.secondaryIconContainer, { backgroundColor: theme.componentBackground[0] }]}>
                  <Copy size={18} color={theme.text.secondary} />
                </View>
                <Text style={[styles.secondaryOptionText, { color: theme.text.primary }]}>Copy Meeting ID</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryOption}
                onPress={handleWhatsAppShare}
                activeOpacity={0.7}
              >
                <View style={[styles.secondaryIconContainer, { backgroundColor: '#E8F5E8' }]}>
                  <MessageCircle size={18} color="#25D366" />
                </View>
                <Text style={[styles.secondaryOptionText, { color: theme.text.primary }]}>Share via WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryOption}
                onPress={handleEmailShare}
                activeOpacity={0.7}
              >
                <View style={[styles.secondaryIconContainer, { backgroundColor: '#FFF2E8' }]}>
                  <Mail size={18} color="#FF6B35" />
                </View>
                <Text style={[styles.secondaryOptionText, { color: theme.text.primary }]}>Share via Email</Text>
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
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: RFValue(4),
    paddingBottom: RFValue(20),
    maxHeight: '65%',
    minHeight: '40%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: RFValue(8),
    marginBottom: RFValue(4),
  },
  modal: {
    paddingHorizontal: RFValue(16),
    paddingTop: RFValue(8),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: RFValue(16),
    paddingHorizontal: RFValue(16),
    paddingTop: RFValue(4),
  },
  headerLeft: {
    width: 30,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: RFValue(18),
    fontWeight: '700',
    marginLeft: RFValue(8),
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  primaryActions: {
    flexDirection: 'row',
    marginBottom: RFValue(20),
    marginHorizontal: RFValue(16),
    gap: RFValue(10),
  },
  shareInviteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: RFValue(14),
    borderRadius: 12,
    gap: RFValue(8),
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  shareInviteText: {
    fontSize: RFValue(15),
    fontWeight: '700',
  },
  copyLinkButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  secondaryOptions: {
    marginBottom: RFValue(18),
    marginHorizontal: RFValue(16),
  },
  sectionTitle: {
    fontSize: RFValue(16),
    fontWeight: '700',
    marginBottom: RFValue(10),
  },
  secondaryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: RFValue(10),
    paddingHorizontal: RFValue(4),
    borderRadius: 8,
    marginBottom: RFValue(2),
  },
  secondaryIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: RFValue(12),
  },
  secondaryOptionText: {
    fontSize: RFValue(15),
    fontWeight: '600',
  },
  optionsContainer: {
    marginBottom: RFValue(20),
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: RFValue(16),
    paddingHorizontal: RFValue(4),
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: RFValue(16),
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: RFValue(16),
    fontWeight: '500',
    marginBottom: RFValue(2),
  },
  optionSubtitle: {
    fontSize: RFValue(14),
  },
});

export default ShareModal;
