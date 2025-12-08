import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios.js";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

const Email = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const validateEmailFormat = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const fetchEmail = async (e) => {
        e.preventDefault();
        setLoading(true);

        // --- 1. VALIDATE EMAIL FORMAT ---
        if (!validateEmailFormat(email)) {
            toast.error("Please enter a valid email address.");
            setLoading(false);
            return;
        }

        try {
            const res = await api.get(`/api/auth/${email}`, { withCredentials: true });
            const data = res.data;

            const userEmail = data?.email || email;
            Cookies.set("userEmail", userEmail);

            toast.success("Email found! Redirecting...");
            navigate("/reset-password");
        } catch (error) {
            // --- 2. DISPLAY EMAIL NOT REGISTERED MESSAGE ---
            if (error?.response?.status === 404) {
                toast.error("Email not registered.");
            } else {
                toast.error("Something went wrong. Please try again.");
            }
            console.error(error);
        }

        setLoading(false);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center py-16">
                <form onSubmit={fetchEmail} className="space-y-6 w-full max-w-sm">
                    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
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

                        <button type="submit" className="btn btn-neutral w-full mt-4" disabled={loading}>
                            {loading ? "Loading..." : "Continue"}
                        </button>
                    </fieldset>
                </form>
            </div>
        </div>
    );
};

export default Email;
