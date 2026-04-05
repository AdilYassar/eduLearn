import {useState, useCallback} from 'react';
import {BASE_URL} from '../config';

interface VideoSession {
  sessionId: string;
  createdAt: string;
  participants?: string[];
  isActive: boolean;
}

interface SessionStatus {
  isAlive: boolean;
  sessionId: string;
  participantCount?: number;
}

export const useVideoCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create Video Session
  const createVideoSession = useCallback(async (): Promise<VideoSession | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create video session');
      }

      return {
        sessionId: result.sessionId,
        createdAt: new Date().toISOString(),
        isActive: true,
      };
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check Session Status
  const checkSessionStatus = useCallback(async (sessionId: string): Promise<SessionStatus | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/is-alive?sessionId=${sessionId}`, {
        method: 'GET',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to check session status');
      }

      return {
        isAlive: result.isAlive,
        sessionId,
        participantCount: result.participantCount,
      };
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Session Details
  const getSessionDetails = useCallback(async (sessionId: string): Promise<VideoSession | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/session/${sessionId}`, {
        method: 'GET',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch session details');
      }

      return {
        sessionId: result.sessionId,
        createdAt: result.createdAt,
        participants: result.participants,
        isActive: true,
      };
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete Session
  const deleteSession = useCallback(async (sessionId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/session/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to delete session');
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Join Session (WebSocket connection would be handled separately)
  const joinSession = useCallback(async (sessionId: string, _userId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // This would typically involve WebSocket connection
      // For now, we'll just validate the session exists
      const sessionStatus = await checkSessionStatus(sessionId);
      
      if (!sessionStatus?.isAlive) {
        throw new Error('Session is not active');
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [checkSessionStatus]);

  return {
    loading,
    error,
    createVideoSession,
    checkSessionStatus,
    getSessionDetails,
    deleteSession,
    joinSession,
  };
};
