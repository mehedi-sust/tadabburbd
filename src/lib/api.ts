import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: any) => api.put('/auth/change-password', data),
};

// Duas API
export const duasAPI = {
  getDuas: (params?: any) => api.get('/duas', { params }),
  getMyDuas: (params?: any) => api.get('/duas/my-duas', { params }),
  getDua: (id: string) => api.get(`/duas/${id}`),
  createDua: (data: any) => api.post('/duas', data),
  updateDua: (id: string, data: any) => api.put(`/duas/${id}`, data),
  deleteDua: (id: string) => api.delete(`/duas/${id}`),
  verifyDua: (id: string) => api.post(`/duas/${id}/verify`),
  getCategories: () => api.get('/duas/categories/list'),
  likeDua: (id: string) => api.post(`/duas/${id}/like`),
  unlikeDua: (id: string) => api.delete(`/duas/${id}/like`),
  getDuaLikeStatus: (id: string) => api.get(`/duas/${id}/likes`),
};

// Blogs API
export const blogsAPI = {
  getBlogs: (params?: any) => api.get('/blogs', { params }),
  getBlog: (id: string) => api.get(`/blogs/${id}`),
  getMyBlogs: (params?: any) => api.get('/blogs/my-blogs', { params }),
  createBlog: (data: any) => api.post('/blogs', data),
  updateBlog: (id: string, data: any) => api.put(`/blogs/${id}`, data),
  deleteBlog: (id: string) => api.delete(`/blogs/${id}`),
  getPopularTags: () => api.get('/blogs/tags/popular'),
};

// Questions API
export const questionsAPI = {
  getQuestions: (params?: any) => api.get('/questions', { params }),
  getQuestion: (id: string) => api.get(`/questions/${id}`),
  getMyQuestions: (params?: any) => api.get('/questions/my-questions', { params }),
  createQuestion: (data: any) => api.post('/questions', data),
  updateQuestion: (id: string, data: any) => api.put(`/questions/${id}`, data),
  deleteQuestion: (id: string) => api.delete(`/questions/${id}`),
  answerQuestion: (id: string, data: any) => api.post(`/questions/${id}/answer`, data),
  verifyAnswer: (answerId: string) => api.post(`/questions/answers/${answerId}/verify`),
  getPopularTags: () => api.get('/questions/tags/popular'),
};

// Users API
export const usersAPI = {
  getUsers: (params?: any) => api.get('/users', { params }),
  getUser: (id: string) => api.get(`/users/${id}`),
  updateUserRole: (id: string, data: any) => api.put(`/users/${id}/role`, data),
  updateUserStatus: (id: string, data: any) => api.put(`/users/${id}/status`, data),
  getUserStats: () => api.get('/users/stats/overview'),
  updatePreferences: (data: any) => api.put('/users/preferences', data),
  getMyCollections: () => api.get('/users/collections/my-collections'),
  createCollection: (data: any) => api.post('/users/collections', data),
  addDuaToCollection: (collectionId: string, duaId: string) => 
    api.post(`/users/collections/${collectionId}/duas/${duaId}`),
};

// AI API
export const aiAPI = {
  getAnalysis: (contentType: string, contentId: string) => 
    api.get(`/ai/analysis/${contentType}/${contentId}`),
  triggerAnalysis: (contentType: string, contentId: string) => 
    api.post(`/ai/analyze/${contentType}/${contentId}`),
  analyzeDraft: (contentType: string, content: any) => 
    api.post('/ai/analyze-draft', { contentType, content }),
  getQueueStatus: () => api.get('/ai/queue/status'),
};

export default api;
