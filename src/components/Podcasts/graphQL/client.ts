import {ApolloClient, InMemoryCache, createHttpLink} from '@apollo/client';
import {setContext} from '@apollo/client/link/context';
import {onError} from '@apollo/client/link/error';
import {Platform} from 'react-native';
import {asyncStorage} from '../state/storage';

// First, test if your ngrok URL is active
const GRAPHQL_ENDPOINT = Platform.OS === 'ios'
  ? 'https://8f71-2400-adc5-124-2500-f5ef-5b49-a7f-1098.ngrok-free.app/api/graphql'
  : 'https://8f71-2400-adc5-124-2500-f5ef-5b49-a7f-1098.ngrok-free.app/api/graphql';

const httpLink = createHttpLink({
  uri: GRAPHQL_ENDPOINT,
  // Add these headers for ngrok
  headers: {
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json',
  },
});

// Fix the async storage issue
const authLink = setContext(async (_, {headers}) => {
  try {
    // Make this async
    const token = await asyncStorage.getItem('token');
    
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
        // Add ngrok header here too
        'ngrok-skip-browser-warning': 'true',
      },
    };
  } catch (error) {
    console.error('Error getting token from storage:', error);
    return {
      headers: {
        ...headers,
        'ngrok-skip-browser-warning': 'true',
      },
    };
  }
});

// Add error handling
const errorLink = onError(({graphQLErrors, networkError, operation, forward}) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({message, locations, path}) =>
      console.log(
        `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    );
  }

  if (networkError) {
    console.log('Network error:', networkError);
    console.log('Network error message:', networkError.message);
    console.log('Network error status:', networkError.statusCode);
    
    // Log the actual response if available
    if (networkError.response) {
      console.log('Response status:', networkError.response.status);
      console.log('Response headers:', networkError.response.headers);
    }
    
    // Handle specific network errors
    if (networkError.message.includes('Failed to fetch')) {
      console.log('Check if your ngrok URL is active and accessible');
    }
  }
});

export const client = new ApolloClient({
  link: errorLink.concat(authLink).concat(httpLink),
  cache: new InMemoryCache(),
  // Add default options
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

// Test function to check if the endpoint is accessible
export const testGraphQLEndpoint = async () => {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        query: '{ __schema { types { name } } }',
      }),
    });
    
    console.log('Test response status:', response.status);
    const text = await response.text();
    console.log('Test response body:', text);
    
    if (response.ok) {
      console.log('✅ GraphQL endpoint is accessible');
      return true;
    } else {
      console.log('❌ GraphQL endpoint returned error status');
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to reach GraphQL endpoint:', error.message);
    return false;
  }
};