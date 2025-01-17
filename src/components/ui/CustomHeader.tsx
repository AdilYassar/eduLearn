/* eslint-disable react-native/no-inline-styles */
import {View, SafeAreaView, StyleSheet, Pressable, Image} from 'react-native';
import React, {FC, useEffect, useState} from 'react';
import {Colors, Fonts} from '@utils/Constants';
import Icon from 'react-native-vector-icons/Ionicons';
import {RFValue} from 'react-native-responsive-fontsize';
import {goBack} from '@utils/Navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomText from './CustomText';

interface UserData {
  profileImage?: string;
}

const CustomHeader: FC<{title: string; search?: boolean}> = ({search, title}) => {
  const [userImage, setUserImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          const parsedUserData: UserData = JSON.parse(storedUserData);
          setUserImage(parsedUserData.profileImage || null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <SafeAreaView>
      <View style={styles.flexRow}>
        <Pressable onPress={() => goBack()}>
          {userImage ? (
            <Image
              source={{uri: userImage}}
              style={styles.profileImage}
            />
          ) : (
            <Icon
              name="chevron-back"
              color={Colors.text}
              size={RFValue(24)}
              style={{left: -100, position: 'static'}}
              onPress={() => goBack()}
            />
          )}
        </Pressable>

        <CustomText
          style={styles.text}
          variant="h5"
          fontFamily={Fonts.SemiBold}>
          {title}
        </CustomText>
        <View>
          {search && (
            <Icon
              name="search"
              color={Colors.text}
              size={RFValue(16)}
              style={{left: 100}}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flexRow: {
    justifyContent: 'center',
    padding: 10,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 0.6,
    borderColor: Colors.border,
  },
  text: {
    textAlign: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    left: -100,
  },
});

export default CustomHeader;
