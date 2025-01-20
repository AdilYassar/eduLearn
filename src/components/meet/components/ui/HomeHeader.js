/* eslint-disable react/jsx-no-undef */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useUserStore } from '../serviceComponent/zustandStore';
import InquiryModal from './InquiryModal';
import { headerStyles } from '@components/meet/styles/headerStyles';
import  Icon  from 'react-native-vector-icons/MaterialIcons';
import { navigate } from '@utils/Navigation';

const HomeHeader = () => {
    const [visible, setVisible] = useState(false);
    const { user } = useUserStore();

useEffect(() => {
    const checkUserName = () => {
        const storedName = user?.name;
        if (!storedName) {
            console.log('User name is not set, opening modal'); // Debug log
            setVisible(true);
        }
    };

    checkUserName();
}, [user]);


const handleNavigation = () => {
  const storedName = user?.name;
  if (!storedName) {
    console.log('User name is not set, opening modal'); // Debug log
    setVisible(true);
    return
    }
    navigate("JoinCallScreen");
}
    return (
        <>
            <SafeAreaView />
            <View style={headerStyles.container}>
            <Icon name="menu" size={30} color="#000" />
            <TouchableOpacity onPress={handleNavigation}
            style={headerStyles.textContainer}
            >
              <Text style={headerStyles.placeholderText}>
                Enter Call Code 
              </Text>
            </TouchableOpacity>
            <Icon name="account-circle" size={30} color="#000" 

              onPress={() => setVisible(true)}
            />
             
            </View>
            <InquiryModal onClose={() => setVisible(false)} visible={visible} />
        </>
    );
};

export default HomeHeader;