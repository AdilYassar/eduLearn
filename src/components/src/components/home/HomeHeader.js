import { View, Text, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useUserStore } from '../../service/userStore';
import InquiryModal from './InquiryModal';
import { RFValue } from 'react-native-responsive-fontsize';
import { Colors } from '../../utils/Constants';
import { CircleUser, Menu } from 'lucide-react-native';
import { headerStyles } from '../../styles/headerStyles';
import { navigate } from '../../navigation/NavigationUtil';
import {SafeAreaView} from 'react-native-safe-area-context';

const HomeHeader = () => {
  const [visible, setVisible] = useState(false);
  const { user } = useUserStore();

  useEffect(() => {
    const checkUserName = () => {
      const storedName = user?.name;
      if (!storedName) {
        setVisible(true);
      }
    };
    checkUserName();
  }, [user?.name]);

  const handleNavigation = () => {
    const storedName = user?.name;
    if (!storedName) {
      setVisible(true);
      return;
    } else {
      navigate('JoinMeetScreen');
    }
  };

  return (
    <>
      <SafeAreaView />
      <View style={headerStyles.container}>
        <Menu size={RFValue(20)} color={Colors.text} />
        <TouchableOpacity
          style={headerStyles.textContainer}
          onPress={handleNavigation}
        >
          <Text style={headerStyles.placeholderText}>
            Please Enter The Meeting Code...
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setVisible(true)}>
          {user?.photo ? (
            <Image
              source={{ uri: user.photo }}
              style={headerStyles.avatarIcon}
            />
          ) : (
            <CircleUser
              size={RFValue(20)}
              color={Colors.text}
            />
          )}
        </TouchableOpacity>
      </View>
      <InquiryModal onClose={() => setVisible(false)} visible={visible} />
    </>
  );
};

export default HomeHeader;
