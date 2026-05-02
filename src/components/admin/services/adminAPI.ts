import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://romantic-nanete-adildevelopment-3ec66986.koyeb.app/api';

const adminAPI = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Add token to requests
adminAPI.interceptors.request.use(
  async (config) => {

    const token = await AsyncStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;

    } else {

    }
    return config;
  },
  (error) => {

    return Promise.reject(error);
  }
);

// Add response interceptor
adminAPI.interceptors.response.use(
  (response) => {

    return response;
  },
  (error) => {

    return Promise.reject(error);
  }
);

// Admin Auth
export const adminAuthService = {
  login: async (email: string, password: string) => {

    try {
      const result = await adminAPI.post('/login', { email, password });

      return result;
    } catch (error) {

      throw error;
    }
  },
  logout: async () => {
    await AsyncStorage.removeItem('adminToken');
  },
};

// Dashboard
export const adminDashboardService = {
  getStats: () => adminAPI.get('/dashboard-stats'),
  getActivities: () => adminAPI.get('/dashboard-activities'),
};

// Student Management
export const adminStudentService = {
  getStudents: (page = 1, limit = 10, search = '') =>
    adminAPI.get(`/management/students?page=${page}&limit=${limit}&search=${search}`),
  getStudentById: (id: string) => adminAPI.get(`/management/students/${id}`),
  createStudent: (data: any) => adminAPI.post('/management/students', data),
  updateStudent: (id: string, data: any) =>
    adminAPI.put(`/management/students/${id}`, data),
  deleteStudent: (id: string) => adminAPI.delete(`/management/students/${id}`),
  getStudentProfile: (id: string) => adminAPI.get(`/management/students/${id}/profile`),
  bulkDeleteStudents: (ids: string[]) =>
    adminAPI.delete('/management/students/bulk', { data: { ids } }),
};

// Course Management
export const adminCourseService = {
  getCourses: (page = 1, limit = 10, search = '') => {
    let url = `/management/courses?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return adminAPI.get(url);
  },
  getCourseById: (id: string) => adminAPI.get(`/management/courses/${id}`),
  createCourse: (data: any) => adminAPI.post('/management/courses', data),
  updateCourse: (id: string, data: any) =>
    adminAPI.put(`/management/courses/${id}`, data),
  deleteCourse: (id: string) => adminAPI.delete(`/management/courses/${id}`),
  bulkDeleteCourses: (ids: string[]) =>
    adminAPI.delete('/management/courses/bulk', { data: { ids } }),
};

// Theory Management
export const adminTheoryService = {
  getStats: () => adminAPI.get('/management/theory/stats'),
  getTheories: (search = '') =>
    adminAPI.get(`/management/theory${search ? `?search=${search}` : ''}`),
  createTheory: (data: any) => adminAPI.post('/management/theory', data),
  updateTheory: (id: string, data: any) =>
    adminAPI.put(`/management/theory/${id}`, data),
  deleteTheory: (id: string) => adminAPI.delete(`/management/theory/${id}`),
};

// Books Management
export const adminBookService = {
  getBooks: (page = 1, limit = 10) =>
    adminAPI.get(`/management/books?page=${page}&limit=${limit}`),
  getBookById: (id: string) => adminAPI.get(`/management/books/${id}`),
  getBookPdf: (id: string) => adminAPI.get(`/management/books/${id}/pdf`),
  createBook: (data: any) => adminAPI.post('/admin/management/books', data),
  uploadBook: async (formData: FormData) => {
    const token = await AsyncStorage.getItem('adminToken');
    const response = await fetch(`${BASE_URL}/management/books/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw { response: { data: errorData, status: response.status } };
    }

    return { data: await response.json() };
  },
  updateBook: (id: string, data: any) =>
    adminAPI.put(`/management/books/${id}`, data),
  deleteBook: (id: string) => adminAPI.delete(`/management/books/${id}`),
};

