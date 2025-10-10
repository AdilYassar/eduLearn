import { MMKV } from "react-native-mmkv";
export const storage = new MMKV({
    id:'user_storage',
    encryptionKey:'my_secret_key_1234' // Optional: You can provide an encryption key for added security
}); // You can provide an ID if you want to have multiple instances


export const mmkvStorage = {
    setItem: (key, value) => {
        storage.set(key, value);
    },
    getItem: (key) => {
        const value = storage.getString(key);
        return value ?? null;
    },
    removeItem: (key) => {
        storage.delete(key);
    },
};