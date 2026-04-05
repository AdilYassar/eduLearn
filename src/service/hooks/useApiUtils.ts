import {useState, useCallback} from 'react';
import {HTTP_STATUS, ERROR_MESSAGES} from './apiConfig';

interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

interface ApiResponse<T = any> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
}

export const useApiRequest = <T = any>() => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const makeRequest = useCallback(async (
    url: string,
    options: RequestInit = {}
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.message || getErrorMessage(response.status);
        const apiError: ApiError = {
          message: errorMessage,
          status: response.status,
          code: result.code,
        };
        setError(apiError);
        return null;
      }

      return result;
    } catch (err: any) {
      const networkError: ApiError = {
        message: err.message || ERROR_MESSAGES.NETWORK_ERROR,
        status: 0,
      };
      setError(networkError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    makeRequest,
    clearError,
  };
};

// Helper function to get appropriate error message based on status code
const getErrorMessage = (status: number): string => {
  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      return ERROR_MESSAGES.VALIDATION_ERROR;
    case HTTP_STATUS.UNAUTHORIZED:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case HTTP_STATUS.FORBIDDEN:
      return ERROR_MESSAGES.FORBIDDEN;
    case HTTP_STATUS.NOT_FOUND:
      return ERROR_MESSAGES.NOT_FOUND;
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      return ERROR_MESSAGES.SERVER_ERROR;
    default:
      return ERROR_MESSAGES.UNKNOWN_ERROR;
  }
};

// Common API request patterns
export const useApiMutations = () => {
  const {makeRequest, loading, error, clearError} = useApiRequest();

  const post = useCallback(async <T>(
    url: string,
    data: any,
    token?: string
  ): Promise<T | null> => {
    const headers: any = {'Content-Type': 'application/json'};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return makeRequest(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
  }, [makeRequest]);

  const put = useCallback(async <T>(
    url: string,
    data: any,
    token?: string
  ): Promise<T | null> => {
    const headers: any = {'Content-Type': 'application/json'};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return makeRequest(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
  }, [makeRequest]);

  const patch = useCallback(async <T>(
    url: string,
    data: any,
    token?: string
  ): Promise<T | null> => {
    const headers: any = {'Content-Type': 'application/json'};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return makeRequest(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
  }, [makeRequest]);

  const del = useCallback(async (
    url: string,
    token?: string
  ): Promise<boolean> => {
    const headers: any = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const result = await makeRequest(url, {
      method: 'DELETE',
      headers,
    });

    return result !== null;
  }, [makeRequest]);

  const get = useCallback(async <T>(
    url: string,
    token?: string
  ): Promise<T | null> => {
    const headers: any = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return makeRequest(url, {
      method: 'GET',
      headers,
    });
  }, [makeRequest]);

  return {
    loading,
    error,
    clearError,
    post,
    put,
    patch,
    del,
    get,
  };
};

// Hook for handling authentication state
export const useAuthState = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = useCallback((userData: any, accessToken: string) => {
    setUser(userData);
    setToken(accessToken);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  }, []);

  const updateUser = useCallback((userData: any) => {
    setUser(userData);
  }, []);

  return {
    isAuthenticated,
    user,
    token,
    login,
    logout,
    updateUser,
  };
};

// Hook for pagination
export const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);

  const hasNext = page * limit < total;
  const hasPrev = page > 1;
  const totalPages = Math.ceil(total / limit);

  const nextPage = useCallback(() => {
    if (hasNext) {
      setPage(prev => prev + 1);
    }
  }, [hasNext]);

  const prevPage = useCallback(() => {
    if (hasPrev) {
      setPage(prev => prev - 1);
    }
  }, [hasPrev]);

  const goToPage = useCallback((pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber);
    }
  }, [totalPages]);

  const resetPagination = useCallback(() => {
    setPage(initialPage);
  }, [initialPage]);

  return {
    page,
    limit,
    total,
    hasNext,
    hasPrev,
    totalPages,
    setPage,
    setLimit,
    setTotal,
    nextPage,
    prevPage,
    goToPage,
    resetPagination,
  };
};

export type {ApiError, ApiResponse};
