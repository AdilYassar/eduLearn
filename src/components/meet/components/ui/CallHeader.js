import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient'; // Ensure this package is installed
import { useCallStore } from '../serviceComponent/callStore';
import { Colors } from '@utils/Constants';
import { addHyphens } from '@components/meet/utils/Helpers';
import  Icon from 'react-native-vector-icons/Ionicons';

const CallHeader = ({ switchCamera }) => {
  const { sessionId } = useCallStore();

  return (
    <LinearGradient
      colors={[Colors.teal_100, Colors.teal_300, Colors.teal_600, 'transparent']} // Updated to a more visible gradient
      style={styles.container}


    >
      <SafeAreaView>
        <View style={styles.header}>
          <Text style={styles.meetCode}>Meeting Code: {addHyphens(sessionId)}</Text>
          <View style={styles.icons}>
            <Icon
              name="camera-reverse"
              type="material-community"
              color="#000"
              size={30}
              onPress={switchCamera}
              containerStyle={styles.iconSpacing}
            />
            <Icon name='volume-high'  style={styles.iconSpacing}
            size={30}
             />

          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 10,
  },
  meetCode: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSpacing: {
    marginLeft: 20,
  },
});

export default CallHeader;
