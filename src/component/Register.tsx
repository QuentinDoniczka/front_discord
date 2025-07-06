import React, { useState, useRef, useEffect } from 'react';
import type { RegisterDTO } from '../models/RegisterDTO';
import type {IAuthService} from "../services/auth/IAuthService.ts";
import {AuthService} from "../services/auth/AuthService.ts";

interface RegisterProps {
    onShowLogin: () => void;
    onShowLoginAfterRegistration: () => void;
}

const Register: React.FC<RegisterProps> = ({ onShowLogin, onShowLoginAfterRegistration }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const formRef = useRef<HTMLDivElement>(null);

    // Instance du service d'authentification
    const authService: IAuthService = new AuthService();

    useEffect(() => {
        const cleanup = setupEnterKeyListeners();
        return cleanup;
    }, []);

    const setupEnterKeyListeners = () => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                handleRegistration();
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

    const handleRegistration = async () => {
        if (isLoading) {
            return;
        }

        const trimmedUsername = username.trim();
        const trimmedEmail = email.trim();

        if (validateInput(trimmedUsername, trimmedEmail, password, confirmPassword)) {
            setIsLoading(true);

            try {
                const registerDto: RegisterDTO = {
                    username: trimmedUsername,
                    email: trimmedEmail,
                    password: password
                };

                const success = await authService.register(registerDto);

                if (success) {
                    handleSuccessfulRegistration();
                } else {
                    showError('Registration Failed', 'Please verify your information and try again.');
                }
            } catch (error) {
                console.error('Registration error:', error);
                showError('Error', `An error occurred during registration: ${error}`);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const validateInput = (username: string, email: string, password: string, confirmPassword: string): boolean => {
        if (!username || username.trim().length === 0) {
            showError('Validation Error', 'Username is required');
            return false;
        }

        if (!email || !email.match(/^[A-Za-z0-9+_.-]+@(.+)$/)) {
            showError('Validation Error', 'Invalid email address');
            return false;
        }

        if (!password || password.length < 6) {
            showError('Validation Error', 'Password must be at least 6 characters long');
            return false;
        }

        if (password !== confirmPassword) {
            showError('Validation Error', 'Passwords do not match');
            return false;
        }

        return true;
    };

    const handleSuccessfulRegistration = () => {
        showSuccess('Registration Successful', 'Your account has been created successfully! Please login with your credentials.');
        clearForm();
        onShowLoginAfterRegistration();
    };

    const showError = (title: string, content: string) => {
        alert(`${title}: ${content}`);
    };

    const showSuccess = (title: string, content: string) => {
        alert(`${title}: ${content}`);
    };

    const clearForm = () => {
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div ref={formRef} className="form-container">
            <h1 className="title-label">Register</h1>
            <input
                type="text"
                className="input-field"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
            />
            <input
                type="email"
                className="input-field"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            <input
                type="password"
                className="input-field"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
            />
            <button
                className="primary-button"
                onClick={handleRegistration}
                disabled={isLoading}
            >
                {isLoading ? 'Registering...' : 'Register'}
            </button>
            <button
                className="link-button"
                onClick={onShowLogin}
                disabled={isLoading}
            >
                Already have an account? Login
            </button>
        </div>
    );
};

export default Register;