import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Register = ({ onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        userName: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Пароли не совпадают');
            setLoading(false);
            return;
        }
        if (formData.password.length < 6) {
            setError('Пароль должен быть не менее 6 символов');
            setLoading(false);
            return;
        }

        const result = await register({
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            userName: formData.fullName
        });

        if (result.success) {
            setSuccess('Регистрация успешна! Теперь вы можете войти.');
            setTimeout(() => {
                if (onSwitchToLogin) onSwitchToLogin();
            }, 2000);
        } else {
            setError(result.message || 'Ошибка регистрации');
        }
        setLoading(false);
    };

    return (
        <div className="main">
            <div className="background-gradient"></div>
            <div className="app">
            <div className="auth-card">
                <h2>Регистрация</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>ФИО</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            placeholder="Иванов Иван Иванович"
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="example@mail.com"
                        />
                    </div>
                    <div className="form-group">
                        <label>Пароль</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Минимум 6 символов"
                        />
                    </div>
                    <div className="form-group">
                        <label>Подтверждение пароля</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Повторите пароль"
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>
                <p className="auth-link">
                    Уже есть аккаунт?{' '}
                    <button onClick={onSwitchToLogin} className="link-button">
                        Войти
                    </button>
                </p>
            </div>
        </div>
    </div>
    );
};

export default Register;