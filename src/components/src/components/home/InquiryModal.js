import { View, Text, Alert, Modal, TouchableOpacity, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, ScrollView, Platform, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useUserStore } from '../../service/userStore'
import {inquiryStyles} from '../../styles/inquiryStyles'
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values'


const InquiryModal = ({visible,onClose}) => {
    const {setUser, user} = useUserStore();
    const [name,setName]=useState('');
    const [profilePhotoUrl, setProfilePhotoUrl] = useState('');


    useEffect(() => {
        if(visible) {
        const storedName = user?.name;
        const storedProfilePhotoUrl = user?.photo;
        setName(storedName || '');
        setProfilePhotoUrl(storedProfilePhotoUrl || '');

        

    }
    }, [visible, user?.name, user?.photo]);


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
            Alert.alert('Error','Please enter both name and profile photo URL.');
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
        <TextInput
        style={inquiryStyles.input}
        placeholder='Your Name'
        value={name}
        placeholderTextColor={'#888'}
        onChangeText={setName}

         />
         <TextInput
        style={inquiryStyles.input}
        placeholder='Please add a URL of your photo'
        value={profilePhotoUrl}
        placeholderTextColor={'#888'}
        onChangeText={setProfilePhotoUrl}
         />
        <View style={inquiryStyles.buttonContainer}>
            <TouchableOpacity style={inquiryStyles.button} onPress={handleSave}>
                <Text style={inquiryStyles.buttonText}>
                    Save
                </Text>
            </TouchableOpacity>
                   <TouchableOpacity style={[inquiryStyles.button, inquiryStyles.cancelButton]} onPress={onClose}>
                <Text style={inquiryStyles.buttonText}>
                    Cancel
                </Text>
            </TouchableOpacity>
        </View>


        </View>
    </ScrollView>

    </KeyboardAvoidingView>
    </View>

    </TouchableWithoutFeedback>
   

    </Modal>
  )
}

export default InquiryModal