import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Search, Menu, X, Mail, Phone, User } from 'lucide-react';
import Navbar from "../../components/Navbar.jsx";
import api from "../../lib/axios.js";

const LoginPage = () => {
    // Need to check if user has account already
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [toastMsg, setToastMsg] = useState('');
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();
    // Create nav bar here too

    useEffect(() => {
        const userId = localStorage.getItem("userEmail");
        if (!userId) return;

        if (userId) {
            const fetchCart = async () => {
                try {
                    const res = await fetch(`api/carts/${encodeURIComponent(userId)}`);
                    if (res.ok) {
                        const data = await res.json();
                        setCartItems(data.productId || []);
                    }
                } catch (err) {
                    console.log(err);
                }
            };
            fetchCart();
        }
    }, []);

    const extractUserId = (data) =>
        data?.userId || data?.id || data?._id || data?.user?.id || data?.user?._id || null;

    const handleLogin = async (e) => {
        e.preventDefault();
        setToastMsg("");
        setLoading(true);

        try {
            const res = await api.post("/auth/login", {email, password});
            const data = res?.data?? {};
            const userId = data.userId || data.id || data._id || data.user?.id || data.user?._id;


            const userEmail = data?.email || email;
            localStorage.setItem("userId", userId);
            localStorage.setItem("userEmail", email);
            navigate("/", {replace: true});
        } catch (err) {
            const status = err?.response?.status;
            const serverMsg = err?.response?.data?.message || err?.response?.data?.error;

            if (status === 404) setToastMsg(serverMsg || "No account with that email");
            else if (status === 401) setToastMsg(serverMsg || "Incorrect password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar/>

            {/* Need to add proper id and for attributes for accessibility.*/}
            {/*The id must be unique and depends on your context.*/}
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center py-16">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                            {/* Email */}
                            <label className="label">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                   className="input" placeholder="Email" required />
                            {/* Password */}
                            <label className="label">Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                   className="input" placeholder="Password" required />

                            {!!toastMsg && (
                                <div role="alert" className="alert alert-error mt-3">
                                    <span>{toastMsg}</span>
                                </div>
                            )}

                            {/* Login Button */}
                            <button type="submit" className="btn btn-neutral w-full" disabled={loading}>
                                {loading ? "Logging in..." : "Sign in"}
                            </button>
                        </fieldset>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;