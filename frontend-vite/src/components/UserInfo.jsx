import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {ShoppingCart, Search, User} from "lucide-react";
import {useNavigate, useSearchParams} from "react-router";
import cartLib from "../lib/cart.js";
import api from "../lib/axios.js";
import toast from "react-hot-toast";
import formatString from "./actions/stringFormatter.js";
import {buildMergedParams} from "../lib/query";
import Cookies from "js-cookie";

const UserInfo = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [toastMsg, setToastMsg] = useState('');
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();
    const [isInputDisabled, setIsInputDisabled] = useState(true);

    const toggleInputDisabled = () => {
        setIsInputDisabled(!isInputDisabled);
    }

    // Do the login page, but make the button update instead of logging in

    const handleChange = async(e) => {
        e.preventDefault();
        setToastMsg('');
        setLoading(true);

        try {
            const res = await api.post('/auth/email', {email}, {withCredentials: true});
            const data = res?.data ?? {};

            const userEmail = data?.email || email;

            Cookies.set("userEmail", userEmail);

        } catch (err) {
            const status = err?.response?.status;
            const serverMsg = err?.response?.data?.message || err?.response?.data?.error;
            if (status === 404) setToastMsg(serverMsg || 'No account with that email');
            else if (status === 401) setToastMsg(serverMsg || 'Incorrect password');
            else setToastMsg(serverMsg || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }
    // Make it so that you can choose which field you want to edit, like it will be ungrayed
    return (
        <div className="flex justify-center py-4">
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                {/* Change Name */}
                <label className="label">Change Name</label>
                <div className="join">
                    <input className="input validator" type="name" required placeholder="Name" />
                    <button className="btn join-item">edit</button>
                </div>
                {/* Change Email */}
                <label className="label">Change Email</label>
                <div className="join">
                    <input className="input validator" disabled={isInputDisabled} type="email" required placeholder="mail@site.com" />
                    <button className="btn join-item" onClick={toggleInputDisabled}>edit</button>
                </div>
                {/* Enter Password */}
                <label className="label">Change Password</label>
                <div className="join">
                    <input type="text" className="input" placeholder="Enter password"/>
                    <button className="btn join-item">edit</button>
                </div>
                {/* Confirm Password */}
                <label className="label">Confirm Password</label>
                <div className="join">
                    <input type="text" className="input" placeholder="Confirm password"/>
                    <button className="btn join-item">edit</button>
                </div>
                {/* Save Changes */}
                <button type="submit" onClick={() => toast.success("Change Confirmed!")} className="btn btn-primary join-item">Save</button>
            </fieldset>
        </div>
    )
}

export default UserInfo;