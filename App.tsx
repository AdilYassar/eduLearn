import Navigation from './src/navigation/navigation';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/redux/store';
import { ThemeProvider } from './src/context/ThemeContext';
import { VoiceMessageProvider } from './src/context/VoiceMessageContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useDeviceTokenRegistration } from './src/hooks/useDeviceTokenRegistration';

const App = () => {
  // Initialize Firebase device token registration
  useDeviceTokenRegistration();
  
  const containerStyle = { flex: 1 };
  
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <ThemeProvider>
            <VoiceMessageProvider>
              <GestureHandlerRootView style={containerStyle}>
                <Navigation />
              </GestureHandlerRootView>
            </VoiceMessageProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;