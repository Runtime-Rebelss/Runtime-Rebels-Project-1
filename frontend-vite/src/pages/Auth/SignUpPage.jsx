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

        try {
            setLoading(true);
            setToastMsg("");

            const res = await api.post("/auth/signup", { email, password });
            const { message, userId, email: userEmail} = res.data || {};

            const newUser = new User({email,password});
            await newUser.save();

            res.status(201).json({
                message: 'Signup successful!',
                userId: newUser.id,
                email: newUser.email,
            });

            if (!userId) {
                setToastMsg("Signup successful, but no userId");
                setIsSuccessful(false);
                return;
            }

            localStorage.setItem("userId", userId);
            localStorage.setItem("userEmail",  userEmail || email);

            // Should output a message saying account was created
            // Redirect to homepage
            // Then username should show up in the top right or left
            // Need to add button to either sign out or login


            setToastMsg(message || "Account created successfully!!");
            // Redirect to homepage
            setIsSuccessful(true);
            setEmail("");
            setPassword("");

            window.dispatchEvent(new Event("cart-updated"));

            navigate("/", {replace: true});
        } catch (error) {
            const msg = error?.response.error ||
                error?.response.data.message;
            setToastMsg(msg);
            setIsSuccessful(false);
            console.log(error);
        } finally {
            setLoading(false);
            setToastMsg("Account Created!")
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