import {useState, useCallback} from 'react';
import {BASE_URL} from '../config';

interface Book {
  _id: string;
  title: string;
  author?: string;
  description?: string;
  course?: string;
  category?: string;
  coverImage?: string;
  pdf: string; // Buffer/Base64 or URL
  pages?: number;
  language?: string;
  publishedDate?: string;
  isbn?: string;
  createdAt: string;
  updatedAt: string;
}

interface Chapter {
  _id: string;
  title: string;
  content: string;
  course: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  timeSpent: number;
  startedAt: string | null;
  completedAt: string | null;
  lastAccessedAt: string;
}

interface Theory {
  _id: string;
  courseTitle: string;
  description?: string;
  chapters: Chapter[];
  course: string;
}

interface Category {
  _id: string;
  name: string;
  description?: string;
  isQuizCategory: boolean;
  parentCategory?: string;
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

interface Branch {
  _id: string;
  name: string;
  description?: string;
  courses: string[];
  location?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const useLearningMaterials = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get All Books
  const getAllBooks = useCallback(async (accessToken?: string): Promise<Book[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const headers: any = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      };
      
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(`${BASE_URL}/api/books`, {
        method: 'GET',
        headers,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch books');
      }

      return result.books;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Book by ID
  const getBookById = useCallback(async (bookId: string, accessToken?: string): Promise<Book | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const headers: any = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      };
      
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(`${BASE_URL}/api/books/${bookId}`, {
        method: 'GET',
        headers,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch book');
      }

      return result.book;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Theory Content by Course ID
  const getTheoryByCourse = useCallback(async (courseId: string, accessToken?: string): Promise<Theory | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const url = `${BASE_URL}/theory/${courseId}`;
      console.log('useLearningMaterials: Making theory API request to:', url);
      console.log('useLearningMaterials: Using access token:', !!accessToken);
      
      const headers: any = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      };
      
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log('useLearningMaterials: Theory API response status:', response.status);
      console.log('useLearningMaterials: Theory API response content-type:', response.headers.get('content-type'));
      
      // Get response as text first for debugging
      const responseText = await response.text();
      console.log('useLearningMaterials: Raw theory response (first 200 chars):', responseText.substring(0, 200));
      
      // Parse JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError: any) {
        console.error('useLearningMaterials: Theory JSON parse error:', parseError);
        console.log('useLearningMaterials: Full theory response text:', responseText);
        throw new Error(`Invalid JSON response: ${parseError.message}`);
      }
      
      console.log('useLearningMaterials: Theory API parsed result:', result);
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch theory content');
      }

      console.log('useLearningMaterials: Returning theory data:', result.theory);
      return result.theory;
    } catch (err: any) {
      console.error('useLearningMaterials: Error in getTheoryByCourse:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update Theory Chapter Status
  const updateTheoryChapterStatus = useCallback(async (
    courseId: string,
    chapterId: string,
    status: 'not_started' | 'in_progress' | 'completed',
    accessToken?: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const url = `${BASE_URL}/theory/${courseId}/chapter/${chapterId}/status`;
      console.log('useLearningMaterials: Updating chapter status to:', status);
      
      const headers: any = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      };
      
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update chapter status');
      }

      console.log('useLearningMaterials: Chapter status updated successfully');
      return true;
    } catch (err: any) {
      console.error('useLearningMaterials: Error updating chapter status:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Theory by ID
  const getTheoryById = useCallback(async (theoryId: string): Promise<Theory | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/theory/content/${theoryId}`, {
        method: 'GET',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch theory content');
      }

      return result.theory;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Quiz Categories
  const getQuizCategories = useCallback(async (): Promise<Category[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/categories`, {
        method: 'GET',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch categories');
      }

      return result.categories;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get All Categories
  const getAllCategories = useCallback(async (): Promise<Category[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/categories/all`, {
        method: 'GET',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch all categories');
      }

      return result.categories;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Branches
  const getBranches = useCallback(async (): Promise<Branch[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/branches`, {
        method: 'GET',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch branches');
      }

      return result.branches;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Branch by ID
  const getBranchById = useCallback(async (branchId: string): Promise<Branch | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/branches/${branchId}`, {
        method: 'GET',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch branch');
      }

      return result.branch;
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
    getAllBooks,
    getBookById,
    getTheoryByCourse,
    updateTheoryChapterStatus,
    getTheoryById,
    getQuizCategories,
    getAllCategories,
    getBranches,
    getBranchById,
  };
};
