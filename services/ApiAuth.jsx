import axios from 'axios';

let authToken = null;

export const setAuthToken = (token) => {
    authToken = token;
};

export const getAuthToken = () => authToken;

const API_BASE_URL = 'https://localhost:7184/api';

// Создание axios инстанса с интерсептором для токенов
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Интерсептор для добавления токена к запросам
api.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }
);

// Интерсептор для обработки 401 ошибок
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;


        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/Auth/refresh')) {
            originalRequest._retry = true;
            try {
                const response = await api.post('/Auth/refresh');
                if (response.data?.success && response.data?.accessToken) {
                    authToken = response.data.accessToken;
                    originalRequest.headers.Authorization = `Bearer ${authToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                authToken = null;
                if (window.location.pathname !== '/login') {
                    window.location.replace('/login');
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);
// ===== Авторизация =====

export const login = async (data) => {
    const response = await api.post("/Auth/login", data);
    if (response.data?.success && response.data?.accessToken) {
        authToken = response.data.accessToken;
    }
    return response.data;
}

export const logout = async () => {
    try {
        await api.post('/Auth/logout');
    } finally {
        authToken = null;
    }
};

export const refreshAccessToken = async () => {
    const response = await api.post('/Auth/refresh', {}, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.data?.success && response.data?.accessToken) {
        authToken = response.data.accessToken;
    }
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await api.get('/Auth/me');
    return response.data;
};

export const register = async (userData) => {
    try {
        const response = await api.post('/Auth/register', userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}

export default api;