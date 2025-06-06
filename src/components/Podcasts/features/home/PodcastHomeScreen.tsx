import {View, StyleSheet } from 'react-native'
import React from 'react'
import CustomSafeAreaView from '@components/ui/CustomSafeAreaView'
import LottieView from 'lottie-react-native'

const PodcastHomeScreen = () => {
  return (
    <CustomSafeAreaView>
      <View style={styles.content}>

      </View>
      <LottieView
        source={require('../../../../assets/animations/music.json')}
        autoPlay
        loop
        style={styles.lottie}
      />
    </CustomSafeAreaView>
  )
}


const styles = StyleSheet.create({
  lottie:{
    position: 'absolute',
    zIndex: 1,
    top: 0,
    right: 0,
    width:300,

    height: 300,
    opacity: 0.8,
  },
  content:{
    flex:1,
    zIndex:2
  },
  scrollContent:{
    marginTop: 20,
    padding:5
  },
  scrollContainer:{
    paddingBottom:250
  }
})

export default PodcastHomeScreen