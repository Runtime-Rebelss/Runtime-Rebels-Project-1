import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import api from "../lib/axios.js";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

const ResetPassword = () => {
    const [loading, setLoading] = useState(false);

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const navigate = useNavigate();
    const location = useLocation();

    // Check if we are on the reset-password page
    const isResetPassword = location.pathname === "/reset-password";

    // If reset page → inputs enabled (false)
    // Else → disabled (true)
    const [editPassword, setEditPassword] = useState(!isResetPassword);

    // Update Password
    const updatePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        setLoading(true);

        try {
            const res = await api.put(
                "/auth/updatePassword",
                {
                    email: Cookies.get("userEmail") || sessionStorage.getItem("userEmail"),
                    oldPassword,
                    newPassword,
                    confirmPassword
                },
                { withCredentials: true }
            );

            if (oldPassword === newPassword) {
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
            toast.error(err?.response?.data?.message || "Failed to update password");
        }

        setLoading(false);
    };

    return (
        <div className="flex justify-center py-8">
            <div className="space-y-12 w-full max-w-md">

                {/* Update Password */}
                <fieldset className="fieldset bg-base-200 border p-4 rounded-box">
                    <label className="label font-bold text-lg">Change Password</label>

                    <div>
                        {/* Old Password (Required unless it's reset-password page) */}
                        <input
                            type="password"
                            className="input outline w-full mb-2"
                            disabled={editPassword}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            placeholder="Old password"
                        />

                        <input
                            type="password"
                            className="input outline w-full mb-2"
                            disabled={editPassword}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New password"
                        />

                        <input
                            type="password"
                            className="input outline w-full mb-2"
                            disabled={editPassword}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                        />
                    </div>

                    {/* EDIT BUTTON — only if NOT on reset-password */}
                    {!isResetPassword && editPassword && (
                        <button
                            className="btn-outline btn mt-2"
                            onClick={() => setEditPassword(false)}
                        >
                            Edit
                        </button>
                    )}

                    {/* SAVE BUTTON — only on reset-password OR when editing */}
                    {(isResetPassword || !editPassword) && (
                        <button
                            className="btn btn-primary w-full mt-3"
                            onClick={updatePassword}
                            disabled={loading}
                        >
                            Save Password
                        </button>
                    )}
                </fieldset>
            </div>
        </div>
    );
};

export default ResetPassword;
