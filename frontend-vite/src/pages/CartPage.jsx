import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import Navbar from '../components/Navbar';
import cartLib from "../lib/cart.js";
import api from "../lib/axios.js";
import toast from "react-hot-toast";

function calcTotal(items) {
    return items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);
}

// Added for when we add actual users
async function loadServerCart(userId, signal) {
    const { data: cartData } = await api.get(`/carts/${encodeURIComponent(userId)}`, { signal });
    const productIds = Array.isArray(cartData?.productIds) ? cartData.productIds : [];
    const quantities = Array.isArray(cartData?.quantity) ? cartData.quantity : [];
    const finalPrices = Array.isArray(cartData?.totalPrice) ? cartData.totalPrice : [];

    const items = await Promise.all(
        productIds
            .filter((pid) => typeof pid === 'string' && pid.trim().length > 0)
            .map(async (productId, index) => {
                try {
                    const { data: product } = await api.get(`/products/${encodeURIComponent(productId)}`, { signal });

                    const quantity = Number(quantities?.[index] ?? 1) || 1;
                    const basePrice =
                        Number(finalPrices?.[index]) ||
                        Number(product?.finalPrice) ||
                        Number(product?.price) ||
                        0;

                    return {
                        id: productId,
                        name: product?.name ?? 'Item',
                        image:
                            product?.image ||
                            product?.imageUrl ||
                            'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                        price: Math.max(0, basePrice),
                        quantity,
                    };
                } catch {
                    if (isAbort(e)) throw e; // bubble abort once
                    return null;                }
            })
    );
    return items.filter(Boolean);
}

