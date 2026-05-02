// Admin Types
export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'super_admin';
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  totalQuizzes: number;
  totalVideos: number;
  activeSessions: number;
  totalAdmins: number;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  enrolledCourses: number;
  progress: number;
  status: 'active' | 'inactive';
  joinedDate: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  studentsEnrolled: number;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface Quiz {
  id: string;
  title: string;
  courseId: string;
  totalQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  passingScore: number;
  createdAt: string;
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  type: 'mcq' | 'short_answer' | 'essay';
  options?: string[];
  correctAnswer: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: number;
  views: number;
  uploadedAt: string;
}

export interface QuizSubmission {
  id: string;
  studentId: string;
  quizId: string;
  score: number;
  totalMarks: number;
  submittedAt: string;
  status: 'pass' | 'fail';
}

export interface SessionRecord {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  participantCount: number;
  recordingUrl?: string;
}

export interface Chapter {
  title: string;
  content: string;
}

export interface Theory {
  _id?: string;
  id?: string;
  courseTitle: string;
  description: string;
  courseId: string;
  chapters: Chapter[];
}

export interface AdminStats {
  totalStudents: number;
  totalCourses: number;
  totalQuizzes: number;
  totalVideos: number;
  activeSessions: number;
  totalAdmins: number;
}

export interface AdminAnalytics {
  registrationTrend: {
    labels: string[];
    data: number[];
  };
  contentDistribution: {
    label: string;
    value: number;
  }[];
  quizPerformance: {
    labels: string[];
    data: number[];
  };
  overview: {
    totalStudents: number;
    totalCourses: number;
    totalQuizzes: number;
    totalSubmissions: number;
  };
}

// Redux State Type
export interface AdminState {
  currentAdmin: AdminUser | null;
  isLoading: boolean;
  error: string | null;
  dashboardStats: DashboardStats | null;
  activities: any[];
  students: Student[];
  courses: Course[];
  quizzes: Quiz[];
  videos: Video[];
  theories: Theory[];
  quizSubmissions: any[];
  sessions: SessionRecord[];
  books: any[];
  analytics: AdminAnalytics | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
