import React, { useState, useEffect } from 'react';

import '../styles/auth/Auth.css';
import Login from "../component/Login.tsx";
import Register from "../component/Register.tsx";

interface AuthProps {
    onSuccessfulAuth: () => void;
}

const Auth: React.FC<AuthProps> = ({ onSuccessfulAuth }) => {
    const [currentView, setCurrentView] = useState<'login' | 'register'>('login');

    useEffect(() => {
        const authContainer = document.querySelector('.auth-container');
        if (authContainer) {
            authContainer.classList.add('auth-container');
        }
    }, []);

    const showLoginForm = () => {
        setCurrentView('login');
    };

    const showLoginAfterRegistration = () => {
        showLoginForm();
    };

    const showRegisterForm = () => {
        setCurrentView('register');
    };

    const handleSuccessfulAuth = () => {
        onSuccessfulAuth();
    };

    return (
        <div className="auth-container">
            <div className="stack-container">
                {currentView === 'login' ? (
                    <Login
                        onShowRegister={showRegisterForm}
                        onSuccessfulAuth={handleSuccessfulAuth}
                    />
                ) : (
                    <Register
                        onShowLogin={showLoginForm}
                        onShowLoginAfterRegistration={showLoginAfterRegistration}
                    />
                )}
            </div>
        </div>
    );
};

export default Auth;