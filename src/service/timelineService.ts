import { InferenceClient } from '@huggingface/inference';
import { ENV_CONFIG } from '../config/envConfig';
import { makeAuthenticatedRequest } from './authUtils';
import { BASE_URL } from './config';

const client = new InferenceClient(ENV_CONFIG.HUGGING_API_KEY);

export interface TimelineSession {
  date: string;
  chapters: string[];
}

export interface CourseData {
  id: string;
  title: string;
  chapters: {
    id: string;
    title: string;
    order: number;
    description?: string;
  }[];
  completedChapters?: string[];
}

/**
 * Generates a study timeline using AI.
 */
export const generateCourseTimeline = async (course: CourseData, customPrompt?: string): Promise<TimelineSession[]> => {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0];

  const prompt = `
    You are an AI Study Planner. Create a personalized day-by-day study timeline for the course: "${course.title}".
    
    COURSE DETAILS:
    - Total Chapters: ${course.chapters.length}
    - Chapters: ${course.chapters.map(c => `#${c.order}: ${c.title}`).join(', ')}
    - User has already completed: ${course.completedChapters?.length || 0} chapters.
    
    ${customPrompt ? `USER SPECIFIC REQUEST: "${customPrompt}" - Adjust the schedule according to this request while maintaining the course goals.` : ''}

    REQUIREMENTS:
    - Output ONLY valid JSON.
    - Factor in the logical order of chapters.
    - Assign specific chapters to specific dates starting from ${dateString}.
    - Be realistic about study load (1-2 chapters per day depending on complexity).
    - Format the output as an array of objects: [{"date": "YYYY-MM-DD", "chapters": ["Chapter Title 1", "Chapter Title 2"]}]
    
    JSON Output:
  `;

  try {
    const response = await client.chatCompletion({
      provider: 'novita',
      model: 'meta-llama/Llama-3.3-70B-Instruct',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    // Extract JSON from response (handle potential markdown blocks)
    const jsonMatch = content.match(/\[\s*{[\s\S]*}\s*\]/);
    const jsonString = jsonMatch ? jsonMatch[0] : content;
    
    const timeline: TimelineSession[] = JSON.parse(jsonString);
    return timeline;
  } catch (error) {
    console.error('Error generating timeline:', error);
    throw error;
  }
};

/**
 * Syncs the generated timeline with the backend.
 */
export const syncTimelineWithBackend = async (
  courseId: string, 
  sessions: TimelineSession[], 
  userPrompt?: string
) => {
  try {
    const response = await makeAuthenticatedRequest(`${BASE_URL}/api/timeline/sync`, {
      method: 'POST',
      body: JSON.stringify({ courseId, sessions, userPrompt }),
    });
    
    if (!response || !response.ok) {
      throw new Error('Sync failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error syncing timeline:', error);
    throw error;
  }
};

/**
 * Fetches the timeline from the backend.
 */
export const getTimelineFromBackend = async (courseId: string): Promise<TimelineSession[] | null> => {
  try {
    const response = await makeAuthenticatedRequest(`${BASE_URL}/api/timeline/${courseId}`, {
      method: 'GET',
    });
    
    if (!response || response.status === 404) {
      return null;
    }
    
    const result = await response.json();
    // Assuming backend returns { success: true, data: { sessions: [...] } }
    return result.data?.sessions || result.sessions || null;
  } catch (error) {
    console.error('Error fetching timeline:', error);
    return null;
  }
};

/**
 * Fetches all timelines for the authenticated user.
 */
export const getAllTimelinesFromBackend = async (): Promise<any[] | null> => {
  try {
    const response = await makeAuthenticatedRequest(`${BASE_URL}/api/timeline`, {
      method: 'GET',
    });
    
    if (!response || !response.ok) {
      return null;
    }
    
    const result = await response.json();
    return result.data || result.timelines || [];
  } catch (error) {
    console.error('Error fetching all timelines:', error);
    return null;
  }
};
