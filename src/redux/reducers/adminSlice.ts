import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AdminState, AdminUser, DashboardStats } from '../../components/admin/types/admin.types';
import {
  adminAuthService,
  adminDashboardService,
  adminStudentService,
  adminCourseService,
  adminQuizService,
  adminVideoService,
  adminTheoryService,
  adminSessionService,
  adminManagementService,
  adminQuizSubmissionService,
  adminQuestionService,
  adminBookService,
} from '../../components/admin/services/adminAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState: AdminState = {
  currentAdmin: null,
  isLoading: false,
  error: null,
  dashboardStats: null,
  activities: [],
  students: [],
  courses: [],
  quizzes: [],
  videos: [],
  theories: [],
  quizSubmissions: [],
  sessions: [],
  books: [],
  analytics: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

// Thunks
export const getAnalytics = createAsyncThunk(
  'admin/getAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminManagementService.getAnalytics();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

// Thunks
export const adminLogin = createAsyncThunk(
  'admin/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await adminAuthService.login(email, password);
      const { tokens, user } = response.data;
      
      // Extract accessToken from tokens object
      const accessToken = tokens?.accessToken || tokens;
      
      if (!accessToken) {
        throw new Error('No access token in response');
      }
      
      await AsyncStorage.setItem('adminToken', accessToken);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
    }
  }
);

export const getDashboardStats = createAsyncThunk(
  'admin/getDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminDashboardService.getStats();

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const getDashboardActivities = createAsyncThunk(
  'admin/getDashboardActivities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminDashboardService.getActivities();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activities');
    }
  }
);

export const getStudents = createAsyncThunk(
  'admin/getStudents',
  async ({ page = 1, limit = 10, search = '' }: { page?: number; limit?: number; search?: string }, { rejectWithValue }) => {
    try {
      const response = await adminStudentService.getStudents(page, limit, search);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch students');
    }
  }
);

export const createStudent = createAsyncThunk(
  'admin/createStudent',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await adminStudentService.createStudent(data);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create student');
    }
  }
);

export const deleteStudent = createAsyncThunk(
  'admin/deleteStudent',
  async (id: string, { rejectWithValue }) => {
    try {
      await adminStudentService.deleteStudent(id);

      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete student');
    }
  }
);

export const updateStudent = createAsyncThunk(
  'admin/updateStudent',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await adminStudentService.updateStudent(id, data);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update student');
    }
  }
);

export const bulkDeleteStudents = createAsyncThunk(
  'admin/bulkDeleteStudents',
  async (ids: string[], { rejectWithValue }) => {
    try {
      await adminStudentService.bulkDeleteStudents(ids);

      return ids;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete students');
    }
  }
);

export const getStudentProfile = createAsyncThunk(
  'admin/getStudentProfile',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await adminStudentService.getStudentProfile(id);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch student profile');
    }
  }
);

export const getCourses = createAsyncThunk(
  'admin/getCourses',
  async ({ page = 1, limit = 10, search = '' }: { page?: number; limit?: number; search?: string }, { rejectWithValue }) => {
    try {
      const response = await adminCourseService.getCourses(page, limit, search);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch courses');
    }
  }
);

export const createCourse = createAsyncThunk(
  'admin/createCourse',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await adminCourseService.createCourse(data);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create course');
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'admin/deleteCourse',
  async (id: string, { rejectWithValue }) => {
    try {
      await adminCourseService.deleteCourse(id);

      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete course');
    }
  }
);

export const updateCourse = createAsyncThunk(
  'admin/updateCourse',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await adminCourseService.updateCourse(id, data);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update course');
    }
  }
);

export const bulkDeleteCourses = createAsyncThunk(
  'admin/bulkDeleteCourses',
  async (ids: string[], { rejectWithValue }) => {
    try {
      await adminCourseService.bulkDeleteCourses(ids);

      return ids;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete courses');
    }
  }
);

// Theory & Chapter Thunks
export const getTheories = createAsyncThunk(
  'admin/getTheories',
  async (search: string = '', { rejectWithValue }) => {
    try {
      const response = await adminTheoryService.getTheories(search);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch theories');
    }
  }
);

