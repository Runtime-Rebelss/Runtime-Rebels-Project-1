import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./axios.js";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

export function validateEmailFormat(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

export function useEmailLookup() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const fetchEmail = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!validateEmailFormat(email)) {
            toast.error("Please enter a valid email address.");
            setLoading(false);
            return;
        }

        try {
            const res = await api.get(`/auth/${email}`, { withCredentials: true });
            const data = res.data;

            const userEmail = data?.email || email;
            Cookies.set("userEmail", userEmail);

            toast.success("Email found!");
            navigate("/reset-password");
        } catch (error) {
            if (error?.response?.status === 404) {
                toast.error("Email not registered.");
            } else {
                toast.error("Something went wrong. Please try again.");
            }
            console.error(error);
        }

        setLoading(false);
    };

    return {
        email,
        setEmail,
        loading,
        fetchEmail,
    };
}

export default useEmailLookup;
