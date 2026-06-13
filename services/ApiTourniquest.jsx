import axios from 'axios';
import axiosRetry from 'axios-retry';
import { getAuthToken, refreshAccessToken } from "../services/ApiAuth";

const API_Base_URL = "https://localhost:7184/api/Tourniquest";

class TokenManager {
    constructor() {
        this.storageKey = 'tourniquest_tokens';
        this.tokenTTL = 24 * 60 * 60 * 1000; // 24 часа
    }

    getToken(name) {
        try {
            const tokens = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
            const tokenData = tokens[name];

            if (!tokenData) return null;

            if (typeof tokenData === 'object' && tokenData.token && tokenData.timestamp) {
                const isExpired = Date.now() - tokenData.timestamp > this.tokenTTL;
                if (isExpired) {
                    this.removeToken(name);
                    return null;
                }
                return tokenData.token;
            }

            return tokenData;
        } catch {
            return null;
        }
    }

    setToken(name, token) {
        if (!token) return;

        try {
            const tokens = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
            tokens[name] = {
                token: token,
                timestamp: Date.now()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(tokens));
        } catch (error) {
            console.error('Failed to save token:', error);
        }
    }

    removeToken(name) {
        try {
            const tokens = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
            delete tokens[name];
            localStorage.setItem(this.storageKey, JSON.stringify(tokens));
        } catch (error) {
            console.error('Failed to remove token:', error);
        }
    }

    clearAll() {
        localStorage.removeItem(this.storageKey);
    }

    getAllTokens() {
        try {
            const tokens = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
            const result = {};
            for (const [name, data] of Object.entries(tokens)) {
                if (typeof data === 'object' && data.token) {
                    result[name] = data.token;
                } else {
                    result[name] = data;
                }
            }
            return result;
        } catch {
            return {};
        }
    }
}

const tokenManager = new TokenManager();

const api = axios.create({
    baseURL: API_Base_URL,
    timeout: 30000,
    headers: {
        'Content-Type': "application/json",
    },
});