// Quiz Management
export const adminQuizService = {
  getQuizzes: (page = 1, limit = 10, search = '') => {
    let url = `/management/quizzes?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return adminAPI.get(url);
  },
  getQuizById: (id: string) => adminAPI.get(`/management/quizzes/${id}`),
  createQuiz: (data: any) => adminAPI.post('/management/quizzes', data),
  updateQuiz: (id: string, data: any) =>
    adminAPI.put(`/management/quizzes/${id}`, data),
  deleteQuiz: (id: string) => adminAPI.delete(`/management/quizzes/${id}`),
  bulkDeleteQuizzes: (ids: string[]) =>
    adminAPI.delete('/management/quizzes/bulk', { data: { ids } }),
};

// Questions Management
export const adminQuestionService = {
  getQuestions: (page = 1, limit = 10, quizId?: string) => {
    let url = `/management/questions?page=${page}&limit=${limit}`;
    if (quizId) url += `&quiz=${quizId}`;
    return adminAPI.get(url);
  },
  createQuestion: (data: any) => adminAPI.post('/management/questions', data),
  updateQuestion: (id: string, data: any) =>
    adminAPI.put(`/management/questions/${id}`, data),
  deleteQuestion: (id: string) => adminAPI.delete(`/management/questions/${id}`),
};

// Categories
export const adminCategoryService = {
  getCategories: () => adminAPI.get('/management/categories'),
  createCategory: (data: any) => adminAPI.post('/management/categories', data),
  updateCategory: (id: string, data: any) =>
    adminAPI.put(`/management/categories/${id}`, data),
  deleteCategory: (id: string) =>
    adminAPI.delete(`/management/categories/${id}`),
};

// Branches
export const adminBranchService = {
  getBranches: () => adminAPI.get('/management/branches'),
  createBranch: (data: any) => adminAPI.post('/management/branches', data),
  updateBranch: (id: string, data: any) =>
    adminAPI.put(`/management/branches/${id}`, data),
  deleteBranch: (id: string) => adminAPI.delete(`/management/branches/${id}`),
};

// Enrolled Courses
export const adminEnrolledCourseService = {
  getEnrolledCourses: (page = 1, limit = 10) =>
    adminAPI.get(`/management/enrolled-courses?page=${page}&limit=${limit}`),
};

// Quiz Submissions
export const adminQuizSubmissionService = {
  getSubmissions: (page = 1, limit = 10) =>
    adminAPI.get(`/management/quiz-submissions?page=${page}&limit=${limit}`),
  getSubmissionById: (id: string) =>
    adminAPI.get(`/management/quiz-submissions/${id}`),
};

// Marks Summary
export const adminMarksService = {
  getMarksSummary: (page = 1, limit = 10) =>
    adminAPI.get(`/management/marks-summary?page=${page}&limit=${limit}`),
};

// User Progress
export const adminProgressService = {
  getUserProgress: (page = 1, limit = 10) =>
    adminAPI.get(`/management/user-progress?page=${page}&limit=${limit}`),
};



export const adminVideoService = {
  getVideos: (page = 1, limit = 10) => adminAPI.get(`/videos?page=${page}&limit=${limit}`),
  uploadVideo: async (formData: FormData) => {
    const token = await AsyncStorage.getItem('adminToken');

    // We use native fetch for video uploads as it handles large FormData more reliably in some RN environments
    const response = await fetch(`${BASE_URL}/videos/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        // DO NOT set Content-Type, let fetch handle the boundary
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw { response: { data: errorData, status: response.status } };
    }

    return { data: await response.json() };
  },
  deleteVideo: (id: string) => adminAPI.delete(`/videos/${id}`),
  updateVideo: (id: string, data: any) => adminAPI.put(`/videos/${id}`, data),
  bulkDeleteVideos: (ids: string[]) => adminAPI.delete('/videos/bulk', { data: { ids } }),
};

// Sessions
export const adminSessionService = {
  getSessions: (page = 1, limit = 10) =>
    adminAPI.get(`/management/sessions?page=${page}&limit=${limit}`),
  deleteSession: (id: string) => adminAPI.delete(`/management/sessions/${id}`),
};

// Admin Management
export const adminManagementService = {
  getCurrentAdmin: () =>
    adminAPI.get('/management/admin-emails/current-user'),
  getAdminStats: () => adminAPI.get('/management/admin-emails/stats'),
  getAllAdmins: (page = 1, limit = 10) =>
    adminAPI.get(`/management/admin-emails?page=${page}&limit=${limit}`),
  createAdmin: (data: any) => adminAPI.post('/management/admin-emails', data),
  updateAdmin: (id: string, data: any) =>
    adminAPI.put(`/management/admin-emails/${id}`, data),
  deleteAdmin: (id: string) => adminAPI.delete(`/management/admin-emails/${id}`),
  getAnalytics: () => adminAPI.get('/management/analytics'),
};

// Support & Feedback Management
export const adminSupportService = {
  getFeedback: () => adminAPI.get('/management/feedback'),
  getTickets: () => adminAPI.get('/management/support/tickets'),
  getTicketMessages: (id: string) => adminAPI.get(`/management/support/tickets/${id}/messages`),
  sendReply: (id: string, message: string, adminId: string) => 
    adminAPI.post(`/management/support/tickets/${id}/messages`, { message, adminId }),
  updateTicketStatus: (id: string, data: { status?: string, priority?: string }) =>
    adminAPI.patch(`/management/support/tickets/${id}`, data),
};

export default adminAPI;
