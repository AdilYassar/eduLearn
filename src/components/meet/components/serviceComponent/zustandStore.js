/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from './storage';

// Define the user store using Zustand
export const useUserStore = create(
    persist(
        (set, get) => ({
            user: null, // Default user object
            sessions: [],

            // Function to set the user
            setUser: (data) => set({ user: data }),

            // Function to add a session if it doesn't already exist
            addSession: (sessionId) => {
                const { sessions } = get();
                if (!sessions.includes(sessionId)) {
                    set({ sessions: [sessionId, ...sessions] });
                }
            },

            // Function to remove a session if it exists
            removeSession: (sessionId) => {
                const { sessions } = get();
                const updatedSessions = sessions.filter((s) => s !== sessionId);
                set({ sessions: updatedSessions });
            },
            clear: () => set({ user: null, sessions: [] }),
        }),
        {
            name: 'user-storage', // Storage key name
            storage: createJSONStorage(() => asyncStorage), // Use AsyncStorage for storage
        }
    )
);