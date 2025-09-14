import {useState, useCallback} from 'react';
import {BASE_URL} from '../config';

interface Student {
  uuid: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  enrolledCourses: any[];
  enrollmentCount: number;
  quizPerformance: any[];
  totalQuizzesTaken: number;
  averageScore: number;
  age?: number;
}

interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  student: Student;
}

interface RegisterResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  student: Student;
}

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Student Registration
  const registerStudent = useCallback(async (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
    age: number;
  }): Promise<RegisterResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Registering student with data:', data);
      const response = await fetch(`${BASE_URL}/api/student/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('Registration response:', { status: response.status, result });
      
      // Log detailed validation errors if they exist
      if (result.errors) {
        console.log('Validation errors:', JSON.stringify(result.errors, null, 2));
      }
      
      if (response.status === 201 && result.accessToken) {
        return result;
      } else {
        const errorMessage = result.message || `Registration failed with status ${response.status}`;
        if (result.errors) {
          // Try to extract specific validation errors
          const validationErrors = Array.isArray(result.errors) ?
            result.errors.map((err: any) => err.msg || err.message || JSON.stringify(err)).join(', ') :
            JSON.stringify(result.errors);
          throw new Error(`${errorMessage}: ${validationErrors}`);
        } else {
          throw new Error(errorMessage);
        }
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Student Login
  const loginStudent = useCallback(async (data: {
    email: string;
    password: string;
  }): Promise<LoginResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/student/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (response.status === 200 && result.accessToken) {
        return result;
      } else {
        throw new Error(result.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Admin Registration
  const registerAdmin = useCallback(async (data: {
    email: string;
    password: string;
    name: string;
  }): Promise<RegisterResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/admin/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Admin registration failed');
      }

      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Admin Login
  const loginAdmin = useCallback(async (data: {
    email: string;
    password: string;
  }): Promise<LoginResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Admin login failed');
      }

      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh Token
  const refreshAccessToken = useCallback(async (refreshToken: string): Promise<LoginResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({refreshToken}),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Token refresh failed');
      }

      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async (token: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Logout failed');
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Change Password
  const changePassword = useCallback(async (data: {
    currentPassword: string;
    confirmPassword: string;
  }, token: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/user/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Password change failed');
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    registerStudent,
    loginStudent,
    registerAdmin,
    loginAdmin,
    refreshToken: refreshAccessToken,
    logout,
    changePassword,
  };
};
