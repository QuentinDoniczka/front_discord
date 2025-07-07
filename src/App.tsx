import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import './styles/styles.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleSuccessfulAuth = () => setIsAuthenticated(true);
    const handleLogout        = () => setIsAuthenticated(false);   // ← retour à Auth

    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="*" element={<Auth onSuccessfulAuth={handleSuccessfulAuth} />} />
            </Routes>
        );
    }

    return (
        <Routes>
            <Route path="/" element={<Home onLogout={handleLogout} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
