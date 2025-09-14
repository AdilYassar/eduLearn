import {useState, useCallback} from 'react';
import {BASE_URL} from '../config';

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  course?: string;
  category?: string;
  difficulty?: string;
  timeLimit?: number;
  passingScore?: number;
  questions?: Question[];
  createdAt: string;
  updatedAt: string;
}

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

interface QuizSubmission {
  _id: string;
  student: string;
  quiz: Quiz;
  answers: Array<{
    question: string;
    answer: string;
    isCorrect: boolean;
  }>;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  grade: string;
  timeSpent: number;
  submittedAt: string;
  attemptNumber: number;
  status: string;
  completedAt: string;
}

interface MarksSummary {
  _id: string;
  quiz: string;
  student: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  submissionDate: string;
}

export const useQuiz = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get All Quizzes
  const getAllQuizzes = useCallback(async (): Promise<Quiz[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/allquiz`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch quizzes');
      }

      return result.quizzes;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Quiz Details
  const getQuizDetails = useCallback(async (quizId: string): Promise<Quiz | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/quiz/${quizId}`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch quiz details');
      }

      return result.quiz;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Quiz Questions
  const getQuizQuestions = useCallback(async (quizId: string): Promise<Question[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/quiz/${quizId}/questions`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch quiz questions');
      }

      return result.questions;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Submit Quiz
  const submitQuiz = useCallback(async (data: {
    quizId: string;
    courseId?: string;
    answers: Array<{
      question: string; // Changed from questionId to question to match API
      answer: string;
    }>;
    timeSpent?: number;
  }, token: string): Promise<{
    submission: QuizSubmission;
    marksSummary: any;
  } | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Submitting to:', `${BASE_URL}/api/quiz-submission`);
      console.log('Request data:', JSON.stringify(data, null, 2));
      console.log('Authorization token:', token ? `Bearer ${token.substring(0, 20)}...` : 'No token');
      
      const response = await fetch(`${BASE_URL}/api/quiz-submission`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true', // Add ngrok header
        },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const result = await response.json();
      console.log('Response body:', JSON.stringify(result, null, 2));
      
      if (!response.ok) {
        console.error('Quiz submission failed with status:', response.status);
        console.error('Error details:', result);
        
        // Check if it's an authentication error
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Please check your permissions.');
        } else if (response.status === 404) {
          throw new Error('Quiz not found. Please try again.');
        } else {
          throw new Error(result.message || `Failed to submit quiz (Status: ${response.status})`);
        }
      }

      return {
        submission: result.submission,
        marksSummary: result.marksSummary,
      };
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get My Quiz Submissions
  const getMyQuizSubmissions = useCallback(async (token: string): Promise<QuizSubmission[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/my-submissions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch quiz submissions');
      }

      return result.submissions;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Quiz Marks Summary
  const getQuizMarksSummary = useCallback(async (quizId: string): Promise<MarksSummary[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/quiz/${quizId}/marks`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch marks summary');
      }

      return result.marksSummary;
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
    getAllQuizzes,
    getQuizDetails,
    getQuizQuestions,
    submitQuiz,
    getMyQuizSubmissions,
    getQuizMarksSummary,
  };
};
