import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (email: string, password: string) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },
};

export const elections = {
  getAll: async () => {
    const response = await api.get('/elections');
    return response.data;
  },
  create: async (data: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    options: { title: string; description: string }[];
  }) => {
    const response = await api.post('/elections', data);
    return response.data;
  },
  updateStatus: async (id: string, status: 'upcoming' | 'active' | 'closed') => {
    const response = await api.patch(`/elections/${id}/status`, { status });
    return response.data;
  },
};

export const votes = {
  cast: async (electionId: string, optionId: string) => {
    const response = await api.post('/votes', { electionId, optionId });
    return response.data;
  },
  getResults: async (electionId: string) => {
    const response = await api.get(`/votes/results/${electionId}`);
    return response.data;
  },
};

export default api;