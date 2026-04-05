// Authentication hooks
export { useAuth } from './useAuth';

// User management hooks
export { useUser } from './useUser';

// Course management hooks
export { useCourse } from './useCourse';

// Quiz management hooks
export { useQuiz } from './useQuiz';

// Question management hooks
export { useQuestion } from './useQuestion';

// Learning materials hooks
export { useLearningMaterials } from './useLearningMaterials';

// Video call hooks
export { useVideoCall } from './useVideoCall';

// Progress tracking hooks
export { useProgress } from './useProgress';

// API utilities
export { useApiRequest, useApiMutations, useAuthState, usePagination } from './useApiUtils';
export type { ApiError, ApiResponse } from './useApiUtils';

// API configuration
export { API_ENDPOINTS, HTTP_METHODS, HTTP_STATUS, ERROR_MESSAGES, getAuthHeaders, getBasicHeaders } from './apiConfig';
