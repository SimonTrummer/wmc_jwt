import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Alert, Link } from '@mui/material';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Import useAuth

const LoginPage: React.FC = () => {
    const { login } = useAuth(); // Access the login function from context
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/dashboard"; // Default route is the dashboard

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const response = await axios.post('http://localhost:4000/login', {
                username,
                password,
            });

            login(response.data.accessToken, response.data.refreshToken);
            console.log('Login successful', response.data);

            navigate(from);
        } catch (error) {
            setErrorMessage('Invalid username or password. Please try again.');
            console.error('Login error:', error);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        try {
            await axios.post('http://localhost:4000/register', {
                username,
                password,
            });

            setSuccessMessage('Registration successful! You can now log in.');
            setIsRegistering(false);
        } catch (error) {
            setErrorMessage('Error registering user. User may already exist.');
            console.error('Registration error:', error);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: '100px',
                }}
            >
                <Typography variant="h4" component="h1" gutterBottom>
                    {isRegistering ? 'Register' : 'Login'}
                </Typography>
                <form onSubmit={isRegistering ? handleRegister : handleLogin} style={{ width: '100%' }}>
                    <Box mb={2}>
                        <TextField
                            label="Username"
                            variant="outlined"
                            fullWidth
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </Box>
                    <Box mb={2}>
                        <TextField
                            label="Password"
                            type="password"
                            variant="outlined"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Box>
                    {errorMessage && (
                        <Box mb={2}>
                            <Alert severity="error">{errorMessage}</Alert>
                        </Box>
                    )}
                    {successMessage && (
                        <Box mb={2}>
                            <Alert severity="success">{successMessage}</Alert>
                        </Box>
                    )}
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        {isRegistering ? 'Register' : 'Login'}
                    </Button>
                </form>
                <Box mt={2}>
                    {isRegistering ? (
                        <Typography variant="body2">
                            Already have an account?{' '}
                            <Link href="#" onClick={() => setIsRegistering(false)}>
                                Login here
                            </Link>
                        </Typography>
                    ) : (
                        <Typography variant="body2">
                            Don't have an account?{' '}
                            <Link href="#" onClick={() => setIsRegistering(true)}>
                                Register here
                            </Link>
                        </Typography>
                    )}
                </Box>
            </Box>
        </Container>
    );
};

export default LoginPage;
