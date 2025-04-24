import {ApolloClient, InMemoryCache, createHttpLink} from '@apollo/client';
import {setContext} from '@apollo/client/link/context';
import {mmkvStorage} from '../state/storage';
import {Platform} from 'react-native';

const httpLink = createHttpLink({
  uri:
    Platform.OS === 'ios'
      ? 'http://localhost:3000/api/graphql'
      : 'http://10.0.2.2:3000/api/graphql',
});

const authLink = setContext((_, {headers}) => {
  const token = mmkvStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
