import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ShoppingCart, Search } from "lucide-react";
import cartLib from "../lib/cart.js";
import formatString from "./actions/stringFormatter.js";
import { buildMergedParams } from "../lib/query";

/**
 * Navbar component renders top navigation with category links, search and cart.
 * 
 * @author Frank Gonzalez, Haley Kenney
 * @since 11-19-2025
 * @returns {JSX.Element}
 */
const Navbar = ({ hideCart = false, hideCartCount = false }) => {
    const categories = ["Men's", "Women's", "Jewelry", "Electronics", "Home & Garden"];
    const [cartCount, setCartCount] = useState(0);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    // load initial count
    useEffect(() => {
        const items = cartLib.loadGuestCart?.();
        const count = items.reduce((sum, it) => sum + (it.quantity || 1), 0);
        setCartCount(count);
    }, []);

    // update count
    useEffect(() => {
        const handler = () => {
            const items = cartLib.loadGuestCart?.();
            const count = items.reduce((sum, it) => sum + (it.quantity || 1), 0);
            setCartCount(count);
        };

        window.addEventListener("cart-updated", handler);
        return () => window.removeEventListener("cart-updated", handler);
    }, []);

    // Handle search
    const [searchParams] = useSearchParams();

    const handleSearch = (term) => {
        const trimmed = (term || '').trim();
        if (!trimmed) return;

        const params = buildMergedParams(searchParams, { search: trimmed });
        navigate(`/results?${params.toString()}`);
    };

    // Handle search submission
    const onSubmitSearch = (e) => {
        e.preventDefault();
        handleSearch(searchTerm);
    };

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
                                <Link to={`/results?${buildMergedParams(searchParams, { categories: [formatString(cat)] }).toString()}`}>{cat}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* CENTER — Logo (moves center on small, left on large) */}
            <div className="navbar-center lg:navbar-start">
                <Link
                    to="/"
                    className="btn btn-ghost normal-case text-2xl font-bold tracking-wide"
                >
                    scamazon
                </Link>
            </div>

            {/* CENTER (on large screens) — Category menu */}
            <div className="absolute left-1/2 transform -translate-x-1/2 hidden lg:block">
                <ul className="menu menu-horizontal px-1">
                    {categories.map((cat) => (
                        <li key={cat}>
                            <Link
                                to={`/results?${buildMergedParams(searchParams, { categories: [formatString(cat)] }).toString()}`}
                                className="font-semibold hover:text-primary transition"
                            >
                                {cat}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* RIGHT — Search + Cart */}
            <div className="navbar-end gap-2">
                {/*  search text box only visible on large screen */}
                <div className="hidden lg:flex">
                    <div className="form-control">
                        <div className="input-group">
                            <input
                                type="search"
                                placeholder="Search products..."
                                name="searchbar"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        onSubmitSearch(e);
                                    }
                                }}
                                className="input input-bordered w-48 xl:w-64"
                            />
                            <button className="btn btn-square btn-primary" onClick={onSubmitSearch}>
                                <Search className="h-5 w-5 text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                {/*  ensures search icon is always visible */}
                <button className="btn btn-ghost btn-circle lg:hidden">
                    <Search className="h-5 w-5" />
                </button>

                {/* new cart icon with item count  */}
                <Link to="/cart" className="btn btn-ghost btn-circle relative">
                    <ShoppingCart className="h-6 w-6" />
                    {!hideCartCount && cartCount > 0 && (
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