// Need to add stuff so can make an actual account
const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showCheckoutPrompt, setShowCheckoutPrompt] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [isGuest, setIsGuest] = useState(false);

    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("authToken");

    useEffect(() => {
        // if (!userId || !token) {
        //     navigate("/login?redirect=/cart");
        //     return;
        // }

        let ac = new AbortController();

        const load = async () => {
            setLoading(true);
            const isAbort = (err) =>
                err?.name === "AbortError" ||
                err?.code === "ERR_CANCELED" ||
                err?.message === "canceled";
            // From cart.js
            if (!userId) {
                // Guest mode
                setIsGuest(true);
                const {items} = cartLib.loadGuestCart();
                setCartItems(
                    items.map((it) => ({
                        id: it.productId,
                        name: it.name,
                        image: it.image,
                        price: Number(it.price || 0),
                        quantity: Number(it.quantity || 1),
                    }))
                );
                setLoading(false);
                return;
            }

            setIsGuest(false);

            try {
                const items = await loadServerCart(userId, ac.signal);
                setCartItems(items);
            } catch (err) {
                if (isAbort(err)) return; // ignore expected cancellations
                console.error('Error fetching cart:', err);
                toast.error('Failed to fetch cart :(');

            } finally {
                setLoading(false);
            }
        };

        load();
        return () => ac.abort();
    }, [userId, token, navigate]);

    useEffect(() => {
        const handler = async () => {
            const uId = localStorage.getItem("userId");

            if (!uId) {
                const { items } = cartLib.loadGuestCart();
                setCartItems(
                    items.map((it) => ({
                        id: it.productId,
                        name: it.name,
                        image: it.image,
                        price: Number(it.price || 0),
                        quantity: Number(it.quantity || 1),
                    }))
                );
                return;
            }

            const ac = new AbortController();
            try {
                const items = await loadServerCart(uId, ac.signal);
                setCartItems(items);
            } catch (err) {
                if (err?.name !== "AbortError") {
                    console.warn("cart-updated reload failed:", err);
                }
            }
        };
        // Updates the navbar
        window.addEventListener("cart-updated", handler);
        return () => window.removeEventListener("cart-updated", handler);
    }, []);


    useEffect(() => {
        setTotal(calcTotal(cartItems));
    }, [cartItems]);

    const updateQuantity = async (productId, newQty) => {
        if (newQty < 1) newQty = 1;

        try {
            if (!userId) {
                await cartLib.updateQuantity({ productId, quantity: newQty });
                setCartItems(cartItems.map((it) =>
                    it.productId === productId ? { ...it, quantity: newQty } : it
                ));
                window.dispatchEvent(new Event("cart-updated"));
                return;
            }
            await api.put(`/carts/update`, null, { params: { userId, productId, quantity: newQty}});

            setCartItems(cartItems.map((it) =>
                it.id === productId ? { ...it, quantity: newQty } : it
            ));
            // Makes navbar update in real-time
            window.dispatchEvent(new Event("cart-updated"));
        } catch (err) {
            console.error("Error updating quantity:", err);
            toast.error("Failed to update quantity");
        }
    };

    const removeItem = async (productId) => {
        const userId = localStorage.getItem("userId");
        // This is for guest
        try {
            if (!userId) {
                await cartLib.removeItem(productId);
                // Update the cart and remove the product
                setCartItems(cartItems.filter((it) => it.id !== productId));
                return;
            }
            // This is for user
            await api.put(`/carts/update`, null, { params: { userId, productId, quantity: 0 } });
            setCartItems(cartItems.filter((it) => it.id !== productId));
            // update navbar
            window.dispatchEvent(new Event("cart-updated"));
        } catch (err) {
            console.error('Error removing item:', err);
            toast.error('Failed to remove item');
        }
    };

    // Method to handle user Checkouts (move to cart)
    const handleUserCheckout = async () => {
        try {
            setLoading(true);
            const cartItems = await cartLib.loadServerCart(userId);

            const items = cartItems.map((item) => ({
                name: item.name,
                unitAmount: Math.round(item.price * 100),
                currency: "usd",
                quantity: item.quantity,
            }));

            const response = await api.post("/payments/create-checkout-session", {
                items,
                userId,
                savePaymentMethod: true,
            });

            window.history.pushState({ fromStripe: true }, "",  "/order-cancel");

            window.location.href = response.data.url;
        } catch (error) {
            console.error("Error starting checkout:", error);
            alert("Failed to start checkout. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    // Move to cart
    const handleGuestCheckout = async () => {
        try {
            setLoading(true);
            const cartItems = cartLib.loadGuestCart();
            //  Save the current cart so the success page can access it later
            localStorage.setItem("guestOrder", JSON.stringify({ items: cartItems }));

            const items = cartItems.map((item) => ({
                name: item.name,
                unitAmount: Math.round(item.price * 100),
                currency: "usd",
                quantity: item.quantity,
            }));

            const response = await api.post("/payments/create-checkout-session", {
                items,
                customerEmail: localStorage.getItem("userEmail") || null,
                savePaymentMethod: false,
            });

            window.history.pushState({ fromStripe: true }, "",  "/order-cancel");

            window.location.href = response.data.url;
        } catch (error) {
            console.error("Error starting checkout:", error);
            alert("Failed to start checkout. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const clearGuestCart = () => {
        if (!isGuest) return;
        const ok = window.confirm('Clear your guest cart? This will remove all items stored on this device.');
        if (!ok) return;
        cartLib.saveGuestCart([]);
        setCartItems([]);
    };

    const proceedToCheckout = async () => {
        if (cartItems.length === 0) return;

        if (!localStorage.getItem("authToken")) {
            setShowCheckoutPrompt(true);
            return;
        }
        await handleUserCheckout();
    }

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar/>

            <div className="container mx-auto px-4 py-8">
                <div className="mb-6 text-center">
                    <h1 className="text-3xl font-semibold">Your Cart</h1>
                    <p className="text-base-content/60">
                        {'Signed-in cart'}
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <span className="loading loading-spinner loading-lg"/>
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="card bg-base-100 border border-base-300">
                        <div className="card-body items-center text-center">
                            <div className="avatar placeholder mb-4">
                                <div className="indicator">
                                    <ShoppingBag className="w-10 h-10"/>
                                </div>
                            </div>
                            <h3 className="card-title font-normal">Your cart is empty</h3>
                            <p className="text-base-content/70">Browse products and add something you like.</p>
                            <div className="card-actions mt-4">
                                <button onClick={() => navigate('/')} className="btn btn-primary">
                                    Explore Products
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Items */}
                        <div className="lg:col-span-2">
                            <div className="card bg-base-100 border border-base-300">
                                <div className="card-body p-0">
                                    <div className="overflow-x-auto">
                                        <table className="table">
                                            <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th className="w-40">Quantity</th>
                                                <th className="text-right">Price</th>
                                                <th></th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {cartItems.map((it) => {
                                                return (
                                                    <tr key={it.id}>
                                                        <td>
                                                            <div className="flex items-center gap-3">
                                                                <div className="mask mask-squircle w-14 h-14">
                                                                    <img
                                                                        src={
                                                                            it.image ||
                                                                            'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                                                                        }
                                                                        alt={it.name}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium">{it.name}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="join">
                                                                <button
                                                                    className="btn join-item"
                                                                    onClick={() => updateQuantity(it.id, it.quantity - 1)}
                                                                    disabled={it.quantity <= 1}
                                                                >
                                                                    <Minus className="w-4 h-4"/>
                                                                </button>
                                                                <input
                                                                    className="input input-bordered w-16 text-center join-item"
                                                                    readOnly
                                                                    value={it.quantity}
                                                                />
                                                                <button
                                                                    className="btn join-item"
                                                                    onClick={() => updateQuantity(it.id, it.quantity + 1)}
                                                                >
                                                                    <Plus className="w-4 h-4"/>
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td className="text-right">${Number(it.price || 0).toLocaleString()}</td>
                                                        <td className="text-right">
                                                            <button
                                                                className="btn btn-ghost text-error"
                                                                onClick={() => removeItem(it.id)}
                                                                title="Remove item"
                                                            >
                                                                <Trash2 className="w-5 h-5"/>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div>
                            <div className="card bg-base-100 border border-base-300 sticky top-20">
                                <div className="card-body">
                                    <h3 className="card-title">Order Summary</h3>
                                    <div className="mt-2 space-y-2">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>${Number(total || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-base-content/60 mt-3">
                                        Shipping and total calculated at checkout.
                                    </p>
                                    <div className="card-actions mt-4">
                                        <button
                                            className="btn btn-primary w-full"
                                            disabled={cartItems.length === 0}
                                            onClick={proceedToCheckout}
                                        >
                                            Pay with Stripe
                                        </button>
                                        <button
                                            className="btn btn-outline w-full"
                                            onClick={() => navigate("/orders")}
                                        >
                                            Continue Shopping
                                        </button>

                                        { /* {isGuest && (
                                            <div className="w-full">
                                                <div className="alert alert-info my-3">
                                                    <div>
                                                        <span className="font-medium">You're browsing as a guest.</span>
                                                        <div className="text-sm text-base-content/70">Sign in to save your cart across devices.</div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        className="btn btn-ghost btn-sm flex-1"
                                                        onClick={() => navigate('/login?redirect=/checkout')}
                                                    >
                                                        Sign in to save
                                                    </button>
                                                    <button
                                                        className="btn btn-error btn-sm"
                                                        onClick={clearGuestCart}
                                                    >
                                                        Clear guest cart
                                                    </button>
                                                </div>
                                            </div>
                                        )} */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* added guest checkout prompt model */}
            {showCheckoutPrompt && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-md w-full text-center space-y-4">
                        <h2 className="text-xl font-semibold">
                            Members get free shipping on orders $50+
                        </h2>
                        <p className="text-base-content/70">
                            Sign in to save your cart and enjoy exclusive member benefits.
                        </p>

                        <div className="flex flex-col gap-2 mt-4">
                            <button
                                className="btn btn-primary w-full"
                                onClick={() => navigate("/login")}
                            >
                                Login
                            </button>
                            <button
                                className="btn btn-outline w-full"
                                onClick={() => navigate("/signup")}
                            >
                                Sign Up
                            </button>
                            <button
                                className="btn btn-neutral w-full"
                                onClick={() => {
                                    setShowCheckoutPrompt(false);
                                    handleGuestCheckout();
                                }}
                            >
                                Continue as Guest
                            </button>
                        </div>
                        <button
                            className="btn btn-sm btn-ghost mt-3"
                            onClick={() => setShowCheckoutPrompt(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;