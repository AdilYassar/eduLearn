import { View, Text, StyleSheet, SafeAreaView } from 'react-native'
import React from 'react'
import { useLiveMeetStore } from '../../service/meetStore';
import LinearGradient from 'react-native-linear-gradient';
import { addHyphens } from '../../utils/Helpers';
import { SwitchCamera, Volume2 } from 'lucide-react-native';




const MeetHeader = ({ switchCamera }) => {
  const {sessionId} = useLiveMeetStore();

  return (
    <LinearGradient 
    style={styles.container}
    colors= {['rgba(0,0,0,0.8)','transparent']}
    >
    
    <SafeAreaView />
    <View style= {styles.header}>
      <Text style = {styles.meetCode}>
        {addHyphens(sessionId)}
      </Text>
      <View style = {styles.icons}>
        <SwitchCamera color='#fff' onPress={switchCamera} />
        <Volume2 color='#fff' style={styles.iconSpacing} />
      </View>
    </View>

    </LinearGradient>
  )
}
const styles = StyleSheet.create({
  container:{
    width:'100%',
  },
  header:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    paddingHorizontal:16,
    paddingBottom:30,
    paddingTop:10,
  },
  meetCode:{
    color:'#fff',
    fontSize:16,
    fontWeight:'600',
  },
  icons:{
    flexDirection:'row',
    alignItems:'center',

  },
  iconSpacing:{
    marginLeft:10,
  }
})
export default MeetHeader