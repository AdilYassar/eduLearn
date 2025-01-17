import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

const reduxStorage = {
    setItem: (key: string, value: string): Promise<boolean> => {
        storage.set(key, value);
        return Promise.resolve(true);
    },
    getItem: (key: string): Promise<string | null> => {
        const value = storage.getString(key);
        return Promise.resolve(value !== undefined ? value : null);
    },
    removeItem: (key: string): Promise<void> => {
        storage.delete(key);
        return Promise.resolve();
    },
};

export default reduxStorage;
