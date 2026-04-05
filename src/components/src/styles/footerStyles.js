import { StyleSheet } from 'react-native';

export const footerStyles = StyleSheet.create({
    footerContainer: {
      width: '90%',
      alignSelf: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 25,
      marginBottom: 20,
      paddingVertical: 8,
    },
    iconContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      width: '100%',
      paddingHorizontal: 20,
    },
    iconButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 50,
      padding: 8,
      margin: 2,
    },
    callEndButton: {
      backgroundColor: '#EF4444',
      borderRadius: 50,
      padding: 10,
      margin: 2,
    },
  });