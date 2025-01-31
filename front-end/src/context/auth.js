import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

// Create a context for authentication
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchUser = async (token) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/me`, {
                headers: {
                    Authorization: `Bearer ${token}` // Bearer token added here
                }
            });
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch user:', error);
            setUser(null);
        }
    };

    const login = async (username, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
                username,
                password
            });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                await fetchUser(response.data.token);
            }

            return response;

        } catch (err) {
            setError('Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, error, loading, fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};
