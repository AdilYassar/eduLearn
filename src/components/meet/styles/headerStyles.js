import { StyleSheet } from 'react-native';
import { screenHeight, screenWidth} from '../utils/Constants';
import {RFValue} from 'react-native-responsive-fontsize';
import {Colors} from '../../../utils/Constants'

export const headerStyles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowOffset: {width: 1, height: 1},
      shadowOpacity: 0.1,
      shadowRadius: 2,
      borderRadius: 10,
      elevation:4,
      padding: 10,
      shadowColor: '#000',
      backgroundColor: Colors.teal_200,
    },
    placeholderText: {
      fontFamily: 'OpenSans-Regular',
      opacity: 0.6,
      color: Colors.text,
    },
    textContainer: {
      width: '80%',
    },
  });
  