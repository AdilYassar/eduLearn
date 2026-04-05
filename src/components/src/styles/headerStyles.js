import { StyleSheet } from 'react-native';
import { screenHeight, screenWidth} from '../utils/Constants';
import {RFValue} from 'react-native-responsive-fontsize';
import {Colors} from '../utils/Constants'

export const headerStyles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: RFValue(10),
      paddingVertical: RFValue(8),
      // shadowOffset: {width: 1, height: 1},
      // shadowOpacity: 0.1,
      // shadowRadius: 2,
      // borderRadius: 10,
      // elevation:4,
      // padding: 10,
     
      // backgroundColor: Colors.teal_200,
    },
    placeholderText: {
      fontFamily: 'OpenSans-Regular',
      opacity: 0.6,
      color: Colors.text,
    },
    textContainer: {
      width: '80%',
      backgroundColor: 'transparent',
      height: RFValue(40),
      paddingHorizontal: RFValue(12),
      paddingVertical: RFValue(8),
      fontSize: RFValue(12),
      fontFamily: 'OpenSans-Regular',
    },
    avatarIcon: {
      width: RFValue(20),
      height: RFValue(20),
      borderRadius: RFValue(10),
      borderWidth: 1,
      borderColor: Colors.text,
    },
  });
  