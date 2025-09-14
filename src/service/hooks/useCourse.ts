import {useState, useCallback} from 'react';
import {BASE_URL} from '../config';

interface Course {
  _id: string;
  title: string;
  description?: string;
  estimatedTime?: string;
  materialsNeeded?: string;
  steps?: any[];
  instructor?: string;
  duration?: string;
  level?: string;
  category?: string;
  chapters?: Chapter[];
  createdAt?: string;
  updatedAt?: string;
}

interface Chapter {
  _id: string;
  title: string;
  description?: string;
  content?: string;
  order: number;
}

interface EnrolledCourse {
  _id: string;
  student: string;
  course: Course;
  enrolledAt: string;
  progress?: number;
  completedChapters?: string[];
}

export const useCourse = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get All Courses
  const getAllCourses = useCallback(async (): Promise<Course[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const url = `${BASE_URL}/api/courses`;
      console.log('Making request to:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
        },
      });

      console.log('Response status:', response.status);
      console.log('Response content-type:', response.headers.get('content-type'));
      
      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response text:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      // Get the response as text first to debug
      const responseText = await response.text();
      console.log('Raw response text (first 200 chars):', responseText.substring(0, 200));
      
      // Try to parse JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError: any) {
        console.error('JSON parse error:', parseError);
        console.log('Full response text:', responseText);
        throw new Error(`Invalid JSON response: ${parseError.message}`);
      }
      
      console.log('Courses API response:', { status: response.status, result });
      
      if (result.data && Array.isArray(result.data)) {
        console.log('Returning courses data:', result.data);
        return result.data;
      } else {
        console.log('No data field in response or data is not an array:', result);
        return [];
      }
    } catch (err: any) {
      console.error('Error in getAllCourses:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Course by ID
  const getCourseById = useCallback(async (courseId: string): Promise<Course | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/courses/${courseId}`, {
        method: 'GET',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch course');
      }

      return result.course;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create Course
  const createCourse = useCallback(async (data: {
    title: string;
    description?: string;
    instructor?: string;
    duration?: string;
    level?: string;
    category?: string;
    chapters?: Omit<Chapter, '_id'>[];
  }, token: string): Promise<Course | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create course');
      }

      return result.course;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Enroll in Course
  const enrollInCourse = useCallback(async (courseId: string, token: string): Promise<EnrolledCourse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Log token info for debugging (first 20 chars only for security)
      console.log('Token starts with:', token.substring(0, 20) + '...');
      console.log('Token length:', token.length);

      const url = `${BASE_URL}/api/enrollCourses`;
      console.log('Making enrollment request to:', url);
      console.log('Request payload:', { courseId });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
        },
        body: JSON.stringify({courseId}),
      });

      console.log('Enrollment response status:', response.status);
      console.log('Enrollment response content-type:', response.headers.get('content-type'));
      
      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Enrollment error response text:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      // Get the response as text first to debug
      const responseText = await response.text();
      console.log('Enrollment raw response text (first 200 chars):', responseText.substring(0, 200));
      
      // Try to parse JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError: any) {
        console.error('Enrollment JSON parse error:', parseError);
        console.log('Full enrollment response text:', responseText);
        throw new Error(`Invalid JSON response: ${parseError.message}`);
      }
      
      console.log('Enrollment API response:', { status: response.status, result });

      return result.enrollment;
    } catch (err: any) {
      console.error('Error in enrollInCourse:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get My Enrolled Courses
  const getMyEnrolledCourses = useCallback(async (token: string): Promise<EnrolledCourse[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/my-enrolled-courses`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch enrolled courses');
      }

      return result.enrolledCourses;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get All Enrolled Courses (Admin)
  const getAllEnrolledCourses = useCallback(async (token?: string): Promise<EnrolledCourse[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/api/enrolled-courses`, {
        method: 'GET',
        headers,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch enrolled courses');
      }

      return result.enrolledCourses;
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
    getAllCourses,
    getCourseById,
    createCourse,
    enrollInCourse,
    getMyEnrolledCourses,
    getAllEnrolledCourses,
  };
};
