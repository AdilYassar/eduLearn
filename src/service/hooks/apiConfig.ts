import {BASE_URL} from '../config';

// API Endpoints Configuration
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    STUDENT_REGISTER: `${BASE_URL}/api/student/register`,
    STUDENT_LOGIN: `${BASE_URL}/api/student/login`,
    ADMIN_REGISTER: `${BASE_URL}/api/admin/register`,
    ADMIN_LOGIN: `${BASE_URL}/api/admin/login`,
    REFRESH_TOKEN: `${BASE_URL}/api/refresh-token`,
    LOGOUT: `${BASE_URL}/api/logout`,
    CHANGE_PASSWORD: `${BASE_URL}/api/user/password`,
  },

  // User Management
  USER: {
    PROFILE: `${BASE_URL}/api/user`,
    GENERIC_PROFILE: `${BASE_URL}/api/user/profile`,
    UPDATE_PROFILE: `${BASE_URL}/api/user`,
    ENROLLMENT_STATS: `${BASE_URL}/api/user/enrollment-stats`,
    ADMIN_USERS: `${BASE_URL}/api/admin/users`,
  },

  // Course Management
  COURSE: {
    ALL_COURSES: `${BASE_URL}/api/courses`,
    COURSE_BY_ID: (id: string) => `${BASE_URL}/api/courses/${id}`,
    CREATE_COURSE: `${BASE_URL}/api/courses`,
    ENROLL_COURSE: `${BASE_URL}/api/enrollCourses`,
    MY_ENROLLED_COURSES: `${BASE_URL}/api/my-enrolled-courses`,
    ALL_ENROLLED_COURSES: `${BASE_URL}/api/enrolled-courses`,
  },

  // Quiz Management
  QUIZ: {
    ALL_QUIZZES: `${BASE_URL}/api/allquiz`,
    QUIZ_DETAILS: (id: string) => `${BASE_URL}/api/quiz/${id}`,
    QUIZ_QUESTIONS: (id: string) => `${BASE_URL}/api/quiz/${id}/questions`,
    SUBMIT_QUIZ: `${BASE_URL}/api/quiz-submission`,
    MY_SUBMISSIONS: `${BASE_URL}/api/my-submissions`,
    QUIZ_MARKS: (id: string) => `${BASE_URL}/api/quiz/${id}/marks`,
  },

  // Question Management
  QUESTION: {
    CREATE_QUESTION: (quizId: string) => `${BASE_URL}/api/quiz/${quizId}/question`,
    QUESTION_DETAILS: (id: string) => `${BASE_URL}/api/question/${id}`,
    UPDATE_QUESTION: (id: string) => `${BASE_URL}/api/question/${id}`,
    DELETE_QUESTION: (id: string) => `${BASE_URL}/api/question/${id}`,
  },

  // Learning Materials
  LEARNING: {
    ALL_BOOKS: `${BASE_URL}/api/books`,
    BOOK_BY_ID: (id: string) => `${BASE_URL}/api/books/${id}`,
    THEORY_BY_COURSE: (courseId: string) => `${BASE_URL}/api/theory/${courseId}`,
    THEORY_BY_ID: (id: string) => `${BASE_URL}/api/theory/content/${id}`,
    QUIZ_CATEGORIES: `${BASE_URL}/api/categories`,
    ALL_CATEGORIES: `${BASE_URL}/api/categories/all`,
    BRANCHES: `${BASE_URL}/api/branches`,
    BRANCH_BY_ID: (id: string) => `${BASE_URL}/api/branches/${id}`,
  },

  // Video Call Management
  VIDEO: {
    CREATE_SESSION: `${BASE_URL}/api/create-session`,
    SESSION_STATUS: (sessionId: string) => `${BASE_URL}/api/is-alive?sessionId=${sessionId}`,
    SESSION_DETAILS: (sessionId: string) => `${BASE_URL}/api/session/${sessionId}`,
    DELETE_SESSION: (sessionId: string) => `${BASE_URL}/api/session/${sessionId}`,
  },

  // Progress Tracking
  PROGRESS: {
    MARK_CHAPTER_COMPLETED: (courseId: string, chapterId: string) =>
      `${BASE_URL}/api/progress/course/${courseId}/chapter/${chapterId}/complete`,
    START_READING_SESSION: (courseId: string, chapterId: string) =>
      `${BASE_URL}/api/progress/course/${courseId}/chapter/${chapterId}/start-reading`,
    END_READING_SESSION: (courseId: string, chapterId: string) =>
      `${BASE_URL}/api/progress/course/${courseId}/chapter/${chapterId}/end-reading`,
    UPDATE_CHAPTER_PROGRESS: (courseId: string, chapterId: string) =>
      `${BASE_URL}/api/progress/course/${courseId}/chapter/${chapterId}/update-progress`,
    COURSE_PROGRESS: (courseId: string) => `${BASE_URL}/api/progress/course/${courseId}`,
    USER_STATS: `${BASE_URL}/api/progress/user-stats`,
    ALL_COURSES_PROGRESS: `${BASE_URL}/api/progress/all-courses`,
    LEARNING_STREAK: `${BASE_URL}/api/progress/learning-streak`,
    LEADERBOARD: `${BASE_URL}/api/progress/leaderboard`,
    DETAILED_CHAPTER_PROGRESS: (courseId: string, chapterId: string) =>
      `${BASE_URL}/api/progress/course/${courseId}/chapter/${chapterId}`,
  },
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

// Common Headers
export const getAuthHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export const getBasicHeaders = () => ({
  'Content-Type': 'application/json',
});

// Response status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'A server error occurred. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const;
