import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import api from '../../lib/axios.js';

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [toastMsg, setToastMsg] = useState('');
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();
    const acRef = useRef(null);

    async function refreshAccessToken(refreshToken) {
        try {
            const response = await api.post('/users/login', {
                refreshToken: refreshToken,
            });
            return response.data;
        } catch (error) {
            console.error("Failed to refresh access token", error);
            throw error;
        }
    }

    // If already logged in
    useEffect(() => {
        const already = localStorage.getItem('userId');
        if (already) {
            void preloadCart(already);
        }
    }, []);

    const preloadCart = async (userId) => {
        try {
            const res = await fetch(`/api/carts/${encodeURIComponent(userId)}`);
            if (!res.ok) return;
            const data = await res.json();
            const productIds =
                (Array.isArray(data?.productIds) && data.productIds) ||
                (Array.isArray(data?.productId) && data.productId) ||
                [];
            setCartItems(productIds);
        } catch (err) {
            console.warn('preloadCart failed', err);
        }
    };

    const extractUserId = (data) =>
        data?.userId || data?.id || data?._id || data?.user?.id || data?.user?._id || null;

    const handleLogin = async (e) => {
        e.preventDefault();
        setToastMsg('');
        setLoading(true);

        try {
            const res = await api.post('/auth/login', { email, password });
            const data = res?.data ?? {};

            const userId = extractUserId(data);
            const userEmail = data?.email || email;
            const token = data?.token || data?.accessToken || null;

            if (!userId) {
                setToastMsg('Login response missing user id.');
                return;
            }

            localStorage.setItem('userId', userId);
            localStorage.setItem('userEmail', userEmail);
            // Change this
            if (token) localStorage.setItem('authToken', token);

            await preloadCart(userId);

            navigate('/', { replace: true });
        } catch (err) {
            const status = err?.response?.status;
            const serverMsg = err?.response?.data?.message || err?.response?.data?.error;
            if (status === 404) setToastMsg(serverMsg || 'No account with that email');
            else if (status === 401) setToastMsg(serverMsg || 'Incorrect password');
            else setToastMsg(serverMsg || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar cartItems={cartItems} />

            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center py-16">
                    <form onSubmit={handleLogin} className="space-y-6 w-full max-w-sm">
                        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
                            {/* Email */}
                            <label htmlFor="email" className="label">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input w-full"
                                placeholder="you@example.com"
                                required
                                autoComplete="email"
                            />

                            {/* Password */}
                            <label htmlFor="password" className="label">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input w-full"
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                            />

                            {!!toastMsg && (
                                <div role="alert" className="alert alert-error mt-3">
                                    <span>{toastMsg}</span>
                                </div>
                            )}

                            {/* Login Button */}
                            <button type="submit" className="btn btn-neutral w-full mt-4" disabled={loading}>
                                {loading ? 'Logging in…' : 'Sign in'}
                            </button>
                        </fieldset>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
