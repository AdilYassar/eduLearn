import { MMKV } from 'react-native-mmkv';

export const tokenStorage = new MMKV({
    id: 'token-storage',  // Ensure this ID is unique to avoid conflicts
    encryptionKey: 'some_secret_key', // Optional: for added security
});

export const mmkvStorage = {
    setItem: (key: string, value: string) => {
        tokenStorage.set(key, value);
    },
    getItem: (key: string): string | null => {
        const value = tokenStorage.getString(key);
        return value ?? null;
    },
    removeItem: (key: string) => {
        tokenStorage.delete(key);
    },
};
