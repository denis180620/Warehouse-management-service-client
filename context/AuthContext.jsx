import React, {createContext, useState, useContext, useEffect} from 'react';
import { login, register, logout, getCurrentUser, refreshAccessToken } from '../services/ApiAuth';

const AuthContext = createContext();

export const useAuth = () =>{
    const context = useContext(AuthContext);
    if(!context){
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({children}) =>{
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accessToken, setAccessToken] = useState(null);
    let refreshPromise = null;

    const clearAuth = () =>{
        setAccessToken(null);
        setUser(null);
    }

    const loadCurrentUser = async () =>{
        try{
            await refreshToken(); 
            const response = await getCurrentUser();
            if(response && response.success){
                setUser(response);
            }else{
                clearAuth();
            }
        }catch(error){
            clearAuth();
        }finally{
            setLoading(false);
        }
    }

    const refreshToken = async() =>{
        if(refreshPromise){
            return refreshPromise;
        }
        refreshPromise = (async () =>{
            try{
                const response = await refreshAccessToken();
                if(response && response.success && response.accessToken){
                    setAccessToken(response.accessToken);
                    return response.accessToken;
                }
                throw new Error('Ошбика загрузки');
            }catch(error){
                clearAuth();
                throw error;
            }finally{
                refreshPromise = null;
            }
        })();
        return refreshPromise;
    };

    useEffect(() =>{
        loadCurrentUser();
    }, []);

    const handleLogin = async (email, password) =>{
        try{
            const response = await login ({ email, password});
            if(response.success){
                if(response.accessToken){
                    setAccessToken(response.accessToken);
                }
                const userData = {
                    fullName: response.fullName || response.fullName || email
                };
                setUser(userData);
                return{success: true, user: userData};
            }
            return {success: false, message: response.message};
        }catch(error){
            return {success: false, message: error.message || 'Ошибка входа'};
        }
    };
    const handleRegister = async (userData) => {
        try {
            const response = await register(userData);
            if (response.success) {
                return { success: true, message: response.message };
            }
            return { success: false, message: response.message };
        } catch (error) {
            return { success: false, message: error.message || 'Ошибка регистрации' };
        }
    };

    const handleLogout = async () =>{
        try{
            await logout();
        }catch(error){
            console.error('Logout error', error);
        }finally{
            clearAuth();
        }
    };
    const getAccessToken = async() =>{
        if(accessToken){
            return accessToken;
        }
        return await refreshToken();
    };
    
    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        accessToken,
        getAccessToken,
        refreshToken
    };
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};