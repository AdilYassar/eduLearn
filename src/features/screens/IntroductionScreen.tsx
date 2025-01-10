import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { navigate } from '@utils/Navigation'

const IntroductionScreen = () => {
  
  return (
    <View>
      <TouchableOpacity onPress={()=>navigate('SplashScreen')}>
      <Text>IntroductionScreen</Text>
      </TouchableOpacity>
      
    </View>
  )
}

export default IntroductionScreen