import { persist, createJSONStorage } from 'zustand/middleware';
import { create } from 'zustand';
import { mmkvStorage } from './storage';
import { performCompleteLogout } from '@service/authUtils';

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
                performCompleteLogout();
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => mmkvStorage),
        }
    )
);