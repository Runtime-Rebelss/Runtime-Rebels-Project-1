import React, {useEffect, useState} from "react";
import Cookies from "js-cookie";
import addressService from "../lib/addresses.js";
import {Link} from "react-router-dom";
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import CheckoutCard from "./CheckoutCard.jsx";
import PaymentForm from "./CheckoutForm.jsx";
import checkoutLib from "../lib/checkout.js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Checkout = ({cartItems = [], onUpdateQuantity, onRemove, handleCheckout}) => {
    const [showCheckoutPrompt, setShowCheckoutPrompt] = useState(false);
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState(null);
    const [amountInput, setAmountInput] = useState('');
    const [amount, setAmount] = useState(null);
    const [clientSecret, setClientSecret] = useState('');

    const fullName = Cookies.get("fullName") || "Guest";

    const handleStartPayment = async () => {
        if (!amountInput || isNaN(amountInput) || Number(amountInput) <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        const convertedAmount = Math.round(Number(amountInput) * 100); // Convert to cents
        setLoading(true);

        try {
            const payload = {
                amount: convertedAmount,
                currency: "usd",
                description: "custom amount payment",
            };

            // Include shipping/address info if available
            if (address) {
                payload.shippingName = address.name;
                payload.shippingPhone = address.phoneNumber;
                payload.shippingAddressLine1 = address.address;
                payload.shippingAddressLine2 = address.unit;
                payload.shippingCity = address.city;
                payload.shippingState = address.state;
                payload.shippingPostalCode = address.zipCode;
                payload.shippingCountry = address.country || 'US';
            }

            const res = await checkoutLib.createPaymentIntent(payload);
            setClientSecret(res.data.clientSecret);
            setAmount(convertedAmount);
        } catch (error) {
            console.error('Error creating payment intent:', error);
            alert('Failed to initiate payment. Please try again.');
        } finally {
            setLoading(false);
        }
    }

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

        return () => {
            cancelled = true;
        };
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
                <Link className="link link-hover link-accent" to="/checkout/address">Change</Link>
            </div>
            {/* DELIVERY ADDRESS */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6'>
                {address ? (
                    <div className="mb-4">
                        {renderAddressLine(address)}
                    </div>
                ) : (
                    <div className="mb-4 text-sm text-base-content/60">
                        No delivery address set. <Link to="/account/add/address" className="underline">Add an
                        address</Link> to prefill checkout.
                    </div>
                )}
            </div>
            {/* PAYMENT METHOD - Implement Stripe here */}
            <div className="text-1xl font-semibold mb-6">
                Payment method
                {/* NO CLIENT SECRET */ }
                {!clientSecret && (
                    <div className="container mx-auto px-4 py-8">
                        <label>Enter Amount:</label>
                        <input type="number" value={amountInput} onChange={(e) => setAmountInput(e.target.value)}
                               className="border p-2 ml-2"/>
                    </div>
                )}
                {/* CLIENT SECRET EXISTS */}
                {clientSecret && (
                    <div className="container mx-auto px-4 py-8">
                        <Elements stripe={stripePromise} options={{clientSecret}}>
                            <PaymentForm clientSecret={clientSecret} amount={amount}/>
                        </Elements>
                    </div>
                )}
            </div>
            {/* PRODUCT(S) TO BE PURCHASED */}
            <div>
                {items.map((it) => (
                    <CheckoutCard
                        key={it.productId || it.id}
                        item={it}
                        onUpdateQuantity={onUpdateQuantity}
                        onRemove={onRemove}

                    />
                ))}
                <button onClick={handleStartPayment} className="bg-blue-500 text-white px-4 py-2 ml-4">Pay
                </button>
            </div>
        </div>
    )
}

export default Checkout;