// ============= ИСПРАВЛЕННЫЙ REQUEST INTERCEPTOR =============
api.interceptors.request.use((config) => {
    // ✅ Исправлено: правильное получение токена авторизации
    const authToken = getAuthToken();  // ← используем единую функцию
    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }

    let tourniquestName = null;

    if (config.url.includes('/by-name')) {
        const match = config.url.match(/\/by-name\/(.+)$/);
        if (match) {
            tourniquestName = decodeURIComponent(match[1]);
        }
    }

    if (config.data && (config.url.includes('/add-to-stock') ||
        config.url.includes('/remove-from-stock') ||
        config.url.includes('/update-wires'))) {
        try {
            const data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
            tourniquestName = data.name;
        } catch (e) { }
    }

    if (tourniquestName) {
        const token = tokenManager.getToken(tourniquestName);
        if (token) {
            config.headers['X-Session-Token'] = token;
            console.log(`Adding token for ${tourniquestName}: ${token.substring(0, 8)}...`);
        }
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// ============= ИСПРАВЛЕННЫЙ RESPONSE INTERCEPTOR =============
api.interceptors.response.use((response) => {
    const token = response.headers['x-session-token'];
    if (token) {
        let tourniquestName = null;

        if (response.data?.data?.name) {
            tourniquestName = response.data.data.name;
        } else if (response.config.url?.includes('/by-name/')) {
            const match = response.config.url.match(/\/by-name\/(.+)$/);
            if (match) {
                tourniquestName = decodeURIComponent(match[1]);
            }
        }

        if (tourniquestName) {
            tokenManager.setToken(tourniquestName, token);
            console.log(`Token updated for ${tourniquestName}`);
        }
    }

    if (response.data?.newVersion && response.data?.data?.name) {
        tokenManager.setToken(response.data.data.name, response.data.newVersion);
    }

    if (response.data?.warning) {
        console.warn(response.data.warning);
    }

    return response;
}, async (error) => {
    const originalRequest = error.config;

    // ============= ИСПРАВЛЕННАЯ ОБРАБОТКА 401 =============
    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        console.log('[Auth] Token expired, attempting refresh...');

        try {
            // ✅ Используем единую функцию обновления токена
            const response = await refreshAccessToken();

            if (response && response.success && response.accessToken) {
                console.log('[Auth] Token refreshed successfully');
                // Токены уже сохранены в refreshAccessToken()

                // Повторяем оригинальный запрос с новым токеном
                originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
                return api(originalRequest);
            }

            throw new Error('Refresh failed');
        } catch (refreshError) {
            console.error('[Auth] Refresh token failed:', refreshError);
            // Перенаправляем на логин
            window.location.href = '/login';
            return Promise.reject(error);
        }
    }

    // Обработка конфликта версий
    if (error.response?.status === 409 && error.response?.data?.code === 'CONCURRENCY_CONFLICT') {
        console.warn('Concurrency conflict detected, refreshing data...');

        let tourniquestName = null;
        if (error.config.data) {
            try {
                const data = typeof error.config.data === 'string' ? JSON.parse(error.config.data) : error.config.data;
                tourniquestName = data.name;
            } catch (e) { }
        }

        if (tourniquestName) {
            try {
                const freshResponse = await api.get(`/by-name/${encodeURIComponent(tourniquestName)}`);
                if (freshResponse.data?.success) {
                    const newToken = tokenManager.getToken(tourniquestName);
                    if (newToken) {
                        error.config.headers['X-Session-Token'] = newToken;
                        if (error.config.data) {
                            const data = JSON.parse(error.config.data);
                            data.expectedVersion = newToken;
                            error.config.data = JSON.stringify(data);
                        }
                        return api.request(error.config);
                    }
                }
            } catch (refreshError) {
                console.error('Failed to refresh token:', refreshError);
            }
        }
    }

    if (error.response?.status === 504) {
        console.warn('Request timeout');
    }

    return Promise.reject(error);
});

// Retry configuration
axiosRetry(api, {
    retries: 3,
    retryDelay: (retryCount) => {
        const exponentialDelay = Math.pow(2, retryCount - 1) * 1000;
        const jitter = exponentialDelay * 0.2 * Math.random();
        return exponentialDelay + jitter;
    },
    retryCondition: (error) => {
        return (
            axiosRetry.isNetworkError(error) ||
            axiosRetry.isRetryableError(error) ||
            error.response?.status === 429 ||
            error.response?.status === 503 ||
            error.response?.status === 504
        );
    },
    onRetry: (retryCount, error, requestConfig) => {
        console.log(`Retry attempt ${retryCount} for ${requestConfig.url}`);
    },
    shouldResetTimeout: true
});

// ============= API EXPORTS =============

export const checkTourniquest = async (name) => {
    try {
        const response = await api.get(`/by-name/${encodeURIComponent(name)}`);

        // ✅ Сохраняем токен из заголовка
        const tokenFromHeader = response.headers['x-session-token'];
        if (tokenFromHeader && tokenFromHeader !== '00000000-0000-0000-0000-000000000000') {
            tokenManager.setToken(name, tokenFromHeader);
            console.log(`Token saved from header for ${name}: ${tokenFromHeader}`);
        }

        // ✅ Также проверяем токен в теле ответа
        const tokenFromBody = response.data?.data?.data?.version;
        if (tokenFromBody && tokenFromBody !== '00000000-0000-0000-0000-000000000000') {
            tokenManager.setToken(name, tokenFromBody);
            console.log(`Token saved from body for ${name}: ${tokenFromBody}`);
        }

        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const checkTourniquestQuantity = async (num, cursor = null) => {
    try {
        let url = `/byget-quantity/${num}`;
        
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const createTourniquest = async (data) => {
    try {
        const requestData = {
            name: data.name,
            quantity: data.quantity,
            cell: data.cell
        };
        const response = await api.post('/create', requestData);

        if (response.data?.sessionToken && response.data?.data?.name) {
            tokenManager.setToken(response.data.data.name, response.data.sessionToken);
        }

        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const addToTourniquest = async (data) => {
    try {
        const currentToken = tokenManager.getToken(data.name);
        if (!currentToken) {
            try {
                const freshData = await checkTourniquest(data.name);
                if (freshData?.success && freshData?.data?.version) {
                    currentToken = freshData.data.data.version;
                    tokenManager.setToken(data.name, currentToken);
                }
                else {
                    throw new Error('Unable to get session token for tourniquest');
                }
            }
            catch (err) {
                throw new Error(`Cannot obtain token: ${err.message}`);
            }
        }
        const requestData = {
            name: data.name,
            quantity: data.quantity,
            expectedVersion: currentToken || data.expectedVersion
        };

        const response = await api.put('/add-to-stock', requestData);

        if (response.data?.newVersion && response.data?.data?.name) {
            tokenManager.setToken(response.data.data.name, response.data.newVersion);
        }

        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const removeToTourniquest = async (data) => {
    try {
        const currentToken = tokenManager.getToken(data.name);
        if (!currentToken) {
            try {
                const freshData = await checkTourniquest(data.name);
                console.log(freshData);
                if (freshData?.success && freshData?.data?.version) {
                    currentToken = freshData.data.data.version;
                    tokenManager.setToken(data.name, currentToken);
                }
                else {
                    throw new Error('Unable to get session token for tourniquest');
                }
            }
            catch (err) {
                throw new Error(`Cannot obtain token: ${err.message}`);
            }
        }
        const requestData = {
            name: data.name,
            quantity: data.quantity,
            expectedVersion: currentToken || data.expectedVersion
        };

        const response = await api.put('/remove-from-stock', requestData);

        if (response.data?.newVersion && response.data?.data?.name) {
            tokenManager.setToken(response.data.data.name, response.data.newVersion);
        }

        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteTourniquest = async (name) => {
    try {
        const response = await api.delete(`/delete/${encodeURIComponent(name)}`);

        if (response.data?.success) {
            tokenManager.removeToken(name);
        }

        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const addWires = async (data) => {
    try {
        const currentToken = tokenManager.getToken(data.name);
        if (!currentToken) {
            try {
                const freshData = await checkTourniquest(data.name);
                if (freshData?.success && freshData?.data?.version) {
                    currentToken = freshData.data.data.version;
                    tokenManager.setToken(data.name, currentToken);
                }
                else {
                    throw new Error('Unable to get session token for tourniquest');
                }
            }
            catch (err) {
                throw new Error(`Cannot obtain token: ${err.message}`);
            }
        }
        const requestData = {
            name: data.name,
            quantity: data.quantity,
            expectedVersion: currentToken
        };

        const response = await api.put("/update-wires", requestData);

        if (response.data?.newVersion && response.data?.data?.name) {
            tokenManager.setToken(response.data.data.name, response.data.newVersion);
        }

        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const refreshTourniquestToken = async (name) => {
    try {
        const response = await api.get(`/by-name/${encodeURIComponent(name)}`);
        if (response.data?.success && response.data?.data?.version) {
            tokenManager.setToken(name, response.data.data.version);
            return response.data.data.version;
        }
        return null;
    } catch (error) {
        console.error('Failed to refresh token:', error);
        throw error;
    }
};

export const getTourniquests = async (cursor = null, limit = 20, sortBy = 'createAt', sortOrder = 'desc') => {
    try {
        let url = `/list?limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
        if (cursor) {
            url += `&cursor=${encodeURIComponent(cursor)}`;
        }
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getHistory = async (from = null, to = null, cursor = null, limit = 50) => {
    try {
        let url = `/history?limit=${limit}`;
        if (from) {
            url += `&from=${from.toISOString()}`;
        }
        if (to) {
            url += `&to=${to.toISOString()}`;
        }
        if (cursor) {
            url += `&cursor=${encodeURIComponent(cursor)}`;
        }
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export { tokenManager };