import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore, createTransform } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import rootReducer from './rootReducer';

// Transform to remove selectedDate from persisted state
const chatTransform = createTransform(
  (inboundState: any, key: string) => {
    if (key === 'chat') {
      // Remove selectedDate when saving to storage
      return {
        ...inboundState,
        selectedDate: null, // Don't persist selectedDate
      };
    }
    return inboundState;
  },
  (outboundState: any, key: string) => {
    // State is fine as returned from storage
    return outboundState;
  },
  { whitelist: ['chat'] },
);

const persistConfig = {
  key: 'root',
  storage: AsyncStorage, // Use AsyncStorage for React Native
  whitelist: ['chat', 'theme', 'timeline'], // Specify reducers to persist
  transforms: [chatTransform],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/FLUSH',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PERSIST',
          'persist/PURGE',
          'persist/REGISTER',
        ],
      },
    }),
});

export const persistor = persistStore(store);
