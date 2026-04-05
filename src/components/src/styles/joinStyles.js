import { StyleSheet } from 'react-native';
import {Colors, screenHeight, screenWidth} from '../utils/Constants';
import {RFValue} from 'react-native-responsive-fontsize';


export const joinStyles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 15,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 5,
      justifyContent: 'space-between',
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
      color: '#888',
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
    inputBox: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      marginTop: 10,
      padding: 12,
      fontSize: RFValue(12),
      fontFamily: 'OpenSans-Regular',
      color: '#333',
      backgroundColor: 'transparent',
    },
    noteText: {
      fontSize: RFValue(10),
      color: '#666',
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
      color: '#1F2937',
      marginBottom: RFValue(12),
      marginTop: RFValue(20),
      fontFamily: 'Roboto-Bold',
      textAlign: 'left',
      letterSpacing: 0.5,
    },
    complianceText: {
      fontSize: RFValue(11),
      color: '#374151',
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
      color: '#6B7280',
      lineHeight: RFValue(16),
      textAlign: 'justify',
      fontFamily: 'OpenSans-Regular',
      fontWeight: '400',
      marginTop: RFValue(12),
    },
  });