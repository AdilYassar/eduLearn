import {useState, useCallback} from 'react';
import {BASE_URL} from '../config';

interface Student {
  uuid: string;
  name: string;
  email: string;
  phone: string;
  isActivated: boolean;
}

interface RegisterResponse {
  message: string;
  user: Student;
}

interface LoginResponse {
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
      
      if (response.status === 201 || response.status === 200) {
        return result;
      } else {
        const errorMessage = result.message || `Registration failed with status ${response.status}`;
        throw new Error(errorMessage);
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
        // According to new flow, tokens are returned only when activated
        return result;
      } else {
        const errorMessage = result.message || 'Login failed';
        throw new Error(errorMessage);
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

  // Request Password Reset
  const forgotPasswordRequest = useCallback(async (data: {
    email: string;
    role?: string;
  }): Promise<any | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/auth/forgot-password/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          role: data.role || 'Student',
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to request password reset');
      }

      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Verify OTP for password reset
  const verifyResetOTP = useCallback(async (data: {
    email: string;
    otpCode: string;
    role?: string;
  }): Promise<any | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/auth/forgot-password/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          otpCode: data.otpCode,
          role: data.role || 'Student',
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to verify OTP');
      }

      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset Password
  const resetPassword = useCallback(async (data: {
    email: string;
    resetToken: string;
    newPassword: string;
    newPasswordConfirm: string;
    verifyMethod: 'token' | 'otp';
    role?: string;
  }): Promise<any | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/auth/forgot-password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          resetToken: data.resetToken,
          newPassword: data.newPassword,
          newPasswordConfirm: data.newPasswordConfirm,
          verifyMethod: data.verifyMethod,
          role: data.role || 'Student',
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to reset password');
      }

      return result;
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
    registerStudent,
    loginStudent,
    registerAdmin,
    loginAdmin,
    refreshToken: refreshAccessToken,
    logout,
    changePassword,
    forgotPasswordRequest,
    verifyResetOTP,
    resetPassword,
  };
};
