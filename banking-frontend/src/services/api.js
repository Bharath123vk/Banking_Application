import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

// Add a request interceptor to attach Basic Auth credentials
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Basic ${token}`;
    }
    return config;
});

export default api;
