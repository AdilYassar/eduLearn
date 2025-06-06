import Navigation from './src/navigation/navigation';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {ApolloProvider} from '@apollo/client';
import { client } from './src/components/Podcasts/graphQL/client';
const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
          <ApolloProvider client={client}>
      <Navigation />
      </ApolloProvider>
    </GestureHandlerRootView>
  );
};

export default App;