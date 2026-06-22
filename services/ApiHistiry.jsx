import axios from 'axios';
import { getAuthToken, refreshAccessToken } from "../services/ApiAuth";

const API_Base_URL = "https://localhost:7184/api/History";

const api = axios.create({
    baseURL: API_Base_URL,
    headers: {
        'Content-Type': "application/json",
    },
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
},
    (error) => {
        return Promise.reject(error);
    });

api.interceptors.response.use((response) => {
    return response;
},
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const response = await refreshAccessToken();
                if (response && response.success && response.accessToken) {
                    originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
                }
                return api(originalRequest);
                throw new Error('Refresh failed');
            }
            catch (refreshError) {
                window.location.href = "/login";
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    });

export const Historyget = async(from = null, to = null, cursor = null, limit = 50) => {
    try {
        const params = {};

        if (from) {
            params.from = from.toISOString();
        }
        if (to) {
            params.to = to.toISOString();
        }
        if (cursor) {
            params.cursor = cursor;
        }
        if (limit) {
            params.limit = limit;
        }

        const response = await api.get('historys', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const DeleteHistory = async (id) =>{
    try{
        var response = await api.delete(`/delete-history/${id}`);
        if(response.success){
            return response.data;
        }
    }catch(err){
        throw err.response.data || err.message;
    }
};