import { View, Text, Alert, Modal, TouchableOpacity, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, ScrollView, Platform, TextInput, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useUserStore } from '../../service/userStore'
import {inquiryStyles} from '../../styles/inquiryStyles'
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values'
import { AVATAR_OPTIONS, getDefaultAvatarUrl } from '../../../../utils/AvatarConstants';


const InquiryModal = ({visible,onClose}) => {
    const {setUser, user} = useUserStore();
    const [name,setName]=useState('');
    const [profilePhotoUrl, setProfilePhotoUrl] = useState('');


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
        <View style = {inquiryStyles.modalContent}>
        <Text style={inquiryStyles.title}>Enter Your Details</Text>
        <Text style={inquiryStyles.label}>Your Name:</Text>
        <TextInput
        style={inquiryStyles.input}
        placeholder="Enter your full name"
        value={name}
        placeholderTextColor={'#000'}
        onChangeText={setName}

         />
         <Text style={inquiryStyles.label}>Select Your Avatar:</Text>
         <View style={inquiryStyles.avatarGrid}>
             {AVATAR_OPTIONS.map((avatarUrl, index) => (
                 <TouchableOpacity
                     key={index}
                     style={[
                         inquiryStyles.avatarOption,
                         profilePhotoUrl === avatarUrl && inquiryStyles.selectedAvatar,
                     ]}
                     onPress={() => handleAvatarSelect(avatarUrl)}
                 >
                     <Image
                         source={{ uri: avatarUrl }}
                         style={inquiryStyles.avatarImage}
                     />
                     {profilePhotoUrl === avatarUrl && (
                         <View style={inquiryStyles.checkmark}>
                             <Text style={inquiryStyles.checkmarkText}>✓</Text>
                         </View>
                     )}
                 </TouchableOpacity>
             ))}
         </View>
        </View>
    </ScrollView>
    
    {/* Fixed buttons at the bottom */}
    <View style={inquiryStyles.fixedButtonContainer}>
        <TouchableOpacity style={inquiryStyles.button} onPress={handleSave}>
            <Text style={inquiryStyles.buttonText}>
                Save
            </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[inquiryStyles.button, inquiryStyles.cancelButton]} onPress={onClose}>
            <Text style={inquiryStyles.cancelButtonText}>
                Cancel
            </Text>
        </TouchableOpacity>
    </View>

    </KeyboardAvoidingView>
    </View>

    </TouchableWithoutFeedback>
   

    </Modal>
  );
};

export default InquiryModal;