import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SOCIAL_CONFIG } from './config';

class SocialApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: SOCIAL_CONFIG.API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        if (!this.token) {
          this.token = await AsyncStorage.getItem('accessToken');
        }
        
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await this.clearToken();
          // You might want to trigger a re-authentication flow here
        }
        return Promise.reject(error);
      }
    );
  }

  async setToken(token: string) {
    this.token = token;
    await AsyncStorage.setItem('accessToken', token);
  }

  async clearToken() {
    this.token = null;
    await AsyncStorage.removeItem('accessToken');
  }

  getClient(): AxiosInstance {
    return this.client;
  }

  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  // Special method for file uploads
  async uploadFile<T>(url: string, formData: FormData): Promise<T> {
    // Axios usually struggles with FormData in RN. Using fetch is cleaner.
    const fullUrl = `${this.client.defaults.baseURL}${url}`;
    
    // Get token manually since we bypass axios interceptor
    if (!this.token) {
        this.token = await AsyncStorage.getItem('accessToken');
    }

    const headers: any = {
        'Accept': 'application/json',
        // DO NOT SET CONTENT-TYPE for fetch with FormData; browser/engine sets boundary
    };

    if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(fullUrl, {
        method: 'POST',
        headers: headers,
        body: formData,
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw {
            response: {
                status: response.status,
                data: responseData
            }
        };
    }

    return responseData;
  }
}

export const socialApiClient = new SocialApiClient();
