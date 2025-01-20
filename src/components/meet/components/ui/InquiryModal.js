/* eslint-disable react/self-closing-comp */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import 'react-native-get-random-values';
import { View, Text, Alert, TouchableOpacity, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useUserStore } from '../serviceComponent/zustandStore';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from 'react-native';
import { inquiryStyles } from '@components/meet/styles/inquiryStyles';
import { ScrollView } from 'react-native';

const InquiryModal = ({ visible, onClose }) => {
    const { user, setUser } = useUserStore();
    const [name, setName] = useState('');
    const [profilePhotoUrl, setProfilePhotoUrl] = useState('');

    useEffect(() => {
        if (visible) {
            const storedName = user?.name;
            const storedProfilePhotoUrl = user?.photo;
            setName(storedName || '');
            setProfilePhotoUrl(storedProfilePhotoUrl || '');
        }
    }, [visible]);

    const handleSave = () => {
        if (name && profilePhotoUrl) {
            setUser({
                id: uuidv4(),
                name,
                photo: profilePhotoUrl,
            });
            onClose();
        } else {
            Alert.alert('Please fill in all fields');
        }
    };

    return (
        <Modal
        visible={visible}
        onRequestClose={onClose}
        animationType="slide"
        transparent={true}
    >
        <View style={inquiryStyles.modalContainer}>
            <View style={inquiryStyles.modalContent}>
                <Text style={inquiryStyles.title}>Enter your details</Text>
                <TextInput
                    style={inquiryStyles.input}
                    placeholder="Enter your name"
                    value={name}
                    placeholderTextColor={'#666'}
                    onChangeText={setName}
                />
                <TextInput
                    style={inquiryStyles.input}
                    placeholder="Enter your Profile Photo URL"
                    value={profilePhotoUrl}
                    placeholderTextColor={'#666'}
                    onChangeText={setProfilePhotoUrl}
                />
                <View style={inquiryStyles.buttonContainer}>
                    <TouchableOpacity style={inquiryStyles.button} onPress={handleSave}>
                        <Text style={inquiryStyles.buttonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={inquiryStyles.button} onPress={onClose}>
                        <Text style={inquiryStyles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
    );
};

export default InquiryModal;