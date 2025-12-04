import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import api from '../../lib/axios.js';
import toast from 'react-hot-toast'

const SignUpPage = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [toastMsg, setToastMsg] = useState('');
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();
    const acRef = useRef(null);

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

    const handleSignup = async(e) => {
        e.preventDefault();
        setToastMsg('');
        setLoading(true);

        try {
            const res = await api.post('/auth/signup', { firstName, lastName, email, password }, {withCredentials: true});
            const data = res?.data ?? {};

            const userId = extractUserId(data);
            const userEmail = data?.email || email;
            setFirstName(firstName);
            setLastName(lastName);

            if (!userId) {
                setToastMsg("Login response missing user id.");
                return;
            }

            localStorage.setItem("userId", userId);
            localStorage.setItem("userEmail", userEmail);

            await preloadCart(userId);

            navigate('/', { replace: true });
            toast.success('Signup successfully!');

        } catch (err) {
            const status = err?.response?.status;
            const serverMsg = err?.response?.data?.message || err?.response?.data?.error;
            if (status === 403) setToastMsg(serverMsg || 'There is already an account associated with that email');
            else if (status === 401) setToastMsg(serverMsg || 'Invalid password');
            else setToastMsg(serverMsg || 'Sign up failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar cartItems={cartItems} />

            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center py-16">
                    <form onSubmit={handleSignup} className="space-y-6 w-full max-w-sm">
                        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
                            {/* Email */}
                            <label htmlFor="name" className="label">First Name</label>
                            <input
                                id="firstName"
                                type="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="input w-full"
                                placeholder="First Name"
                                required
                                autoComplete="firstName"
                            />
                            <label htmlFor="name" className="label">Last Name</label>
                            <input
                                id="lastName"
                                type="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="input w-full"
                                placeholder="Last Name"
                                required
                                autoComplete="lastName"
                            />
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

                            {/* Signup Button */}
                            <button type="submit" className="btn btn-neutral w-full mt-4" disabled={loading}>
                                {loading ? 'Logging in…' : 'Sign up'}
                            </button>
                        </fieldset>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;
