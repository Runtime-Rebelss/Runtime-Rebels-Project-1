import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Search } from "lucide-react";
import cartLib from "../lib/cart.js";
import toast from "react-hot-toast";

const Navbar = () => {
    const categories = ["Men", "Women", "Jewelery", "Electronics", "Accessories"];
    const [cartCount, setCartCount] = useState(0);

    const countFromGuest = () => {
        const items = cartLib.loadGuestCart?.() || [];
        return items.reduce(
            (sum, it) => sum + (Number(it.quantity) || 1),
            0
        );
    };

    const countFromServer = () => {
        const items = cartLib.loadServerCart?.() || [];
        return items.reduce(
            (sum, it) => sum + (Number(it.quantity) || 1),
            0
        );
    };

    const refreshCartCount = () => {
        const userId = localStorage.getItem("userId");
        if (userId) {
            setCartCount(countFromServer());
        } else {
            setCartCount(countFromGuest());
        }
    };

    // Initial load
    useEffect(() => {
        refreshCartCount();
    }, []);

    // Update on cart changes or userId changes
    useEffect(() => {
        const handler = () => {
            refreshCartCount();
        };

        window.addEventListener("cart-updated", handler);
        window.addEventListener("storage", handler); // catch userId/cart changes across tabs
        return () => {
            window.removeEventListener("cart-updated", handler);
            window.removeEventListener("storage", handler);
        };
    }, []);

    const handleLogout = () => {
        try {
            localStorage.removeItem("userId");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("authToken");
            toast.success("User logged out!");
        } catch (error) {
            console.error("Failed to sign out", error);
            toast.error("Failed to sign out");
        } finally {
            // After logout, fall back to guest cart
            setCartCount(countFromGuest());
        }
    };

    const userId = localStorage.getItem("userId");
    const userEmail = localStorage.getItem("userEmail");

    return (
        <div className="navbar bg-base-100 shadow-sm px-4 sticky top-0 z-50">
            {/* LEFT — Dropdown for small screens */}
            <div className="navbar-start lg:hidden">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
                    >
                        {categories.map((cat) => (
                            <li key={cat}>
                                <Link to={`/products?category=${cat.toLowerCase()}`}>
                                    {cat}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* CENTER — Logo */}
            <div className="navbar-center lg:navbar-start">
                <Link
                    to="/"
                    className="btn btn-ghost normal-case text-2xl font-bold tracking-wide"
                >
                    scamazon
                </Link>
            </div>

            {/* CENTER (lg) — Category menu */}
            <div className="absolute left-1/2 transform -translate-x-1/2 hidden lg:block">
                <ul className="menu menu-horizontal px-1">
                    {categories.map((cat) => (
                        <li key={cat}>
                            <Link
                                to={`/products?category=${cat.toLowerCase()}`}
                                className="font-semibold hover:text-primary transition"
                            >
                                {cat}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* RIGHT — Search + Account + Orders + Cart */}
            <div className="navbar-end gap-2">
                {/* Search (lg) */}
                <div className="hidden lg:flex">
                    <div className="form-control">
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="input input-bordered w-48 xl:w-64"
                            />
                            <button className="btn btn-square btn-primary">
                                <Search className="h-5 w-5 text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search icon (xs/md) */}
                <button className="btn btn-ghost btn-circle lg:hidden">
                    <Search className="h-5 w-5" />
                </button>

                {/* Account */}
                {userId ? (
                    <div className="dropdown dropdown-hover">
                        <div
                            tabIndex={0}
                            role="button"
                            className="btn btn-ghost"
                        >
                            {userEmail} ⬇️
                        </div>
                        <ul
                            tabIndex={-1}
                            className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
                        >
                            <li>
                                <Link to="/account">
                                    <button className="btn-ghost">Account</button>
                                </Link>
                            </li>
                            <li>
                                <button
                                    onClick={handleLogout}
                                    className="text-primary-600 underline text-sm hover:text-gray-900"
                                >
                                    Sign Out
                                </button>
                            </li>
                        </ul>
                    </div>
                ) : (
                    <Link to="/login">
                        <button className="btn btn-ghost">Sign in</button>
                    </Link>
                )}

                {/* Orders */}
                <Link to="/orders">
                    <button className="btn btn-ghost">Orders</button>
                </Link>

                {/* Cart */}
                <Link to="/cart" className="btn btn-ghost btn-circle relative">
                    <ShoppingCart className="h-6 w-6" />
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                            {cartCount}
                        </span>
                    )}
                </Link>
            </div>
        </div>
    );
};

export default Navbar;
