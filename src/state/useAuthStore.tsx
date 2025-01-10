import { persist, createJSONStorage } from 'zustand/middleware';
import { create } from 'zustand';
import { mmkvStorage, tokenStorage } from './storage';
import { resetAndNavigate } from '../utils/Navigation';

interface AuthStore {
    user: Record<string, any> | null;
    setUser: (user: any) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            logout: () => {
                set({ user: null });
                tokenStorage.clearAll();
                resetAndNavigate('LoginScreen'); // Ensure this function is imported
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => mmkvStorage),
        }
    )
);