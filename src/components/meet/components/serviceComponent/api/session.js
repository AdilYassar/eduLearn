import { Alert } from 'react-native';
import { SERVER_URL } from '../callService';
import axios from 'axios';

export const createSession = async () => {
    try {
        const apiResponse = await axios.post(`${SERVER_URL}/api/create-session`);
        return apiResponse?.data?.sessionId;
    } catch (error) {
        console.log('Session Create Error', error);
        if (error.response?.status === 404) {
            Alert.alert('Server Error', 'Session creation endpoint not found. Please check server configuration.');
        } else if (error.response?.status >= 500) {
            Alert.alert('Server Error', 'Server is currently unavailable. Please try again later.');
        } else {
            Alert.alert('Session Create Error', 'Unable to create session. Please check your connection.');
        }
    }
};

export const checkSession = async (id) => {
    try {
        const apiResponse = await axios.get(`${SERVER_URL}/api/is-alive?sessionId=${id}`);
        return apiResponse?.data?.isAlive;
    } catch (error) {
        console.log('Session Get Error', error);
        if (error.response?.status === 404) {
            console.log('Session endpoint not found - server may be down or endpoint changed');
            // Don't show alert for 404, just return false
            return false;
        } else if (error.response?.status >= 500) {
            Alert.alert('Server Error', 'Server is currently unavailable. Please try again later.');
        } else {
            Alert.alert('Connection Error', 'Unable to check session. Please check your connection.');
        }
        return false;
    }
};