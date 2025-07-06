import { useState } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import './styles/styles.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    const handleSuccessfulAuth = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
    };

    if (!isAuthenticated) {
        return (
            <div className="app">
                <Routes>
                    <Route
                        path="*"
                        element={<Auth onSuccessfulAuth={handleSuccessfulAuth} />}
                    />
                </Routes>
            </div>
        );
    }

    return (
        <div className="app">
            <nav className="navbar">
                <ul>
                    <li><Link to="/">Accueil</Link></li>
                    <li>
                        <button onClick={handleLogout} className="logout-btn">
                            Déconnexion
                        </button>
                    </li>
                </ul>
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}

export default App;