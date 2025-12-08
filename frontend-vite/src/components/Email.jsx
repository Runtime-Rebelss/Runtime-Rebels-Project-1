import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios.js";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import Navbar from "./Navbar.jsx";

const Email = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const fetchEmail = async (e) => {
        e.preventDefault(); // prevent full page reload
        setLoading(true);

        try {
            const res = await api.get(`/${email}`, { withCredentials: true });
            const data = res.data;

            const userEmail = data?.email || email;
            Cookies.set("userEmail", userEmail);

            toast.success("Email found! Redirecting...");
            navigate("/reset-password");
        } catch (error) {
            toast.error("Email not found.");
            console.error(error);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar />
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
        </div>
    );
};

export default Email;