import { View, Text, Alert, Modal, TouchableOpacity, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, ScrollView, Platform, TextInput, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useUserStore } from '../../service/userStore'
import {inquiryStyles} from '../../styles/inquiryStyles'
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values'
import { AVATAR_OPTIONS, getDefaultAvatarUrl } from '../../../../utils/AvatarConstants';
import { GlassCard, ThemedText } from '../../../../components/ui/ThemedComponents';
import { useTheme } from '../../../../context/ThemeContext';

const InquiryModal = ({visible,onClose}) => {
    const {setUser, user} = useUserStore();
    const [name,setName]=useState('');
    const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
    const { theme } = useTheme();


    useEffect(() => {
        if(visible) {
        const storedName = user?.name;
        const storedProfilePhotoUrl = user?.photo;
        setName(storedName || '');
        setProfilePhotoUrl(storedProfilePhotoUrl || getDefaultAvatarUrl());
        }
    }, [visible, user?.name, user?.photo]);

    const handleAvatarSelect = (avatarUrl) => {
        setProfilePhotoUrl(avatarUrl);
    };

    const handleSave = () => {
        if(name && profilePhotoUrl){
            setUser({
                id: user?.id || uuidv4(), // Use existing ID if available, otherwise generate new one
                name: name,
                photo: profilePhotoUrl,
            })
        onClose();
        
        }
        else{
            Alert.alert('Error','Please enter your name and select an avatar.');
        }
    
    }



  return (
    <Modal 
    visible={visible}
    animationType="slide"
    transparent={true}
    onRequestClose={onClose}
    >
    <TouchableWithoutFeedback
    onPress={Keyboard.dismiss}

    >

    <View style= {inquiryStyles.modalContainer}>
    <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={inquiryStyles.keyboardAvoidingView}>
    <ScrollView 
    contentContainerStyle={inquiryStyles.scrollViewContent}
    >
        <View style={[inquiryStyles.modalContent, { backgroundColor: theme.background[0] || theme.card }]}>
        <ThemedText style={[inquiryStyles.title, { color: theme.text.primary }]}>Enter Your Details</ThemedText>
        <ThemedText style={[inquiryStyles.label, { color: theme.text.secondary }]}>Your Name:</ThemedText>
        <TextInput
        style={[inquiryStyles.input, { color: theme.text.primary, borderColor: theme.border, backgroundColor: 'transparent' }]}
        placeholder="Enter your full name"
        value={name}
        placeholderTextColor={theme.text.secondary}
        onChangeText={setName}

         />
         <ThemedText style={[inquiryStyles.label, { color: theme.text.secondary }]}>Select Your Avatar:</ThemedText>
         <View style={inquiryStyles.avatarGrid}>
             {AVATAR_OPTIONS.map((avatarUrl, index) => (
                 <TouchableOpacity
                     key={index}
                     style={[
                         inquiryStyles.avatarOption,
                         profilePhotoUrl === avatarUrl && [inquiryStyles.selectedAvatar, { borderColor: theme.primary }],
                     ]}
                     onPress={() => handleAvatarSelect(avatarUrl)}
                 >
                     <Image
                         source={{ uri: avatarUrl }}
                         style={inquiryStyles.avatarImage}
                     />
                     {profilePhotoUrl === avatarUrl && (
                         <View style={[inquiryStyles.checkmarkContainer, { backgroundColor: theme.primary }]}>
                             <ThemedText style={inquiryStyles.checkmark}>✓</ThemedText>
                         </View>
                     )}
                 </TouchableOpacity>
             ))}
         </View>
        </View>
    </ScrollView>
    
    {/* Fixed buttons at the bottom */}
    <View style={inquiryStyles.fixedButtonContainer}>
        <TouchableOpacity style={[inquiryStyles.button, { backgroundColor: theme.primary }]} onPress={handleSave}>
            <ThemedText style={[inquiryStyles.buttonText, { color: '#FFFFFF' }]}>
                Save
            </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[inquiryStyles.button, inquiryStyles.cancelButton, { backgroundColor: theme.card }]} onPress={onClose}>
            <ThemedText style={[inquiryStyles.cancelButtonText, { color: theme.text.primary }]}>
                Cancel
            </ThemedText>
        </TouchableOpacity>
    </View>

    </KeyboardAvoidingView>
    </View>

    </TouchableWithoutFeedback>
   

    </Modal>
  );
};

export default InquiryModal;