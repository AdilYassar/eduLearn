/* eslint-disable @typescript-eslint/no-unused-vars */

import Navigation from './src/navigation/Navigation'
import React from 'react'
import { View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const App = () => {
  return (
    <GestureHandlerRootView  style={{ flex: 1 }}>
    <Navigation />
  </GestureHandlerRootView>
  )
}

export default App