import { View, Text, SafeAreaView, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { joinStyles } from '../styles/joinStyles'
import { checkSession, createSession } from '../components/serviceComponent/api/session'
import { useWS } from '../components/serviceComponent/api/WSProvider'
import { removeHyphens } from '../utils/Helpers'
import { useUserStore } from '../components/serviceComponent/zustandStore'
import { useCallStore } from '../components/serviceComponent/callStore'
import { goBack, navigate } from '@utils/Navigation'
import  Icon  from 'react-native-vector-icons/MaterialIcons'
import { RFValue } from 'react-native-responsive-fontsize'
import LinearGradient from 'react-native-linear-gradient'
import { Colors } from '@utils/Constants'
import { TextInput } from 'react-native-paper'



const JoinCallScreen = () => {



  const {code, setCode} = useState()
  const {emit} = useWS()
  const {addSessionId, removeSessionId} = useCallStore()
  const {user, addSession, removeSession} = useUserStore()


  const createNewChall = async () => {

    const sessionId = await createSession()
    if(sessionId){
      addSession(sessionId)
      addSessionId(sessionId)
      emit('prepare-session', {userId: user?.id, sessionId})
      navigate('PrepareCallScreen')
    }
  }
  
  
  
  
  const joinViaSessionId = async (id) => {

          const isAvailable = await checkSession(code);
          if (isAvailable) {
              emit('prepare-session', { 
                userId: user?.id, 
                sessionId: removeHyphens(code),
              })
            addSession(code);
            addSessionId(code);
            navigate('PrepareCallScreen');
  
          } else {
              removeSession(code);
              removeSessionId(code); 
              setCode('')
              Alert.alert('Session is not available');
          }
      };


  return (
    <View style={joinStyles.container}>
      <SafeAreaView />
      <View style = {joinStyles.headerContainer}>
        <Icon name='arrow-back-ios-new' size={RFValue(20)} onPress={goBack} />
        <Text style={joinStyles.headerText}> Join Call</Text>
        <Icon name='menu' size={RFValue(20)} onPress={()=>console.log('options button pressed')} />


      </View>
      <LinearGradient 
      colors={[Colors.primary_dark, Colors.teal_100]}
      style={joinStyles.gradientButton}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      >
        <TouchableOpacity style={joinStyles.button} onPress={createNewChall}>
          <Icon name='videocam' size={RFValue(30)} />
          <Text  style={joinStyles.buttonText}> Make A call</Text>
        </TouchableOpacity>
      </LinearGradient>

      <Text style={joinStyles.orText}> 
      OR
      </Text>
      <View style={joinStyles.inputContainer}>
        <Text style={joinStyles.labelText}> Enter the code Provided by Caller or organizer to join</Text>
      <TextInput
      style={joinStyles.inputBox}
      value={code}
      onChangeText={setCode}
      returnKeyLabel='Join'
      returnKeyType='join'
      onSubmitEditing={()=>joinViaSessionId()}
      placeholder='Example : abc-456-xy2'

      
      
       />
       <Text style={joinStyles.noteText}>
          Note: You can only join a call if you have a valid code
       </Text>
      
      </View>
    </View>
  )
}

export default JoinCallScreen