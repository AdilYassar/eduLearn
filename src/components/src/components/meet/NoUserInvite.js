import { View, Text, TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import Clipboard from '@react-native-clipboard/clipboard';
import Share from 'react-native-share';

import { useUserStore } from '../../service/userStore'
import {inviteStyles} from '../../styles/inviteStyles'
import { addHyphens } from '../../utils/Helpers'
import { useLiveMeetStore } from '../../service/meetStore'
import { Copy, User2 } from 'lucide-react-native'
const NoUserInvite = () => {

    const {sessionId} = useLiveMeetStore();
    const {user} = useUserStore();

    const meetingLink = `https://romantic-nanete-adildevelopment-3ec66986.koyeb.app/meeting/${sessionId}`;

    const handleCopyLink = async () => {
        try {
            Clipboard.setString(meetingLink);
            Alert.alert('Success', 'Meeting link copied to clipboard!');
        } catch (error) {
            Alert.alert('Error', 'Failed to copy link');
        }
    };

    const handleShareInvite = async () => {
        try {
            const shareOptions = {
                title: 'Meeting Invitation',
                message: `Join my meeting: ${meetingLink}\nMeeting ID: ${sessionId}`,
            };
            await Share.open(shareOptions);
        } catch (error) {
            Alert.alert('Error', 'Failed to share meeting');
        }
    };




  return (
    <View style = {inviteStyles.container}> 
      <Text style={inviteStyles.headerText} >Your Are The Only One Here {user?.name} </Text>
      <Text style = {inviteStyles.subText}>
        Share this code to invite others
      </Text>

       <View style = {inviteStyles.linkContainer}>
       <Text style = {inviteStyles.linkText}>
        {meetingLink}
        </Text>
        <TouchableOpacity style = {inviteStyles.iconButton} onPress={handleCopyLink}>
        <Copy  size = {20} color = "#0A84FF" />
        </TouchableOpacity>
       </View>
       <TouchableOpacity 
         style = {[inviteStyles.shareButton, {elevation: 5, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84}]}
         onPress={handleShareInvite}
       >
        <User2 size = {20} color = "#fff" />
        <Text style = {inviteStyles.shareText}>
            Share invite
        </Text>
       </TouchableOpacity>
    </View>
  )
}

export default NoUserInvite