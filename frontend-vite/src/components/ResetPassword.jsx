import React, {useState} from "react";
import {useLocation, useNavigate} from "react-router";
import api from "../lib/axios.js";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import {Eye, EyeOff} from 'lucide-react';

const ResetPassword = () => {
    const [loading, setLoading] = useState(false);

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    // visibility state for inputs
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Detect reset page route
    const isResetPassword = location.pathname === "/reset-password";

    // If on reset page inputs are enabled; otherwise editing is toggled by Edit button
    const [editPassword, setEditPassword] = useState(!isResetPassword);
    const inputsEnabled = isResetPassword || !editPassword;

    const toggleOld = () => setShowOld(s => !s);
    const toggleNew = () => setShowNew(s => !s);

    const handleCancel = () => {
        if (isResetPassword) {
            navigate('/login');
            return;
        }
        // cancel editing
        setEditPassword(true);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowOld(false);
        setShowNew(false);
    };

    const updatePassword = async () => {
        if (!isResetPassword && (!oldPassword || oldPassword.trim().length === 0)) {
            toast.error("Old password is required to change your password.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        setLoading(true);
        try {
            await api.put(
                "/auth/updatePassword",
                {
                    email: Cookies.get("userEmail") || sessionStorage.getItem("userEmail"),
                    oldPassword,
                    newPassword,
                    confirmPassword,
                },
                {withCredentials: true}
            );

            if (oldPassword === newPassword && !isResetPassword) {
                toast.error("Password must be different from old password!");
            } else {
                toast.success("Password updated!");
                setEditPassword(true);
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
                sessionStorage.removeItem("userEmail");
                navigate("/login");
            }
        } catch (err) {
            console.error('updatePassword error:', err);
            const serverMsg = err?.response?.data?.message;
            const serverData = err?.response?.data;
            const status = err?.response?.status;
            const message = serverMsg || (serverData ? JSON.stringify(serverData) : err.message || 'Failed to update password');
            toast.error(`Error ${status || ''}: ${message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center py-8">
            <div className="space-y-12 w-full max-w-md">
                <fieldset className="fieldset bg-base-200 border p-4 rounded-box">
                    <label className="label font-bold text-lg">Change Password</label>

                    <div className="space-y-3">
                        {/* OLD PASSWORD (only when editing and not on reset page) */}
                        {!isResetPassword && !editPassword && (
                            <div className="relative">
                                <input
                                    type={showOld ? 'text' : 'password'}
                                    className="input outline w-full mb-2 pr-10"
                                    disabled={editPassword}
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    placeholder="Old password"
                                />
                                {inputsEnabled && (
                                    <button
                                        type="button"
                                        onClick={toggleOld}
                                        aria-label={showOld ? 'Hide old password' : 'Show old password'}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 z-30 p-1 bg-transparent"
                                    >
                                        {showOld ? <Eye size={18}/> : <EyeOff size={18}/>}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* NEW PASSWORD */}
                        <div className="relative">
                            <input
                                type={showNew ? 'text' : 'password'}
                                className="input outline w-full mb-2 pr-10"
                                disabled={!inputsEnabled}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New password"
                            />
                            {inputsEnabled && (
                                <button
                                    type="button"
                                    onClick={toggleNew}
                                    aria-label={showNew ? 'Hide password' : 'Show password'}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 z-30 p-1 bg-transparent"
                                >
                                    {showNew ? <Eye size={18}/> : <EyeOff size={18}/>}
                                </button>
                            )}
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className="relative">
                            <input
                                type={showNew ? 'text' : 'password'}
                                className="input outline w-full mb-2 pr-10"
                                disabled={!inputsEnabled}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm password"
                            />
                            {inputsEnabled && (
                                <button
                                    type="button"
                                    onClick={toggleNew}
                                    aria-label={showNew ? 'Hide password' : 'Show password'}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 z-30 p-1 bg-transparent"
                                >
                                    {showNew ? <Eye size={18}/> : <EyeOff size={18}/>}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* EDIT button for account flow */}
                    {!isResetPassword && editPassword && (
                        <button className="btn-outline btn mt-2" onClick={() => setEditPassword(false)}>
                            Edit
                        </button>
                    )}

                    {/* Save + Cancel when inputs are enabled */}
                    {inputsEnabled && (
                        <div className="flex gap-3 mt-3">
                            <button className="btn btn-primary flex-1" onClick={updatePassword} disabled={loading}>
                                Save Password
                            </button>
                            <button className="btn btn-outline flex-1" onClick={handleCancel} disabled={loading}>
                                Cancel
                            </button>
                        </div>
                    )}
                </fieldset>
            </div>
        </div>
    );
};

export default ResetPassword;
