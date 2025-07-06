import React, { useState, useRef, useEffect } from 'react';

import type {IAuthService} from "../services/auth/IAuthService.ts";
import {AuthService} from "../services/auth/AuthService.ts";
import {SessionManager} from "../managers/SessionManager.tsx";
import type {LoginDTO} from "../models/LoginDTO.ts";

interface LoginProps {
    onShowRegister: () => void;
    onSuccessfulAuth: () => void;
}

const Login: React.FC<LoginProps> = ({ onShowRegister, onSuccessfulAuth }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const formRef = useRef<HTMLDivElement>(null);

    const authService: IAuthService = new AuthService();

    useEffect(() => {
        const cleanup = setupEnterKeyListeners();
        return cleanup;
    }, []);

    const setupEnterKeyListeners = () => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                handleLogin();
                event.preventDefault();
            }
        };

        if (formRef.current) {
            const inputs = formRef.current.querySelectorAll('input');
            inputs.forEach(input => {
                input.addEventListener('keypress', handleKeyPress);
            });

            return () => {
                inputs.forEach(input => {
                    input.removeEventListener('keypress', handleKeyPress);
                });
            };
        }

        return () => {};
    };

    const bootWebSocket = (username: string) => {
        console.log(`Booting WebSocket for user: ${username}`);
    };

    const handleLogin = async () => {
        if (isLoading) {
            return;
        }

        const trimmedUsername = username.trim();

        if (validateInput(trimmedUsername, password)) {
            setIsLoading(true);

            try {
                const loginDto: LoginDTO = {
                    username: trimmedUsername,
                    password: password
                };

                const token = await authService.login(loginDto);

                if (token) {
                    handleSuccessfulLogin(trimmedUsername, token);
                } else {
                    showError('Login Failed', 'Invalid username or password.');
                }
            } catch (error) {
                console.error('Login error:', error);
                showError('Error', `An error occurred during login: ${error}`);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const validateInput = (username: string, password: string): boolean => {
        if (!username || username.trim().length === 0) {
            showError('Validation Error', 'Username is required');
            return false;
        }

        if (!password || password.length === 0) {
            showError('Validation Error', 'Password is required');
            return false;
        }

        return true;
    };

    const handleSuccessfulLogin = (username: string, token: string) => {
        SessionManager.getInstance().createSession(username, token);
        bootWebSocket(username);
        clearForm();
        onSuccessfulAuth();
    };

    const showError = (title: string, content: string) => {
        alert(`${title}: ${content}`);
    };

    const clearForm = () => {
        setUsername('');
        setPassword('');
    };

    return (
        <div ref={formRef} className="form-container">
            <h1 className="title-label">Login</h1>
            <input
                type="text"
                className="input-field"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
            />
            <input
                type="password"
                className="input-field"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
            />
            <button
                className="primary-button"
                onClick={handleLogin}
                disabled={isLoading}
            >
                {isLoading ? 'Logging in...' : 'Login'}
            </button>
            <button
                className="link-button"
                onClick={onShowRegister}
                disabled={isLoading}
            >
                Need an account? Register
            </button>
        </div>
    );
};

export default Login;