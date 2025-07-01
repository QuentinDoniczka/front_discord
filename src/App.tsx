import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';

function App() {
    return (
        <div className="app">
            <nav className="navbar">
                <ul>
                    <li><Link to="/">Accueil</Link></li>
                    <li><Link to="/auth">Authentification</Link></li>
                </ul>
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
            </Routes>
        </div>
    );
}

export default App;