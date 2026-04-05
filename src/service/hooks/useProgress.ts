import {useState, useCallback} from 'react';
import {BASE_URL} from '../config';

interface ChapterProgress {
  _id: string;
  student: string;
  course: string;
  chapter: string;
  isCompleted: boolean;
  progressPercentage: number;
  timeSpent: number; // in seconds
  readingSessions: ReadingSession[];
  firstAccessedAt?: string;
  lastAccessedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReadingSession {
  startTime: string;
  endTime?: string;
  duration?: number; // in seconds
  progressAtStart: number;
  progressAtEnd?: number;
}

interface CourseProgress {
  course: string;
  totalChapters: number;
  completedChapters: number;
  overallProgress: number;
  totalTimeSpent: number;
  chapters: ChapterProgress[];
}

interface UserProgressStats {
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  totalChaptersCompleted: number;
  totalTimeSpent: number; // in seconds
  totalLearningDays: number;
  averageProgressPercentage: number;
  currentStreak: number;
  longestStreak: number;
  weeklyGoalProgress: number;
  monthlyGoalProgress: number;
}

interface LeaderboardEntry {
  student: {
    _id: string;
    name: string;
    email: string;
    photo?: string;
  };
  totalProgress: number;
  totalTimeSpent: number;
  completedChapters: number;
  rank: number;
}

export const useProgress = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mark Chapter as Completed
  const markChapterCompleted = useCallback(async (
    courseId: string,
    chapterId: string,
    token: string
  ): Promise<ChapterProgress | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/progress/course/${courseId}/chapter/${chapterId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to mark chapter as completed');
      }

      return result.progress;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Start Reading Session
  const startReadingSession = useCallback(async (
    courseId: string,
    chapterId: string,
    token: string
  ): Promise<ChapterProgress | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/progress/course/${courseId}/chapter/${chapterId}/start-reading`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to start reading session');
      }

      return result.progress;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // End Reading Session
  const endReadingSession = useCallback(async (
    courseId: string,
    chapterId: string,
    progressPercentage: number,
    token: string
  ): Promise<ChapterProgress | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/progress/course/${courseId}/chapter/${chapterId}/end-reading`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({progressPercentage}),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to end reading session');
      }

      return result.progress;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update Chapter Progress
  const updateChapterProgress = useCallback(async (
    courseId: string,
    chapterId: string,
    data: {
      progressPercentage: number;
      timeSpent?: number;
    },
    token: string
  ): Promise<ChapterProgress | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/progress/course/${courseId}/chapter/${chapterId}/update-progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update chapter progress');
      }

      return result.progress;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Course Progress
  const getCourseProgress = useCallback(async (
    courseId: string,
    token: string
  ): Promise<CourseProgress | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/progress/course/${courseId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch course progress');
      }

      return result.progress;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get User Progress Statistics
  const getUserProgressStats = useCallback(async (token: string): Promise<UserProgressStats | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/progress/user-stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch user progress statistics');
      }

      return result.stats;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get All Courses Progress
  const getAllCoursesProgress = useCallback(async (token: string): Promise<CourseProgress[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/progress/all-courses`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch all courses progress');
      }

      return result.progress;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Learning Streak
  const getLearningStreak = useCallback(async (token: string): Promise<{
    currentStreak: number;
    longestStreak: number;
    streakDates: string[];
  } | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/progress/learning-streak`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch learning streak');
      }

      return result.streak;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Progress Leaderboard
  const getProgressLeaderboard = useCallback(async (token: string): Promise<LeaderboardEntry[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/progress/leaderboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch progress leaderboard');
      }

      return result.leaderboard;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Detailed Chapter Progress
  const getDetailedChapterProgress = useCallback(async (
    courseId: string,
    chapterId: string,
    token: string
  ): Promise<ChapterProgress | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/progress/course/${courseId}/chapter/${chapterId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch detailed chapter progress');
      }

      return result.progress;
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
    markChapterCompleted,
    startReadingSession,
    endReadingSession,
    updateChapterProgress,
    getCourseProgress,
    getUserProgressStats,
    getAllCoursesProgress,
    getLearningStreak,
    getProgressLeaderboard,
    getDetailedChapterProgress,
  };
};
