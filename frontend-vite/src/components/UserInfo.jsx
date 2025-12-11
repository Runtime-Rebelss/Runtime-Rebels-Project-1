import React, {useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router";
import api from "../lib/axios.js";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import ResetPassword from "./ResetPassword.jsx";

const UserInfo = () => {
    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [editName, setEditName] = useState(true);
    const [editEmail, setEditEmail] = useState(true);
    const [editPassword, setEditPassword] = useState(true);

    // Do the login page, but make the button update instead of logging in
    useEffect(() => {
        setEmail(Cookies.get("userEmail"));
        setFullName(Cookies.get("fullName"));
    }, []);

    const parseFullName = (fullName) => {
        const parts = fullName.trim().split(" ");
        const first = parts.shift();
        const last = parts.join(" ");
        return { first, last };
    };
    // Update Name
    const updateName = async () => {
        setLoading(true);

        const {first, last} = parseFullName(fullName);

        try {
            const res = await api.put("/auth/updateName", {
                    email: Cookies.get("userEmail"),
                    fullName: fullName,
                }, {withCredentials: true});

            Cookies.set("firstName", first);
            Cookies.set("lastName", last);
            Cookies.set("fullName", fullName);

            toast.success("Name updated!");
            setEditName(true);
        } catch (err) {
            toast.error("Failed to update name.");
        }

        setLoading(false);
    };
    // Update Email
    const updateEmail = async () => {
        setLoading(true);

        try {
            const res = await api.put("/auth/email",{oldEmail: Cookies.get("userEmail"),
                newEmail: email},
                {withCredentials: true
            });

            Cookies.set("userEmail", email);
            toast.success("Changes saved!");
            setEditEmail(true);

        } catch (err) {
            toast.error("Failed to update email.");
        }
        setLoading(false);
    };

    // Make it so that you can choose which field you want to edit, like it will be enabled
    // Need to add thing that checks for field that is being edited and then update it
    return (
        <div className="flex justify-center py-8">
            <div className="space-y-12 w-full max-w-md">
                {/* Update Name */}
                <fieldset className="fieldset bg-base-200 border p-4 rounded-box">
                    <label className="label font-bold text-lg">Full Name</label>

                    <div className="join">
                        <input
                            className="input outline join-item w-full"
                            disabled={editName}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="First Last"
                        />
                        <button
                            className="btn join-item"
                            onClick={() => setEditName(!editName)}
                        >
                            edit
                        </button>
                    </div>

                    {!editName && (
                        <button
                            className="btn btn-primary w-full mt-3"
                            onClick={updateName}
                            disabled={loading}
                        >
                            Save Name
                        </button>
                    )}
                </fieldset>

                {/* Update Email */}
                <fieldset className="fieldset bg-base-200 border p-4 rounded-box">
                    <label className="label font-bold text-lg">Email</label>

                    <div className="join">
                        <input
                            className="input outline join-item w-full"
                            disabled={editEmail}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button
                            className="btn join-item"
                            onClick={() => setEditEmail(!editEmail)}
                        >
                            edit
                        </button>
                    </div>

                    {!editEmail && (
                        <button
                            className="btn btn-primary w-full mt-3"
                            onClick={updateEmail}
                            disabled={loading}
                        >
                            Save Email
                        </button>
                    )}
                </fieldset>
                {/* Update Password */}
                <ResetPassword/>
            </div>
        </div>
    );
};

export default UserInfo;