import { StyleSheet, Dimensions } from 'react-native';
import {Colors, screenHeight, screenWidth} from '../utils/Constants';
import {RFValue} from 'react-native-responsive-fontsize';

// Add safety check for dimensions
const safeWidth = screenWidth && !isNaN(screenWidth) ? screenWidth : 400;
const safeHeight = screenHeight && !isNaN(screenHeight) ? screenHeight : 800;

export const homeStyles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
    },
    title: {
      fontFamily: 'OpenSans-Medium',
      fontSize: RFValue(15),
      textAlign: 'center',
    },
    subTitle: {
      fontFamily: 'OpenSans-Medium',
      fontSize: RFValue(12),
      opacity: 0.6,
      marginTop: 5,
      textAlign: 'center',
      width: '93%',
      alignSelf: 'center',
    },
    img: {
      width: safeWidth * 0.5,
      height: safeHeight * 0.3,
      resizeMode: 'contain',
      alignSelf: 'center',
      margin: 15,
      marginTop: safeHeight * 0.1,
    },
    buttonText: {
      color: '#fff',
      fontSize: RFValue(12),
      fontFamily: 'Roboto-Medium',
    },
    absoluteButton: {
      padding: 15,
      borderRadius: 15,
      backgroundColor: '#000',
      position: 'absolute',
      right: 20,
      bottom: 30, // Using 30 as a default fallback without Platform check
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    sessionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'transparent',
      padding: 15,
      marginVertical: 8,
      borderRadius: 10,
      marginHorizontal: 5,
    },
    sessionTextContainer: {
      flex: 1,
      marginHorizontal: 10,
    },
    sessionTitle: {
      fontFamily: 'Roboto-Medium',
      fontSize: RFValue(14),
    },
    sessionTime: {
      fontFamily: 'Roboto-Regular',
      fontSize: RFValue(12),
      opacity: 0.7,
    },
    joinButton: {
      backgroundColor: '#000',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      minWidth: 60,
      alignItems: 'center',
      justifyContent: 'center',
    },
    joinButtonText: {
      color: '#fff',
      fontFamily: 'Roboto-Medium',
      fontSize: RFValue(12),
      textAlign: 'center',
    },
  });
  