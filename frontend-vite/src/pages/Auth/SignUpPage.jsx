import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Search, Menu, X, Mail, Phone, User } from 'lucide-react';
import Navbar from "../../components/Navbar.jsx";
import api from "../../lib/axios.js";

const SignUpPage = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [isUser, setIsUser] = useState(false);
    const [isSuccessful, setIsSuccessful] = useState(false);
    const [toastMsg, setToastMsg] = useState('');

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passOk = password.length >= 6;

    const handleSignup = async (e) => {
        e.preventDefault();

        // Need to add thing for email / pass valid
        // Need to check if user adds .com, etc.

        if (!emailOk) {
            return setToastMsg('Please enter a valid email');
        }

        if (!passOk) {
            return setToastMsg('Please enter 6 characters for the password');
        }

        setToastMsg("");
        setLoading(true);
        setIsSuccessful(false);

        try {
            const res = await api.post("/auth/signup", { email, password });
            const data = res?.data || {};

            const userId = data.id || data.userId || data._id;
            const userRole = data.role;

            if (!userId) {
                setToastMsg("Signup succeeded but server did not return a user id.");
                setIsSuccessful(false);
                return;
            }

            const userEmail = data.email || data.user?.email || email;

            // Persist same keys as LoginPage expects
            localStorage.setItem("userId", userId);
            localStorage.setItem("userEmail", userEmail || email);
            if (userRole) localStorage.setItem("userRole", userRole);

            const token = data.token || data.accessToken || data.authToken;
            if (token) {
                localStorage.setItem('authToken', token);
                localStorage.setItem('token', token);
            }

            setToastMsg(data.message || "Account created successfully!!");
            setIsSuccessful(true);
            setEmail("");
            setPassword("");

            window.dispatchEvent(new Event("cart-updated"));

            navigate("/", { replace: true });
        } catch (error) {
            const status = error?.response?.status;
            const serverMsg = error?.response?.data?.message || error?.response?.data?.error;
            if (status) {
                setToastMsg(serverMsg || `Sign up failed (${status})`);
            } else {
                setToastMsg(error?.message || 'Sign up failed. Please check your network and try again.');
            }
            setIsSuccessful(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar/>

            {toastMsg && (
                <div
                    className={`alert mb-4 ${
                        isSuccessful ? "alert-success" : "alert-error"
                    }`}
                >
                    <span>{toastMsg}</span>
                </div>
            )}

            {/* Need to add proper id and for attributes for accessibility.*/}
            {/*The id must be unique and depends on your context.*/}
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center py-16">
                    <form onSubmit={handleSignup} className="space-y-6">
                        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                            <label className="label">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                   className="input" placeholder="Email" />

                            <label className="label">Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                   className="input" placeholder="Password" />
                            <button className="btn btn-neutral w-full" disabled={loading}>
                                {loading ? "Creating..." : "Sign up"}
                            </button>
                        </fieldset>
                    </form>
                </div>
            </div>
        </div>
    )
    // When user press sign up button, add the user to the DB, give them a unique ID
    // and make them an account

    // After user enters email, prompt user to make username and password
}

export default SignUpPage;