export const createTheory = createAsyncThunk(
  'admin/createTheory',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await adminTheoryService.createTheory(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create theory');
    }
  }
);

export const updateTheory = createAsyncThunk(
  'admin/updateTheory',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await adminTheoryService.updateTheory(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update theory');
    }
  }
);

export const getTheoryStats = createAsyncThunk(
  'admin/getTheoryStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminTheoryService.getStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch theory stats');
    }
  }
);

export const getQuizzes = createAsyncThunk(
  'admin/getQuizzes',
  async ({ page = 1, limit = 10, search = '' }: { page?: number; limit?: number; search?: string }, { rejectWithValue }) => {
    try {
      const response = await adminQuizService.getQuizzes(page, limit, search);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quizzes');
    }
  }
);

export const createQuiz = createAsyncThunk(
  'admin/createQuiz',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await adminQuizService.createQuiz(data);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create quiz');
    }
  }
);

export const updateQuiz = createAsyncThunk(
  'admin/updateQuiz',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await adminQuizService.updateQuiz(id, data);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update quiz');
    }
  }
);

export const deleteQuiz = createAsyncThunk(
  'admin/deleteQuiz',
  async (id: string, { rejectWithValue }) => {
    try {
      await adminQuizService.deleteQuiz(id);

      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete quiz');
    }
  }
);

export const getQuestions = createAsyncThunk(
  'admin/getQuestions',
  async ({ page = 1, limit = 100, quizId }: { page?: number; limit?: number; quizId?: string }, { rejectWithValue }) => {
    try {
      const response = await adminQuestionService.getQuestions(page, limit, quizId);
      return response.data;
    } catch (error: any) {

      const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch questions';
      return rejectWithValue(errorMsg);
    }
  }
);

export const createQuestion = createAsyncThunk(
  'admin/createQuestion',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await adminQuestionService.createQuestion(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create question');
    }
  }
);

export const updateQuestion = createAsyncThunk(
  'admin/updateQuestion',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await adminQuestionService.updateQuestion(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update question');
    }
  }
);

export const deleteQuestion = createAsyncThunk(
  'admin/deleteQuestion',
  async (id: string, { rejectWithValue }) => {
    try {
      await adminQuestionService.deleteQuestion(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete question');
    }
  }
);

export const getVideos = createAsyncThunk(
  'admin/getVideos',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await adminVideoService.getVideos(page, limit);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch videos');
    }
  }
);

export const uploadVideo = createAsyncThunk(
  'admin/uploadVideo',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await adminVideoService.uploadVideo(formData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload video');
    }
  }
);

export const updateVideo = createAsyncThunk(
  'admin/updateVideo',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await adminVideoService.updateVideo(id, data);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update video');
    }
  }
);

export const deleteVideo = createAsyncThunk(
  'admin/deleteVideo',
  async (id: string, { rejectWithValue }) => {
    try {
      await adminVideoService.deleteVideo(id);

      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete video');
    }
  }
);

export const bulkDeleteVideos = createAsyncThunk(
  'admin/bulkDeleteVideos',
  async (ids: string[], { rejectWithValue }) => {
    try {
      await adminVideoService.bulkDeleteVideos(ids);

      return ids;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete videos');
    }
  }
);

export const getSessions = createAsyncThunk(
  'admin/getSessions',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await adminSessionService.getSessions(page, limit);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sessions');
    }
  }
);

export const getQuizSubmissions = createAsyncThunk(
  'admin/getQuizSubmissions',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await adminQuizSubmissionService.getSubmissions(page, limit);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch submissions');
    }
  }
);

// Book Thunks
export const getBooks = createAsyncThunk(
  'admin/getBooks',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await adminBookService.getBooks(page, limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch books');
    }
  }
);

export const createBook = createAsyncThunk(
  'admin/createBook',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await adminBookService.createBook(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create book');
    }
  }
);

export const uploadBook = createAsyncThunk(
  'admin/uploadBook',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await adminBookService.uploadBook(formData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload book to cloud');
    }
  }
);

