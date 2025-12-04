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

/**
 * Navbar component renders top navigation with category links, search and cart.
 *
 * @author Frank Gonzalez, Haley Kenney, Henry Locke
 * @since 11-19-2025
 * @returns {JSX.Element}
 */
const Navbar = ({hideCart = false, hideCartCount = false}) => {
    const categories = ["Men's", "Women's", "Jewelry", "Electronics", "Home & Garden"];
    const [cartCount, setCartCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const isAbort = (err) =>
        err?.name === "AbortError" ||
        err?.code === "ERR_CANCELED" ||
        err?.message === "canceled";

    const countFromGuest = () => {
        const cart = cartLib.loadGuestCart?.() || {items: []};
        const items = Array.isArray(cart.items) ? cart.items : [];
        return items.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);
    };

    const countFromServer = async (userId, signal) => {
        const {data} = await api.get(`/carts/${encodeURIComponent(userId)}`, {signal});
        const qtys = Array.isArray(data?.quantity) ? data.quantity : [];
        return qtys.reduce((s, q) => s + (Number(q) || 1), 0);
    };

    // Initial load
    useEffect(() => {
        const userId = Cookies.get("userId");
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

    // Update count when cart changes
    useEffect(() => {
        const handler = async () => {
            const userId = Cookies.get("userId");
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
        window.addEventListener("storage", handler);
        return () => {
            window.removeEventListener("cart-updated", handler);
            window.removeEventListener("storage", handler);
        };
    }, []);

    const handleSearch = (term) => {
        const trimmed = (term || "").trim();
        if (!trimmed) return;
        const params = buildMergedParams(searchParams, {search: trimmed});
        navigate(`/results?${params.toString()}`);
    };

    const onSubmitSearch = (e) => {
        e.preventDefault();
        handleSearch(searchTerm);
    };

    const handleLogout = () => {
        try {
            Cookies.remove("userId");
            Cookies.remove("userEmail");
            Cookies.remove("adminEmail");
            toast.success("User logged out!");
            navigate("/");
            window.location.reload();
        } catch (error) {
            console.error("Failed to sign out");
            toast.error("Failed to sign out");
        } finally {
            setLoading(false);
        }
    };

    const userId = Cookies.get("userId");
    const userEmail = Cookies.get("userEmail");
    const adminEmail = Cookies.get("adminEmail");
    Cookies.set("adminEmail", adminEmail);
    Cookies.remove("adminEmail");

    return (
        <div className="bg-base-100 shadow-sm sticky top-0 z-50 flex flex-col">
            {/* ROW 1: logo + (desktop) search + orders/account/cart */}
            <div className="w-full flex items-center gap-4 px-4 py-2">
                {/* LEFT: hamburger + logo */}
                <div className="flex items-center gap-2">
                    {/* Hamburger only on small screens */}
                    <div className="dropdown lg:hidden">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-square">
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
                            className="menu menu-sm dropdown-content mt-3 z-[60] p-2 shadow bg-base-100 rounded-box w-52"
                        >
                            {categories.map((cat) => (
                                <li key={cat}>
                                    <Link
                                        to={`/results?${buildMergedParams(searchParams, {
                                            categories: [formatString(cat)],
                                        }).toString()}`}
                                    >
                                        {cat}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Link
                        to="/"
                        className="btn btn-ghost normal-case text-2xl font-bold tracking-wide px-0"
                    >
                        scamazon
                    </Link>
                </div>

                {/* MIDDLE: search bar — only inline on md+ */}
                <div className="flex-1 hidden md:flex justify-center">
                    <form onSubmit={onSubmitSearch} className="w-full flex max-w-5xl">
                        <input
                            type="search"
                            placeholder="Search products..."
                            name="searchbar"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input input-bordered rounded-r-none w-full"
                        />
                        <button type="submit" className="btn btn-primary rounded-l-none">
                            <Search className="h-5 w-5 text-white"/>
                        </button>
                    </form>
                </div>

                {/* RIGHT: orders / account / cart */}
                <div className="flex items-center gap-2 ml-auto">
                    <Link to="/orders">
                        <button className="btn btn-ghost">Orders</button>
                    </Link>

                    {
                        userEmail ? (
                                <div className="dropdown dropdown-hover">
                                    <div tabIndex={0} role="button" className="btn btn-ghost">
                                        <User/>
                                    </div>
                                    <ul tabIndex="-1"
                                        className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                                        <li>
                                            <Link to="/account">
                                                <button className="btn-ghost">Account</button>
                                            </Link>
                                        </li>
                                        <li>
                                            <button onClick={handleLogout}
                                                    className="text-primary-600 underline text-sm hover:text-gray-900">Sign
                                                Out
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            ) :
                            adminEmail ? (
                                <div className="dropdown dropdown-hover">
                                    <div tabIndex={0} role="button" className="btn btn-ghost">
                                        <User/>
                                    </div>
                                    <ul tabIndex="-1"
                                        className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                                        <li>
                                            <Link to="/admin">
                                                <button className="btn-ghost">Admin</button>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/account">
                                                <button className="btn-ghost">Account</button>
                                            </Link>
                                        </li>
                                        <li>
                                            <button onClick={handleLogout}
                                                    className="text-primary-600 underline text-sm hover:text-gray-900">Sign Out
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            ) : (
                                <Link to="/login">
                                    <button className="btn btn-ghost">Sign in</button>
                                </Link>
                            )}

                    {!hideCart && (
                        <Link to="/cart" className="btn btn-ghost btn-circle relative">
                            <ShoppingCart className="h-6 w-6"/>
                            {!hideCartCount && cartCount > 0 && (
                                <span
                                    className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
                            )}
                        </Link>
                    )}
                </div>
            </div>

            {/* ROW 2 (mobile): full-width search under header on small screens */}
            <div className="px-4 pb-1 flex md:hidden">
                <form onSubmit={onSubmitSearch} className="w-full flex">
                    <input
                        type="search"
                        placeholder="Search products..."
                        name="searchbar"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input input-bordered rounded-r-none w-full"
                    />
                    <button type="submit" className="btn btn-primary rounded-l-none">
                        <Search className="h-5 w-5 text-white"/>
                    </button>
                </form>
            </div>

            {/* ROW 2/3: centered categories bar, spaced more on large screens */}
            <div className="border-t border-base-200">
                <div className="px-4">
                    <nav className="w-full flex justify-center">
                        <ul
                            className="flex gap-4 md:gap-8 xl:gap-12 py-2 text-sm md:text-base overflow-x-auto md:-ml-6"
                        >
                            {categories.map((cat) => (
                                <li key={cat} className="whitespace-nowrap">
                                    <Link
                                        to={`/results?${buildMergedParams(searchParams, {
                                            categories: [formatString(cat)],
                                        }).toString()}`}
                                        className="font-semibold hover:text-primary transition"
                                    >
                                        {cat}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
