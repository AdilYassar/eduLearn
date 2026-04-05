import {useState, useCallback} from 'react';
import {BASE_URL} from '../config';

interface Question {
  _id: string;
  quiz: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'text';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  points?: number;
}

export const useQuestion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create Question
  const createQuestion = useCallback(async (quizId: string, data: {
    text: string;
    type: 'multiple-choice' | 'true-false' | 'text';
    options?: string[];
    correctAnswer: string;
    explanation?: string;
    points?: number;
  }, token: string): Promise<Question | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/quiz/${quizId}/question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create question');
      }

      return result.question;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Question Details
  const getQuestionDetails = useCallback(async (questionId: string): Promise<Question | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/question/${questionId}`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch question details');
      }

      return result.question;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update Question
  const updateQuestion = useCallback(async (questionId: string, data: {
    text?: string;
    type?: 'multiple-choice' | 'true-false' | 'text';
    options?: string[];
    correctAnswer?: string;
    explanation?: string;
    points?: number;
  }, token: string): Promise<Question | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/question/${questionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update question');
      }

      return result.question;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete Question
  const deleteQuestion = useCallback(async (questionId: string, token: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/question/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to delete question');
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
    createQuestion,
    getQuestionDetails,
    updateQuestion,
    deleteQuestion,
  };
};
