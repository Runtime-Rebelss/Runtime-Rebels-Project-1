import React, {useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router";
import api from "../lib/axios.js";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

const UserInfo = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [fullName, setFullName] = useState('');
    const [toastMsg, setToastMsg] = useState('');
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();
    const [editName, setEditName] = useState(true);
    const [editEmail, setEditEmail] = useState(true);
    const [editPassword, setEditPassword] = useState(true);
    const [saveDisabled, setSaveDisabled] = useState(true);


    // Do the login page, but make the button update instead of logging in

    const handleChange = async(e) => {
        e.preventDefault();
        setToastMsg('');
        setLoading(true);
        const upUser = {email: email};

        try {
            const res = await api.put(`/auth/user?email=${email}`, upUser, {withCredentials: true});
            const data = res?.data ?? {};

            const userEmail = data?.email || email;
            setFirstName(firstName);
            setLastName(lastName);
            setFullName(firstName + " " + lastName);

            Cookies.set("userEmail", userEmail);
            Cookies.set("fullName", fullName);

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
    // Make it so that you can choose which field you want to edit, like it will be enabled
    // Need to add thing that checks for field that is being edited and then update it
    return (
        <div className="flex justify-center py-4">
            <form onSubmit={handleChange} className="space-y-6 w-full max-w-sm">
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                {/* Change Name */}
                <label className="label">Change Name</label>
                <div className="join">
                    <input className="input validator" disabled={editName} type="name" required placeholder="Name" />
                    <button type="button" className="btn join-item" onClick={() => setEditName(!editName)}>edit</button>
                </div>
                {/* Change Email */}
                <label className="label">Change Email</label>
                <div className="join">
                    <input className="input validator"
                           id="email"
                           disabled={editEmail}
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           type="email"
                           required placeholder="mail@site.com" />
                    <button type="button" className="btn join-item" onClick={() => setEditEmail(!editEmail)}>edit</button>
                </div>
                {/* Enter Password */}
                <label className="label">Change Password</label>
                <div className="join">
                    <input type="text" className="input" disabled={editPassword} placeholder="Enter password"/>
                    <button type="button" className="btn join-item" onClick={() => setEditPassword(!editPassword)}>edit</button>
                </div>
                {/* Confirm Password */}
                <label className="label">Confirm Password</label>
                <div className="join">
                    <input type="text" className="input" disabled={editPassword} placeholder="Confirm password"/>
                </div>
                {/* Save Changes */}
                <button type="submit" onClick={() => toast.success("Change Confirmed!")} disabled={saveDisabled} className="btn btn-primary join-item">Save</button>
            </fieldset>
            </form>
        </div>
    )
}

export default UserInfo;