import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TimelineSession {
  date: string;
  chapters: string[]; // Array of chapter IDs or titles
}

interface CourseTimeline {
  courseId: string;
  generatedAt: string;
  timeline: TimelineSession[];
}

interface TimelineState {
  timelines: { [courseId: string]: CourseTimeline };
  loading: { [courseId: string]: boolean };
  error: { [courseId: string]: string | null };
}

const initialState: TimelineState = {
  timelines: {},
  loading: {},
  error: {},
};

const timelineSlice = createSlice({
  name: 'timeline',
  initialState,
  reducers: {
    setTimeline: (state, action: PayloadAction<CourseTimeline>) => {
      state.timelines[action.payload.courseId] = action.payload;
    },
    setLoading: (state, action: PayloadAction<{ courseId: string; isLoading: boolean }>) => {
      state.loading[action.payload.courseId] = action.payload.isLoading;
    },
    setError: (state, action: PayloadAction<{ courseId: string; error: string | null }>) => {
      state.error[action.payload.courseId] = action.payload.error;
    },
    clearTimeline: (state, action: PayloadAction<string>) => {
      delete state.timelines[action.payload];
    },
    resetAllTimelines: (state) => {
      state.timelines = {};
      state.loading = {};
      state.error = {};
    },
  },
});

export const { setTimeline, setLoading, setError, clearTimeline, resetAllTimelines } = timelineSlice.actions;

export const selectTimelines = (state: any) => state.timeline.timelines;
export const selectTimelineByCourse = (state: any, courseId: string) => state.timeline.timelines[courseId];
export const selectTimelineLoading = (state: any, courseId: string) => state.timeline.loading[courseId];
export const selectTimelineError = (state: any, courseId: string) => state.timeline.error[courseId];

export default timelineSlice.reducer;
