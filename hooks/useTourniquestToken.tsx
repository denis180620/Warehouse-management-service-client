import { useState, useEffect, useCallback } from 'react';
import { tokenManager } from '../services/ApiTourniquest';

interface UseTourniquetTokenReturn {
    token: string | null;
    loading: boolean;
    error: string | null;
    refreshToken: () => Promise<string | null>;
    clearToken: () => void;
    updateToken: (newToken: string) => void;
    hasToken: boolean;
}

export const useTourniquetToken = (name: string | null | undefined): UseTourniquetTokenReturn => {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const refreshToken = useCallback(async (): Promise<string | null> => {
        if (!name) {
            setToken(null);
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const newToken: string | null = tokenManager.getToken(name);
            setToken(newToken);
            return newToken;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error refreshing token:', err);
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, [name]);

    const clearToken = useCallback((): void => {
        if (name) {
            tokenManager.removeToken(name);
        }
        setToken(null);
    }, [name]);

    const updateToken = useCallback((newToken: string): void => {
        if (newToken && name) {
            tokenManager.setToken(name, newToken);
            setToken(newToken);
        }
    }, [name]);

    useEffect(() => {
        if (name) {
            refreshToken();
        }
    }, [name, refreshToken]);

    return {
        token,
        loading,
        error,
        refreshToken,
        clearToken,
        updateToken,
        hasToken: !!token
    };
};