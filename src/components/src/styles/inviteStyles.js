import { StyleSheet } from 'react-native';
import {screenHeight} from '../utils/Constants';
import {RFValue} from 'react-native-responsive-fontsize';
import { Colors } from '@utils/Constants';



export const inviteStyles = StyleSheet.create({
    container: {
      marginTop: screenHeight * 0.1,
      flex: 0.7,
      justifyContent: 'center',
      backgroundColor: '#1C1C1E',
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
      color: '#8E8E93',
      fontSize: RFValue(10),
      fontFamily: 'OpenSans-Regular',
      textAlign: 'left',
      marginBottom: 24,
    },
    linkContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#2C2C2E',
      width: '90%',
      padding: 14,
      marginBottom: 20,
      borderRadius: 40,
    },
    linkText: {
      color: '#FFFFFF',
      fontSize: 14,
      flex: 1,
      fontWeight: '500',
    },
    iconButton: {
      marginLeft: 10,
    },
    shareButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#0A84FF',
      borderRadius: 40,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderWidth: 0,
    },
    shareText: {
      color: '#FFFFFF',
      fontSize: RFValue(11),
      fontWeight: '600',
      marginLeft: 8,
    },
  });