export const deleteBook = createAsyncThunk(
  'admin/deleteBook',
  async (id: string, { rejectWithValue }) => {
    try {
      await adminBookService.deleteBook(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete book');
    }
  }
);

export const getBookDetails = createAsyncThunk(
  'admin/getBookDetails',
  async (id: string, { rejectWithValue }) => {
    try {
      // Try getBookPdf first as it's most likely what we need for reading
      const response = await adminBookService.getBookPdf(id);
      return response.data;
    } catch (error: any) {
      // Fallback to getBookById if /pdf endpoint doesn't exist
      try {
        const response = await adminBookService.getBookById(id);
        return response.data;
      } catch (innerError: any) {
        return rejectWithValue(innerError.response?.data?.message || 'Failed to fetch book details');
      }
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAdmin: (state) => {
      state.currentAdmin = null;
      state.students = [];
      state.courses = [];
      state.quizzes = [];
      state.videos = [];
      state.quizSubmissions = [];
      state.sessions = [];
      state.books = [];
      state.activities = [];
      state.dashboardStats = null;
    },
    setPagination: (state, action) => {
      state.pagination = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Admin Login
    builder
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAdmin = action.payload;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Dashboard Stats
    builder
      .addCase(getDashboardStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Dashboard Activities
    builder
      .addCase(getDashboardActivities.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDashboardActivities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activities = action.payload.activities || action.payload || [];
      })
      .addCase(getDashboardActivities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Students
    builder
      .addCase(getStudents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getStudents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.students = (action.payload.data || []).map((s: any) => ({
          ...s,
          id: s._id || s.id
        }));
        state.pagination.total = action.payload.pagination?.total || 0;
      })
      .addCase(getStudents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Student
    builder
      .addCase(createStudent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.isLoading = false;
        const newStudent = { ...action.payload, id: action.payload._id || action.payload.id };
        state.students.push(newStudent);
      })
      .addCase(createStudent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Student
    builder
      .addCase(deleteStudent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.students = state.students.filter((s) => s.id !== action.payload);
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Student
    builder
      .addCase(updateStudent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.students = state.students.map((s) => 
          s.id === action.payload.id ? action.payload : s
        );
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Bulk Delete Students
    builder
      .addCase(bulkDeleteStudents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(bulkDeleteStudents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.students = state.students.filter((s) => !action.payload.includes(s.id));
      })
      .addCase(bulkDeleteStudents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Courses
    builder
      .addCase(getCourses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = (action.payload.data || []).map((c: any) => ({
          ...c,
          id: c._id || c.id
        }));
        state.pagination = {
          page: action.payload.pagination?.page || state.pagination.page,
          limit: action.payload.pagination?.limit || state.pagination.limit,
          total: action.payload.pagination?.total || 0,
        };
      })
      .addCase(getCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Course
    builder
      .addCase(createCourse.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        const newCourse = { ...action.payload, id: action.payload._id || action.payload.id };
        state.courses.push(newCourse);
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Course
    builder
      .addCase(deleteCourse.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = state.courses.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Course
    builder
      .addCase(updateCourse.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = state.courses.map((c) => 
          c.id === action.payload.id ? action.payload : c
        );
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Bulk Delete Courses
    builder
      .addCase(bulkDeleteCourses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(bulkDeleteCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = state.courses.filter((c) => !action.payload.includes(c.id));
      })
      .addCase(bulkDeleteCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Quizzes
    builder
      .addCase(getQuizzes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getQuizzes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quizzes = (action.payload.data || []).map((q: any) => ({
          ...q,
          id: q._id || q.id
        }));
        state.pagination = {
          page: action.payload.pagination?.page || state.pagination.page,
          limit: action.payload.pagination?.limit || state.pagination.limit,
          total: action.payload.pagination?.total || 0,
        };
      })
      .addCase(getQuizzes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Quiz
    builder
      .addCase(createQuiz.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        const newQuiz = { ...action.payload, id: action.payload._id || action.payload.id };
        state.quizzes.unshift(newQuiz);
      })
      .addCase(createQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Quiz
    builder
      .addCase(updateQuiz.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedQuiz = { ...action.payload, id: action.payload._id || action.payload.id };
        state.quizzes = state.quizzes.map((q) => q.id === updatedQuiz.id ? updatedQuiz : q);
      })
      .addCase(updateQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Quiz
    builder
      .addCase(deleteQuiz.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quizzes = state.quizzes.filter((q) => q.id !== action.payload);
      })
      .addCase(deleteQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Videos
    builder
      .addCase(getVideos.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getVideos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.videos = action.payload.data || (Array.isArray(action.payload) ? action.payload : []);
      })
      .addCase(getVideos.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Upload Video
    builder
      .addCase(uploadVideo.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(uploadVideo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.videos.unshift(action.payload);
      })
      .addCase(uploadVideo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Video
    builder
      .addCase(updateVideo.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateVideo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.videos = state.videos.map((v) => 
          v.id === action.payload.id ? action.payload : v
        );
      })
      .addCase(updateVideo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Video
    builder
      .addCase(deleteVideo.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteVideo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.videos = state.videos.filter((v) => v.id !== action.payload);
      })
      .addCase(deleteVideo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Bulk Delete Videos
    builder
      .addCase(bulkDeleteVideos.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(bulkDeleteVideos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.videos = state.videos.filter((v) => !action.payload.includes(v.id));
      })
      .addCase(bulkDeleteVideos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Sessions
    builder
      .addCase(getSessions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSessions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sessions = action.payload.data || [];
      })
      .addCase(getSessions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Quiz Submissions
    builder
      .addCase(getQuizSubmissions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getQuizSubmissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quizSubmissions = action.payload.data || (Array.isArray(action.payload) ? action.payload : []);
      })
      .addCase(getQuizSubmissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Books Management
    builder
      .addCase(getBooks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getBooks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.books = action.payload.data || (Array.isArray(action.payload) ? action.payload : []);
      })
      .addCase(getBooks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createBook.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createBook.fulfilled, (state, action) => {
        state.isLoading = false;
        // Depending on backend, action.payload could be the book or { data: book }
        const newBook = action.payload.data || action.payload;
        // Prepend it so it shows up at the top
        if (state.books) state.books.unshift(newBook);
      })
      .addCase(createBook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadBook.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadBook.fulfilled, (state, action) => {
        state.isLoading = false;
        const newBook = action.payload.data || action.payload;
        if (state.books) state.books.unshift(newBook);
      })
      .addCase(uploadBook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        if (state.books) {
          state.books = state.books.filter((b: any) => b._id !== action.payload && b.id !== action.payload);
        }
      });

    // Get Student Profile
    builder
      .addCase(getStudentProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getStudentProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        // Normalize the profile data if needed
        if (action.payload.student && action.payload.student._id) {
          action.payload.student.id = action.payload.student._id;
        }
      })
      .addCase(getStudentProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Theory Management
      .addCase(getTheories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTheories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.theories = action.payload.data || [];
      })
      .addCase(createTheory.fulfilled, (state, action) => {
        state.theories.push(action.payload);
      })
      .addCase(updateTheory.fulfilled, (state, action) => {
        state.theories = state.theories.map((t) => 
          (t._id || t.id) === (action.payload._id || action.payload.id) ? action.payload : t
        );
      })
      // Question Management (Automatic Link Handling)
      .addCase(createQuestion.fulfilled, (state, action) => {
        const question = action.payload.data || action.payload;
        const quizId = question.quiz?._id || question.quiz?.id || question.quiz;
        if (quizId) {
          state.quizzes = state.quizzes.map((q) => {
            if (String(q._id || q.id) === String(quizId)) {
              return { ...q, totalQuestions: (q.totalQuestions || 0) + 1 };
            }
            return q;
          });
        }
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        const deletedQuestionId = action.payload;
        // Since we don't store questions in Redux state, we can't easily find which quiz it belonged to 
        // unless we refetch or keep a mapping. But for now, the UI refetches quizzes often.
        // If we want to be precise, we'd need the quizId in the payload.
      })
      // Analytics
      .addCase(getAnalytics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = action.payload;
      })
      .addCase(getAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearAdmin, setPagination } = adminSlice.actions;
export default adminSlice.reducer;
