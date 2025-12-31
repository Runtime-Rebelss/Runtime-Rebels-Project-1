import React, {useState, useEffect} from "react";
import Cookies from "js-cookie";
import addressService from "../lib/addresses.js";
import {Link} from "react-router-dom";
import CartCard from "./CartCard.jsx";

const Checkout = (cartItems = [], onUpdateQuantity, onRemove) => {
    const [showCheckoutPrompt, setShowCheckoutPrompt] = useState(false);
    const [address, setAddress] = useState(null);

    const fullName = Cookies.get("fullName") || "Guest";

    useEffect(() => {
        const userId = Cookies.get("userId");
        if (!userId) return;

        let cancelled = false;
        (async () => {
            try {
                const resp = await addressService.getAddressesByUserId(userId);
                const addrs = resp?.data ?? [];
                const def = addrs.find(a => a?.isDefault || a?.is_default || a?.default) || addrs[0] || null;
                if (!cancelled) setAddress(def);
            } catch (err) {
                console.warn("Failed to load addresses", err);
            }
        })();

        return () => { cancelled = true; };
    }, []);

    const renderAddressLine = (addr) => {
        if (!addr) return null;
        const address = addr.address || "";
        const city = addr.city || "";
        const state = addr.state || "";
        const zip = addr.zipCode || "";
        const country = addr.country || "";

        const parts = [address, city, state, zip, country].filter(Boolean);
        return parts.join(', ');
    }

    const items = Array.isArray(cartItems) ? cartItems : [];

    return (
        <div className="container mx-auto px-4 py-8">
            {/* DELIVERY NAME */}
            <div className="flex justify-between items-center ">
                <h1 className="text-xl font-bold">Delivering to {address?.name || fullName}</h1>
                <a className="link link-hover link-accent" href="http://localhost:5173/checkout/address">Change</a>
            </div>
            {/* DELIVERY ADDRESS */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6'>
            {address ? (
                <div className="mb-4">
                    {renderAddressLine(address)}
                </div>
            ) : (
                <div className="mb-4 text-sm text-base-content/60">
                    No delivery address set. <Link to="/account/add/address" className="underline">Add an address</Link> to prefill checkout.
                </div>
            )}
            </div>
            {/* PAYMENT METHOD - Implement Stripe here */}
            <div className="text-1xl font-semibold mb-6">
                Payment method
            </div>
            {/* PRODUCT(S) TO BE PURCHASED */}
            <div>
            {items.map((it) => (
                <CartCard
                    key={it.productId || it.id}
                    item={it}
                    onUpdateQuantity={onUpdateQuantity}
                    onRemove={onRemove}
                />
            ))}
            </div>
        </div>
    )
}

export default Checkout;
