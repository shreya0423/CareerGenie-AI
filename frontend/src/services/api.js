import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// AUTH
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// USER
export const userAPI = {
  getMe: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/profile', data),
};

// QUIZ (Legacy)
export const quizAPI = {
  getQuestions: () => api.get('/quiz/questions'),
  startQuiz: () => api.post('/quiz/start'),
  submitQuiz: (data) => api.post('/quiz/submit', data),
};

// ASSESSMENT (New)
export const assessmentAPI = {
  getQuestions: () => api.get('/assessment/questions'),
  submit: (data) => api.post('/assessment/submit', data),
  result: (data) => api.post('/assessment/result', data),
};

// FIELD ASSESSMENT
export const fieldAssessmentAPI = {
  getFields: () => api.get('/field-assessment/list'),
  getQuestions: (field) => api.get(`/field-assessment/questions/${encodeURIComponent(field)}`),
  submit: (data) => api.post('/field-assessment/submit', data),
};

// CAREER (ML MODEL)
export const careerAPI = {
  predict: (data) => api.post('/careers/predict', data),
  listCareers: () => api.get('/careers/careers'),
  getCareer: (name) => api.get(`/careers/career/${encodeURIComponent(name)}`),
  getRoadmap: (name) => api.get(`/careers/roadmap/${encodeURIComponent(name)}`),
};

// CHAT
export const chatAPI = {
  sendMessage: (data) => api.post('/chatbot/chat', data),
  publicChat: (data) => api.post('/chatbot/chat/public', data),
};

// ADMIN
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
};

// ✅ AI (ONLY ONE — FIXED)
export const aiAPI = {
  recommend: (data) => api.post('/ai/recommend', data),
  chat: (data) => api.post('/ai/chat', data),
  voiceAdvisor: (data) => api.post('/ai/voice', data),
  roadmap: (data) => api.post('/ai/roadmap', data),
};

export const getRoadmap = (career) =>
  api.post("/ai/roadmap", { career });

export default api;