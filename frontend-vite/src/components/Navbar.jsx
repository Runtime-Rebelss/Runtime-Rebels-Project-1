import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Search } from "lucide-react";

const Navbar = () => {
    const categories = ["Men", "Women", "Jewelery", "Electronics", "Accessories"];

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
                                <Link to={`/products?category=${cat.toLowerCase()}`}>{cat}</Link>
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
                                to={`/products?category=${cat.toLowerCase()}`}
                                className="font-semibold hover:text-primary transition"
                            >
                                {cat}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* RIGHT — Search + CartPage */}
            <div className="navbar-end gap-2">
                {/*  search text box only visible on large screen */}
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

                {/*  ensures search icon is always visible */}
                <button className="btn btn-ghost btn-circle lg:hidden">
                    <Search className="h-5 w-5" />
                </button>
                {/* Need to update cart UI when item added */}
                {/* CartPage icon */}
                <Link to="/cart" className="btn btn-ghost btn-circle">
                    <div className="indicator">
                        <ShoppingCart className="h-6 w-6" />
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default Navbar;
