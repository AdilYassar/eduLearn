import React from 'react';
import { Alert } from 'react-native';
import Share from 'react-native-share';
import Clipboard from '@react-native-clipboard/clipboard';

export const ShareUtils = {
  // Copy meeting invite link to clipboard
  copyToClipboard: async (text, message = 'Copied to clipboard!') => {
    try {
      Clipboard.setString(text);
      Alert.alert('Success', message);
      return true;
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard');
      return false;
    }
  },

  // Share meeting invite
  shareMeetingInvite: async (meetingData) => {
    const { meetingId, meetingTitle, meetingLink, startTime } = meetingData;
    
    const shareMessage = `🎓 You're invited to join: ${meetingTitle || 'EduLearn Meeting'}

📅 Meeting ID: ${meetingId}
🕐 Time: ${startTime || 'Now'}
🔗 Join Link: ${meetingLink}

Join the meeting using EduLearn app or click the link above.

Powered by EduLearn 📚`;

    const shareOptions = {
      title: 'Join EduLearn Meeting',
      message: shareMessage,
      url: meetingLink,
      subject: `EduLearn Meeting Invitation - ${meetingTitle || meetingId}`,
    };

    try {
      const result = await Share.open(shareOptions);
      console.log('Share result:', result);
      return result;
    } catch (error) {
      if (error.message !== 'User did not share') {
        Alert.alert('Error', 'Failed to share meeting invite');
      }
      return false;
    }
  },

  // Share via specific platform
  shareToWhatsApp: async (meetingData) => {
    const { meetingId, meetingTitle, meetingLink, startTime } = meetingData;
    
    const message = `🎓 *EduLearn Meeting Invitation*

📋 *Meeting:* ${meetingTitle || 'EduLearn Session'}
🆔 *Meeting ID:* ${meetingId}
🕐 *Time:* ${startTime || 'Now'}
🔗 *Link:* ${meetingLink}

Join using EduLearn app! 📚`;

    try {
      const result = await Share.shareSingle({
        title: 'Share via WhatsApp',
        message: message,
        url: meetingLink,
        social: Share.Social.WHATSAPP,
      });
      return result;
    } catch (error) {
      Alert.alert('Error', 'WhatsApp not available or failed to share');
      return false;
    }
  },

  // Share via email
  shareViaEmail: async (meetingData) => {
    const { meetingId, meetingTitle, meetingLink, startTime } = meetingData;
    
    const subject = `EduLearn Meeting Invitation - ${meetingTitle || meetingId}`;
    const message = `You're invited to join an EduLearn meeting!

Meeting Details:
- Title: ${meetingTitle || 'EduLearn Session'}
- Meeting ID: ${meetingId}
- Time: ${startTime || 'Now'}
- Join Link: ${meetingLink}

To join the meeting:
1. Download EduLearn app if you haven't already
2. Click the join link or enter the Meeting ID
3. Start learning together!

Best regards,
EduLearn Team`;

    try {
      const result = await Share.shareSingle({
        title: 'Share via Email',
        message: message,
        url: meetingLink,
        subject: subject,
        social: Share.Social.EMAIL,
      });
      return result;
    } catch (error) {
      Alert.alert('Error', 'Email app not available or failed to share');
      return false;
    }
  },

  // Get clipboard content
  getClipboardContent: async () => {
    try {
      const content = await Clipboard.getString();
      return content;
    } catch (error) {
      console.error('Failed to get clipboard content:', error);
      return '';
    }
  },

  // Check if clipboard has content
  hasClipboardContent: async () => {
    try {
      const content = await Clipboard.getString();
      return content && content.length > 0;
    } catch (error) {
      return false;
    }
  },

  // Share with options modal
  shareWithOptions: async (meetingData) => {
    const options = [
      {
        title: 'Copy Link',
        action: () => ShareUtils.copyToClipboard(meetingData.meetingLink, 'Meeting link copied!'),
      },
      {
        title: 'Share via WhatsApp',
        action: () => ShareUtils.shareToWhatsApp(meetingData),
      },
      {
        title: 'Share via Email',
        action: () => ShareUtils.shareViaEmail(meetingData),
      },
      {
        title: 'More Options',
        action: () => ShareUtils.shareMeetingInvite(meetingData),
      },
    ];

    // You can create a custom action sheet here or use the default share
    return ShareUtils.shareMeetingInvite(meetingData);
  },
};

export default ShareUtils;
