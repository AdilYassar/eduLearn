/* eslint-disable @typescript-eslint/no-unused-vars */
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';
import React, { useState } from 'react';
import { Bars2Icon, Bars3BottomLeftIcon, CheckBadgeIcon } from 'react-native-heroicons/solid';
import { RFValue } from 'react-native-responsive-fontsize';
import aiLogo from '../../assets/ai2.png';
import CustomText from '../ui/CustomText';
import { useDispatch } from 'react-redux';
import { clearAllChats, clearChat } from '../../redux/reducers/chatSlice';
import SideDrawer from './SideDrawer';
import { Colors } from '@utils/Constants';

interface Chat {
  id: string;
  summary: string;
  messages: string[];
  // Add other properties of a chat object here
}

interface CustomHeaderProps {
  currentChatId: string;
  chats: Chat[];
  setCurrentChatId: (id: string) => void;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  currentChatId,
  chats,
  setCurrentChatId,
}) => {
  const dispatch = useDispatch();
  const onClearChat = async () => {
    dispatch(clearChat({ chatId: currentChatId }));
  };

  const [visibile, setVisibile] = useState(false);

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={styles.subContainer}>
          <TouchableOpacity onPress={() => setVisibile(true)}>
            <Bars3BottomLeftIcon size={RFValue(20)} color="#fff" />
          </TouchableOpacity>
          <View style={styles.flexRow}>
            <Image source={aiLogo as ImageSourcePropType} style={styles.image} />
            <View>
              <CustomText>
                EduLearn AI <CheckBadgeIcon color="#27d366" size={14} />
              </CustomText>
              <CustomText opacity={0.7} size={12}>
                With Llama 3
              </CustomText>
            </View>
          </View>
          <TouchableOpacity onPress={onClearChat}>
            <CustomText size={14}>
              Clear
            </CustomText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      {visibile && (
        <SideDrawer
          setCurrentChatId={(id) => setCurrentChatId(id)}
          chats={chats}
          OnPressHide={() => setVisibile(false)}
          visibile={visibile}
          currentChatId={currentChatId}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  subContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  } ,
  image: {
    width: 38,
    height: 38,
    borderRadius: 40,
  } ,
  flexRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  } ,
  container: {
    padding: 20,
    backgroundColor: Colors.teal_400,
    borderBottomWidth: 0.18,
    borderBottomColor: Colors.teal_400,
  } ,
});

export default CustomHeader;