import { Alert } from 'react-native';
import { SERVER_URL } from '../callService';
import axios from 'axios';

export const createSession = async () => {
    try {
        const apiResponse = await axios.post(`${SERVER_URL}/create-session`);
        return apiResponse?.data?.sessionId;
    } catch (error) {
        console.log('Session Create Error', error);
        Alert.alert('Session Create Error');
    }
};

export const checkSession = async (id) => {
    try {
        const apiResponse = await axios.get(`${SERVER_URL}/is-alive?sessionId=${id}`);
        return apiResponse?.data?.isAlive;
    } catch (error) {
        console.log('Session Get Error', error);
        Alert.alert('Session Create Error');
        return false;
    }
};