import React, { useState } from "react";
import emailLib from "../lib/email";

const Email = () => {
    const { email, setEmail, loading, fetchEmail } = emailLib();

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
                            onChange={(e) => fetchEmail(e.target.value)}
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
