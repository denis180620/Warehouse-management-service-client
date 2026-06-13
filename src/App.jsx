import React, { useState } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import Login from '../checkcomponent/Login';
import Register from '../checkcomponent/Register';
import MainApp from '../src/MainApp';
import "./App.css";

const AppContent = () => {
    const { isAuthenticated, loading } = useAuth();
    const [showRegister, setShowRegister] = useState(false);

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loader">Загрузка...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        if (showRegister) {
            return (
                <Register
                    onRegisterSuccess={() => setShowRegister(false)}
                    onSwitchToLogin={() => setShowRegister(false)}
                />
            );
        }
        return (
            <Login
                onLoginSuccess={() => { }}
                onSwitchToRegister={() => setShowRegister(true)}
            />
        );
    }

    return <MainApp />;
};

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;