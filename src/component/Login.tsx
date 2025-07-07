import React, { useState } from 'react';
import type { IAuthService } from "../services/auth/IAuthService.ts";
import { AuthService } from "../services/auth/AuthService.ts";
import { SessionManager } from "../managers/SessionManager.tsx";
import type { LoginDTO } from "../models/LoginDTO.ts";

interface LoginProps {
    onShowRegister: () => void;
    onSuccessfulAuth: () => void;
}

const Login: React.FC<LoginProps> = ({ onShowRegister, onSuccessfulAuth }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const authService: IAuthService = new AuthService();

    const validateInput = (user: string, pass: string): boolean => {
        if (!user.trim()) {
            showError('Validation Error', 'Username is required');
            return false;
        }
        if (!pass) {
            showError('Validation Error', 'Password is required');
            return false;
        }
        return true;
    };

    const showError = (title: string, content: string) => {
        alert(`${title}: ${content}`);
    };

    const clearForm = () => {
        setUsername('');
        setPassword('');
    };

    const bootWebSocket = (user: string) => {
        console.log(`Booting WebSocket for user: ${user}`);
    };

    const handleSuccessfulLogin = (user: string, token: string) => {
        SessionManager.getInstance().createSession(user, token);
        bootWebSocket(user);
        clearForm();
        onSuccessfulAuth();
    };

    const handleLogin = async () => {
        if (isLoading) {
            return;
        }
        const trimmedUser = username.trim();
        if (!validateInput(trimmedUser, password)) return;

        setIsLoading(true);
        try {
            const loginDto: LoginDTO = { username: trimmedUser, password };
            const token = await authService.login(loginDto);
            if (token) {
                handleSuccessfulLogin(trimmedUser, token);
            } else {
                showError('Login Failed', 'Invalid username or password.');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Error', `An error occurred during login: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleLogin();
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1 className="title-label">Login</h1>
            <input
                type="text"
                className="input-field"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={isLoading}
            />
            <input
                type="password"
                className="input-field"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isLoading}
            />
            <button type="submit" className="primary-button" disabled={isLoading}>
                {isLoading ? 'Logging in…' : 'Login'}
            </button>
            <button type="button" className="link-button" onClick={onShowRegister} disabled={isLoading}>
                Need an account? Register
            </button>
        </form>
    );
};

export default Login;
