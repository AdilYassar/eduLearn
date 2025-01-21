import { StyleSheet } from 'react-native';
import {screenHeight, screenWidth} from '../utils/Constants';
import {RFValue} from 'react-native-responsive-fontsize';
import { Colors } from '@utils/Constants';



export const inviteStyles = StyleSheet.create({
    container: {
      flex: 0.7,
      justifyContent: 'center',
      backgroundColor: Colors.teal_300,
      alignItems: 'flex-start',
      paddingHorizontal: 20,
    },
    headerText: {
      color: 'white',
      fontSize: RFValue(12),
      fontFamily: 'OpenSans-SemiBold',
      marginBottom: 8,
    },
    subText: {
      color: '#000',
      fontSize: RFValue(10),
      fontFamily: 'OpenSans-Regular',
      textAlign: 'left',
      marginBottom: 24,
    },
    linkContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.teal_700,
      borderRadius: 2,
      width: '90%',
      padding: 14,
      marginBottom: 20,
    },
    linkText: {
      color: 'white',
      fontSize: 14,
      flex: 1,
    },
    iconButton: {
      marginLeft: 10,
    },
    shareButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.teal_700,
      borderRadius: 40,
      paddingVertical: 12,
      paddingHorizontal: 20,
    },
    shareText: {
      color: 'black',
      fontSize: RFValue(11),
      fontFamily: 'OpenSans-SemiBold',
      marginLeft: 8,
    },
  });