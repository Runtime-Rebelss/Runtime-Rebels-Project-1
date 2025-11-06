import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Search, Menu, X, Mail, Phone, User } from 'lucide-react';
import Navbar from "../../components/Navbar.jsx";

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

    const handleLogin = async (e) => {
        e.preventDefault();
        setToastMsg("");
        setLoading(true);
        try {
            const res = await fetch("/auth/login", {email, password});
            console.log(res.data);

            if (!res.ok) {
                let msg = "Login Failed";
                try {
                    const data = await res.json()
                    msg = data?.message || data?.error || msg;
                } catch {}
                if (res.status === 404) msg = "No account with that email.";
                if (res.status === 401) msg = "Incorrect password.";
            }

            localStorage.setItem("userEmail", email);
            navigate("/", {replace: true});
        } catch (err) {
            setToastMsg('Bad credentials');
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
                            {/* Login Button */}
                            <button type="submit" className="btn btn-neutral w-full" disabled={loading}>
                                {loading ? "Logging in..." : "Sign in"}
                            </button>
                        </fieldset>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default LoginPage;