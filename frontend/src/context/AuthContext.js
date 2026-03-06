import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Ideally fetch full user profile here, but for now trust token/decode
                setUser({ email: decoded.sub });
                // fetchMe() could be called here to get full details like is_admin
                api.get('/auth/me').then(res => {
                    setUser(res.data);
                }).catch(() => {
                    logout();
                })
            } catch (e) {
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        // Clear any leftover session from a previous user
        localStorage.removeItem('agent_session');
        localStorage.removeItem('cart');
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.access_token);
        const decoded = jwtDecode(res.data.access_token);
        setUser({ email: decoded.sub }); // optimistically set
        // Fetch full profile
        const me = await api.get('/auth/me');
        setUser(me.data);
    };

    const register = async (email, password) => {
        await api.post('/auth/register', { email, password });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('agent_session'); // fresh session for next login
        localStorage.removeItem('cart');           // clear cart on logout
        setUser(null);
    };


    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
