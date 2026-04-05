import { StyleSheet, Dimensions } from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';

const { width: screenWidth } = Dimensions.get('window');

export const inquiryStyles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollViewContent: {
      flexGrow: 1,
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: 'transparent',
      padding: 20,
      paddingBottom: 80, // Extra padding for fixed buttons
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
      fontFamily: 'OpenSans-Medium',
    },
    label: {
      fontSize: RFValue(14),
      fontWeight: '600',
      marginBottom: 10,
      fontFamily: 'OpenSans-Medium',
    },
    input: {
      height: 50,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 5,
      marginBottom: 15,
      paddingHorizontal: 10,
      fontFamily: 'OpenSans-Regular',
      fontSize: RFValue(12),
      color: '#000',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    button: {
      flex: 1,
      backgroundColor: '#4A90E2',
      paddingVertical: 12,
      borderRadius: 25,
      marginHorizontal: 8,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: '#E0E0E0',
    },
    buttonText: {
      color: 'white',
      fontWeight: '600',
      fontFamily: 'OpenSans-Medium',
      fontSize: RFValue(14),
    },
    cancelButtonText: {
      color: '#666',
      fontWeight: '600',
      fontFamily: 'OpenSans-Medium',
      fontSize: RFValue(14),
    },
    fixedButtonContainer: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: 'transparent',
      paddingTop: 10,
    },
    // Avatar selection styles
    sectionTitle: {
      fontSize: RFValue(14),
      fontWeight: 'bold',
      marginBottom: 10,
      marginTop: 10,
      fontFamily: 'OpenSans-Medium',
    },
    avatarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    avatarOption: {
      width: (screenWidth - 80) / 4, // 4 avatars per row with padding
      height: (screenWidth - 80) / 4,
      marginBottom: 10,
      borderRadius: (screenWidth - 80) / 8,
      borderWidth: 3,
      borderColor: 'transparent',
      overflow: 'hidden',
      position: 'relative',
    },
    selectedAvatar: {
      borderColor: '#007BFF',
      borderWidth: 3,
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: (screenWidth - 80) / 8,
    },
    checkmarkContainer: {
      position: 'absolute',
      top: 5,
      right: 5,
      backgroundColor: '#007BFF',
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkmark: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
    },
  });
  