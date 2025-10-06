import React from "react";
import { Link } from "react-router";
import { ShoppingCart } from "lucide-react";

const Navbar = () => {
    return (
        <div className="navbar bg-base-100 shadow-sm">
            <div className="flex-1">
                <Link to={"/"} 
                    className="btn btn-ghost text-xl"
                >scamazon</Link>
            </div>
            <div className="flex-none">
                <button className="btn btn-square btn-ghost">
                    <ShoppingCart />
                </button>
            </div>
        </div>
    );
};

export default Navbar;
