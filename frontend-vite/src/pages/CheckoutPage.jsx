import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import cartLib from '../lib/cart';
import checkoutImage from '../assets/Scamazon_Coming_Soon.png';
import api from '../lib/axios';
import toast from 'react-hot-toast'

const hasSaved = new Set();

const CheckoutPage = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const hasRunRef = useRef(false); //  prevents double saves
    const location = useLocation();
    const [cartItems, setCartItems] = useState([]);

    //  Save order to DB after Stripe redirects back
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const status = params.get('status');
        const sessionId = params.get("session_id");

        if (status === 'success') {
            hasRunRef.current = true;
            hasSaved.add(sessionId);

            const saveOrder = async () => {
                try {
                    console.log("Fetching Stripe session:", sessionId);
                    const stripeRes = await fetch(`http://localhost:8080/api/stripe/session/${sessionId}`);
                    const stripeSession = await stripeRes.json();
                    console.log("Stripe session:", stripeSession);

                    const customerEmail = stripeSession["customer_email"] || stripeSession.customer_details?.email || "guest";
                    const shipping = stripeSession.shipping_details || {};
                    const address = shipping.address || {};
                    const card = stripeSession.payment_method || {};
                    const userId = localStorage.getItem("userId");

                    if (!userId) {
                        const cart = cartLib.loadGuestCart();
                    } else {
                        api.post(`/orders/confirm/${userId}`);
                    }

                    const orderData = {
                        userEmail: customerEmail,
                        productIds: cart.map(it => it.productId),
                        quantities: cart.map(it => it.quantity),
                        totalPrice: cart.reduce((sum, it) => sum + it.price * it.quantity, 0),
                        deliveryName: shipping.name || stripeSession.customer_details?.name || "Guest",
                        deliveryContact: stripeSession.customer_details?.phone || "unknown",
                        deliveryAddress: address.line1 || "N/A",
                        deliveryCity: address.city || "N/A",
                        deliveryState: address.state || "N/A",
                    };
                    console.log("-----MAW------");
                    const response = await fetch('http://localhost:8080/api/orders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(orderData)
                    });
                    const pendingCart = sessionStorage.getItem("pendingCart");

                    if (response.ok) {
                        console.log(' Order saved successfully!');
                        localStorage.removeItem('guestCart');
                    } else {
                        console.error(' Failed to save order:', await response.text());
                    }
                } catch (err) {
                    console.error(' Error posting order:', err);
                }
            };
            saveOrder();
        }
    }, []);

    // checkout with Stripe
    const handleCheckout = async () => {
        try {
            setLoading(true);
            const userId = localStorage.getItem('userId');
            // get items from local cart
            const cartItems = api.get(`/carts/${userId}`);
            if (!cartItems || cartItems.length === 0) {
                alert('Your cart is empty!');
                setLoading(false);
                return;
            }

            const items = cartItems.map(item => ({
                name: item.name,
                unitAmount: Math.round(item.price * 100), // dollars → cents
                currency: 'usd',
                quantity: item.quantity
            }));

            const response = await api.post('/payments/create-checkout-session', { items });
            const { url } = response.data;
            window.location.href = url;
        } catch (error) {
            console.error('Error starting checkout:', error);
            alert('Failed to start checkout. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    //  Determine page status (for banner)
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');

    return (
        <>
            <Navbar />
            <div className="max-w-6xl mx-auto p-6 flex flex-col lg:flex-row gap-10">
                {status === 'success' && (
                    <div className="bg-green-100 text-green-800 p-3 rounded mb-4 w-full text-center">
                        Payment successful! Thank you for your purchase.
                    </div>
                )}
                {status === 'cancel' && (
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
                        Click below to pay securely through Stripe. You can choose Standard or Expedited
                        shipping at checkout.
                    </p>

                    <button
                        onClick={handleCheckout}
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Redirecting...' : 'Pay with Stripe'}
                    </button>
                </div>
            </div>
        </>
    );
};

export default CheckoutPage;
