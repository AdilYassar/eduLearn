import axios from 'axios';
import { BASE_URL } from './config';
import { tokenStorage } from '@state/storage';
import { useAuthStore } from '../state/useAuthStore';
import { resetAndNavigate } from '@utils/Navigation';
import { appAxios } from './apiInterceptors';

export const studentLogin = async (email: string, phone:number) => {
    try {
        const response = await axios.post(`${BASE_URL}/student/login`, { email, phone });
        const { accessToken, refreshToken, student } = response.data;
        tokenStorage.set('accessToken', accessToken);
        tokenStorage.set('refreshToken', refreshToken);
        const { setUser } = useAuthStore.getState();
        setUser(student);
        resetAndNavigate('CourseScreen');
    } catch (error) {
        console.error('Student login failed:', error);
        throw error;
    }
};

export const adminLogin = async (email: string, phone:number) => {
    try {
        const response = await axios.post(`${BASE_URL}/admin/login`, { email, phone });
        const { accessToken, refreshToken, admin } = response.data;
        tokenStorage.set('accessToken', accessToken);
        tokenStorage.set('refreshToken', refreshToken);
        const { setUser } = useAuthStore.getState();
        setUser(admin);
        resetAndNavigate('MarksSummaryScreen');
    } catch (error) {
        console.error('Admin login failed:', error);
        throw error;
    }
};

export const refetchUser = async (setUser: (user: any) => void) => {
    try {
        const response = await appAxios.get(`/user`);
        setUser(response.data.user);
    } catch (error) {
        console.log('Error refetching user:', error);
    }
};

export const refresh_tokens = async () => {
    try {
        const refreshToken = tokenStorage.getString('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token found');
        }

        const response = await axios.post(`${BASE_URL}/refresh-token`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        tokenStorage.set('accessToken', accessToken);
        tokenStorage.set('refreshToken', newRefreshToken);
        return accessToken;
    } catch (error) {
        console.log('Error refreshing tokens:', error);
        tokenStorage.clearAll();
        resetAndNavigate('LoginScreen');
        throw error;
    }
};