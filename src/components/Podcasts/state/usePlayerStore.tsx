import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface PlayerStore {
    user: any | null; // Ensures `user` can be null or any value
    setUser: (user: any) => void; // Function to set the user
}

export const usePlayerStore = create<PlayerStore>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }), // Updates the user state
        }),
        {
            name: 'player-storage', // Key for AsyncStorage
            storage: createJSONStorage(() => AsyncStorage), // Use AsyncStorage for persistence
        }
    )
);
