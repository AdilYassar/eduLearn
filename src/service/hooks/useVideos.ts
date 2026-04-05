import { useState, useCallback } from 'react';
import { BASE_URL } from '../config';

interface Video {
  _id: string;
  id: string;
  title: string;
  description: string;
  url: string;
  fullUrl: string;
  fileSize: number;
  uploadedAt: string;
  __v: number;
}

export const useVideos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all videos
  const getAllVideos = useCallback(async (): Promise<Video[] | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🎥 Fetching videos from:', `${BASE_URL}/api/videos`);
      
      const response = await fetch(`${BASE_URL}/api/videos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch videos: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Videos fetched successfully:', result?.length || 0, 'videos');
      
      return result;
    } catch (err: any) {
      console.error('❌ Error fetching videos:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getAllVideos,
    loading,
    error,
  };
};

