import {useState, useCallback} from 'react';
import {BASE_URL} from '../config';
import { makeAuthenticatedRequest } from '../authUtils';

interface UserProfile {
  _id: string;
  email: string;
  name?: string;
  age?: number;
  phone?: string;
  photo?: string;
  totalLearningDays?: number;
  createdAt: string;
  updatedAt: string;
}

interface EnrollmentStats {
  totalEnrolledCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalQuizzesTaken: number;
  averageScore: number;
}

export const useUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get User Profile (Student)
  const getUserProfile = useCallback(async (_token: string): Promise<any | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const url = `${BASE_URL}/api/user`;
      console.log('🌐 Making authenticated request to:', url);
      
      const response = await makeAuthenticatedRequest(url, {
        method: 'GET',
      });

      if (!response) {
        throw new Error('Failed to make authenticated request');
      }

      console.log('📊 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const responseText = await response.text();
      console.log('📄 Raw response text:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('✅ Parsed JSON result:', result);
      } catch (parseError: any) {
        console.error('❌ JSON parse error:', parseError);
        throw new Error(`Invalid JSON response: ${parseError.message}`);
      }

      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Generic User Profile
  const getGenericUserProfile = useCallback(async (_token: string): Promise<any | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const url = `${BASE_URL}/api/user/profile`;
      console.log('🌐 Making authenticated request to:', url);
      
      const response = await makeAuthenticatedRequest(url, {
        method: 'GET',
      });

      if (!response) {
        throw new Error('Failed to make authenticated request');
      }

      console.log('📊 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const responseText = await response.text();
      console.log('� Raw response text:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('✅ Parsed JSON result:', result);
      } catch (parseError: any) {
        console.error('❌ JSON parse error:', parseError);
        throw new Error(`Invalid JSON response: ${parseError.message}`);
      }

      return result;
    } catch (err: any) {
      console.error('❌ getGenericUserProfile error:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update User Profile
  const updateUserProfile = useCallback(async (data: {
    name?: string;
    photo?: string;
    phone?: string;
  }, _token: string): Promise<UserProfile | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await makeAuthenticatedRequest(`${BASE_URL}/api/user`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response) {
        throw new Error('Failed to make authenticated request');
      }

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update user profile');
      }

      return result.user;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Enrollment Statistics
  const getEnrollmentStats = useCallback(async (_token: string): Promise<EnrollmentStats | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await makeAuthenticatedRequest(`${BASE_URL}/api/user/enrollment-stats`, {
        method: 'GET',
      });

      if (!response) {
        throw new Error('Failed to make authenticated request');
      }

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch enrollment statistics');
      }

      return result.stats;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Admin: Get All Users
  const getAllUsers = useCallback(async (_token: string): Promise<UserProfile[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await makeAuthenticatedRequest(`${BASE_URL}/api/admin/users`, {
        method: 'GET',
      });

      if (!response) {
        throw new Error('Failed to make authenticated request');
      }

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch users');
      }

      return result.users;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getUserProfile,
    getGenericUserProfile,
    updateUserProfile,
    getEnrollmentStats,
    getAllUsers,
  };
};
