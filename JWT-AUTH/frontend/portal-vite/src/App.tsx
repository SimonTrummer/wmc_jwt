import './App.css'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import LoginPage from "./view/LoginPage.tsx";
import Dashboard from "./view/Dashboard.tsx"; // Import Dashboard
import { AuthProvider, useAuth } from './AuthContext';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                </Routes>
            </Router>
        </AuthProvider>
    )
}

// Protected route to check for authentication
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { accessToken } = useAuth();
    const location = useLocation();

    return accessToken ? (
        children
    ) : (
        <Navigate to="/" state={{ from: location }} />
    );
}

export default App;
