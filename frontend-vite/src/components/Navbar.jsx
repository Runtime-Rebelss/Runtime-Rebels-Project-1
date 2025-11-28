import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {ShoppingCart, Search} from "lucide-react";
import cartLib from "../lib/cart.js";
import api from "../lib/axios.js";
import toast from 'react-hot-toast'

const Navbar = () => {
    const categories = ["Men", "Women", "Jewelery", "Electronics", "Accessories"];
    const [cartCount, setCartCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const isAbort = (err) =>
        err?.name === "AbortError" ||
        err?.code === "ERR_CANCELED" ||
        err?.message === "canceled";

    const countFromGuest = () => {
        const cart = cartLib.loadGuestCart?.() || { items: [] };
        const items = Array.isArray(cart.items) ? cart.items : [];
        return items.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);
    };

    const countFromServer = async (userId, signal) => {
        // Assumes backend returns { productIds: [], quantity: [], totalPrice: [] }
        const {data} = await api.get(`/carts/${encodeURIComponent(userId)}`, {signal});
        const qtys = Array.isArray(data?.quantity) ? data.quantity : [];
        return qtys.reduce((s, q) => s + (Number(q) || 1), 0);
    };

    // Initial load
    useEffect(() => {
        const userId = localStorage.getItem("userId");
        const ac = new AbortController();

        (async () => {
            try {
                if (userId) {
                    const n = await countFromServer(userId, ac.signal);
                    setCartCount(n);
                } else {
                    setCartCount(countFromGuest());
                }
            } catch (e) {
                if (!isAbort(e)) {
                    console.warn("navbar cart load failed:", e);
                    setCartCount(countFromGuest());
                }
            }
        })();

        return () => ac.abort();
    }, []);

    useEffect(() => {
        const handler = async () => {
            const userId = localStorage.getItem("userId");
            if (!userId) {
                setCartCount(countFromGuest());
                return;
            }
            const ac = new AbortController();
            try {
                const n = await countFromServer(userId, ac.signal);
                setCartCount(n);
            } catch (e) {
                if (!isAbort(e)) {
                    console.warn("navbar cart refresh failed:", e);
                }
            } finally {
                setLoading(false);
            }
        };

        window.addEventListener("cart-updated", handler);
        window.addEventListener("storage", handler); // catch userId changes across tabs
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
            window.location.reload();
        } catch (error) {
            console.error("Failed to sign out");
            toast.error("Failed to sign out");
        } finally {
            setLoading(false);
        }
    }

    const userId = localStorage.getItem("userId");
    const userEmail = localStorage.getItem("userEmail");

    return (
        <div className="navbar bg-base-100 shadow-sm px-4 sticky top-0 z-50">
            {/* LEFT — Dropdown for small screens */}
            <div className="navbar-start lg:hidden">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                    </div>
                    <ul tabIndex={0}
                        className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                        {categories.map((cat) => (
                            <li key={cat}>
                                <Link to={`/products?category=${cat.toLowerCase()}`}>{cat}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* CENTER — Logo */}
            <div className="navbar-center lg:navbar-start">
                <Link to="/" className="btn btn-ghost normal-case text-2xl font-bold tracking-wide">
                    scamazon
                </Link>
            </div>

            {/* CENTER (lg) — Category menu */}
            <div className="absolute left-1/2 transform -translate-x-1/2 hidden lg:block">
                <ul className="menu menu-horizontal px-1">
                    {categories.map((cat) => (
                        <li key={cat}>
                            <Link to={`/products?category=${cat.toLowerCase()}`}
                                  className="font-semibold hover:text-primary transition">
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
                            <input type="text" placeholder="Search products..."
                                   className="input input-bordered w-48 xl:w-64"/>
                            <button className="btn btn-square btn-primary">
                                <Search className="h-5 w-5 text-white"/>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search icon (xs/md) */}
                <button className="btn btn-ghost btn-circle lg:hidden">
                    <Search className="h-5 w-5"/>
                </button>

                {/* Account (simple) */}
                {userId ? (
                    <div className="dropdown dropdown-hover">
                        <div tabIndex={0} role="button" className="btn btn-ghost">{userEmail} ⬇️</div>
                        <ul tabIndex="-1"
                            className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                            <li>
                                <Link to="/account">
                                    <button className="btn-ghost">Account</button>
                                </Link>
                            </li>
                            <li>
                                <button onClick={handleLogout} className="text-primary-600 underline text-sm hover:text-gray-900">Sign Out</button>
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
                    <ShoppingCart className="h-6 w-6"/>
                    {cartCount > 0 && (
                        <span
                            className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {cartCount}
            </span>
                    )}
                </Link>
            </div>
        </div>
    );
};

export default Navbar;