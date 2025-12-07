import React, {useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router";
import api from "../lib/axios.js";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

const ResetPassword = () => {
    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [editName, setEditName] = useState(true);
    const [editEmail, setEditEmail] = useState(true);
    const [editPassword, setEditPassword] = useState(true);

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
                    email: Cookies.get("userEmail"),
                    oldPassword,
                    newPassword,
                    confirmPassword
                },
                {withCredentials: true}
            );

            toast.success("Password updated!");
            setEditPassword(true);
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");

        } catch (err) {
            toast.error(
                err?.response?.data?.message || "Failed to update password"
            );
        }
        setLoading(false);
    };
    // Make it so that you can choose which field you want to edit, like it will be enabled
    // Need to add thing that checks for field that is being edited and then update it
    return (
        <div className="flex justify-center py-8">
            <div className="space-y-12 w-full max-w-md">
                {/* Update Password */}
                <fieldset className="fieldset bg-base-200 border p-4 rounded-box">
                    <label className="label font-bold text-lg">Change Password</label>
                    <div>
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
                    <button
                        className="btn-outline btn mt-2"
                        onClick={() => setEditPassword(!editPassword)}
                    >
                        edit
                    </button>
                    {!editPassword && (
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