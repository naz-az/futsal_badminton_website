import axios from 'axios';

// Update the baseURL to use a relative path
const api = axios.create({
    baseURL: '/api/',
    // timeout: 1000,
});

api.interceptors.request.use(function (config) {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});

export default api;
