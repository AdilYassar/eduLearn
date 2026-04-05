import { StyleSheet } from 'react-native';
import {Colors, screenHeight, screenWidth} from '../utils/Constants';
import {RFValue} from 'react-native-responsive-fontsize';


export const joinStyles = StyleSheet.create({
    container: {
      flex: 1,
    },
    contentWrapper: {
      flex: 1,
      paddingHorizontal: 15,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 5,
      justifyContent: 'space-between',
      paddingHorizontal: 15,
    },
    headerText: {
      fontSize: RFValue(15),
      opacity: 0.8,
      fontFamily: 'Roboto-Medium',
    },
    gradientButton: {
      borderRadius: 15,
      width: '100%',
      height: 80,
      alignItems: 'center',
      marginVertical: 30,
      justifyContent: 'center',
    },
    button: {
      width: '100%',
      alignItems: 'center',
      gap: 15,
      justifyContent: 'center',
      height: '100%',
      flexDirection: 'row',
    },
    buttonText: {
      fontSize: RFValue(15),
      fontFamily: 'Roboto-Medium',
    },
    orText: {
      fontSize: RFValue(12),
      textAlign: 'center',
      marginVertical: 5,
    },
    inputContainer: {
      marginTop: 20,
    },
    labelText: {
      fontSize: RFValue(12),
      marginBottom: 5,
      fontFamily: 'OpenSans-Regular',
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    inputBox: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 8,
      marginTop: 10,
      padding: 12,
      fontSize: RFValue(12),
      fontFamily: 'OpenSans-Regular',
      backgroundColor: 'transparent',
    },
    joinArrowButton: {
      marginTop: 10,
      width: 40,
      height: 40,
      borderRadius: 6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    noteText: {
      fontSize: RFValue(10),
      marginTop: 10,
      lineHeight: 15,
      fontFamily: 'OpenSans-Regular',
    },
    linkText: {
      color: '#007AFF',
      textDecorationLine: 'underline',
    },
    Info: {
      fontSize: RFValue(12),
      fontFamily: 'OpenSans-Regular',
      flex: 1,
      textAlign: 'center',
    },
    complianceHeader: {
      fontSize: RFValue(14),
      fontWeight: '700',
      marginBottom: RFValue(12),
      marginTop: RFValue(20),
      fontFamily: 'Roboto-Bold',
      textAlign: 'left',
      letterSpacing: 0.5,
    },
    complianceText: {
      fontSize: RFValue(11),
      lineHeight: RFValue(18),
      marginBottom: RFValue(6),
      fontFamily: 'OpenSans-Regular',
      fontWeight: '400',
    },
    supportLinks: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: RFValue(12),
      marginBottom: RFValue(12),
      justifyContent: 'flex-start',
    },
    disclaimerText: {
      fontSize: RFValue(10),
      lineHeight: RFValue(16),
      textAlign: 'justify',
      fontFamily: 'OpenSans-Regular',
      fontWeight: '400',
      marginTop: RFValue(12),
    },
  });