/**
 * author: simon
 * date: 18.10.2024
 * project: JWT-AUTH
 * package_name:
 **/
import React, {createContext, useContext, useEffect, useState} from 'react';
import Cookies from 'js-cookie';

interface AuthContextType {
    accessToken: string | null;
    refreshToken: string | null;
    username: string | null;
    login: (accessToken: string, refreshToken: string, username: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [accessToken, setAccessToken] = useState<string | null>(Cookies.get('accessToken') || null);
    const [refreshToken, setRefreshToken] = useState<string | null>(Cookies.get('refreshToken') || null);
    const [username, setUsername] = useState<string | null>(Cookies.get('username') || null);

    useEffect(() => {
        const savedAccessToken = Cookies.get('accessToken');
        const savedRefreshToken = Cookies.get('refreshToken');
        const savedUsername = Cookies.get('username');

        if (savedAccessToken) setAccessToken(savedAccessToken);
        if (savedRefreshToken) setRefreshToken(savedRefreshToken);
        if (savedUsername) setUsername(savedUsername);
    }, []);

    const login = (access: string, refresh: string, username: string) => {
        setAccessToken(access);
        setRefreshToken(refresh);
        setUsername(username);
        Cookies.set('accessToken', access, { expires: 1 }); // Expires in 1 day
        Cookies.set('refreshToken', refresh, { expires: 7 }); // Expires in 7 days
        Cookies.set('username', username, { expires: 7 }); // Expires in 7 days
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        localStorage.setItem('username', username);

    };

    const logout = () => {
        setAccessToken(null);
        setRefreshToken(null);
        setUsername(null);
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('username');
    };

    return (
        <AuthContext.Provider value={{ accessToken, refreshToken, username, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
