/* eslint-disable no-catch-shadow */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-shadow */
import axios from 'axios';
import { BASE_URL } from './config';
import { tokenStorage } from '../state/storage';
import { refresh_tokens } from './authService';
import { Alert } from 'react-native';
import { resetAndNavigate } from '../utils/Navigation';

export const appAxios = axios.create({
    baseURL: BASE_URL,
});

appAxios.interceptors.request.use(async (config) => {
    const accessToken = tokenStorage.getString('accessToken');
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

appAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            try {
                const newAccessToken = await refresh_tokens();
                if (newAccessToken) {
                    error.config.headers.Authorization = `Bearer ${newAccessToken}`;
                    return axios(error.config);
                }
            } catch (error) {
                console.log('Error refreshing token:', error);
                tokenStorage.clearAll();
                resetAndNavigate('LoginScreen'); // Ensure this function is imported
            }
        }

        if (error.response && error.response.status !== 401) {
            const errorMessage = error.response.data?.message || 'Something went wrong';
            Alert.alert('Error', errorMessage);
        }

        return Promise.reject(error);
    }
);