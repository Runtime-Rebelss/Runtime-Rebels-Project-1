import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import cartLib from '../lib/cart';
import checkoutImage from '../assets/Scamazon_Coming_Soon.png';
import api from '../lib/axios';
import toast from 'react-hot-toast'

const CheckoutPage = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setStatus(params.get("status"));
    }, [location.search]);

    useEffect(() => {
        if (status === "success") {
            toast.success("YAYYYY");
            // Remove item from cart!
            const userId = localStorage.getItem("userId");
            localStorage.removeItem('guestCart');
            window.dispatchEvent(new Event('cart-updated'));
            // Not creating an order!!
            api.post(`/payments/confirm/${userId}`);
            navigate('/orders', { replace: true });
        }
    }, [status, navigate]);

    // checkout with Stripe
    const handleCheckout = async () => {
        try {
            setLoading(true);
            const userId = localStorage.getItem('userId');
            // get items from local cart
            const cartItems = api.get(`/carts/${userId}`);
            if (!cartItems || cartItems.length === 0) {
                alert("Your cart is empty!");
                setLoading(false);
                return;
            }

            // convert to backend format
            const items = cartItems.map(item => ({
                name: item.name,
                unitAmount: Math.round(item.price * 100), // $ → cents
                currency: "usd",
                quantity: item.quantity,
            }));

            // call backend, create stripe checkout sesh
            const response = await api.post("/payments/create-checkout-session", { items });

            // redirect to stripe checkout
            const { url } = response.data;
            window.location.href = url;
        } catch (error) {
            console.error("Error starting checkout:", error);
            alert("Failed to start checkout. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="max-w-6xl mx-auto p-6 flex flex-col lg:flex-row gap-10">
                {status === "cancel" && (
                    <div className="bg-red-100 text-red-800 p-3 rounded mb-4 w-full text-center">
                        Payment canceled. You can try again below.
                    </div>
                )}

                {/* Left side: image */}
                <div className="flex-1 flex items-center justify-center">
                    <img
                        src={checkoutImage}
                        alt="Checkout Page"
                        className="max-w-sm w-full h-auto object-contain"
                    />
                </div>

                {/* Right side: button + instructions */}
                <div className="flex-1 flex flex-col justify-center items-center text-center">
                    <h1 className="text-2xl font-semibold mb-4">Ready to Checkout?</h1>
                    <p className="text-gray-600 mb-6">
                        Click below to pay securely through Stripe. You can choose Standard or Expedited shipping at checkout.
                    </p>

                    <button
                        onClick={handleCheckout}
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? "Redirecting..." : "Pay with Stripe"}
                    </button>
                </div>
            </div>
        </>
    );
};

export default CheckoutPage;
