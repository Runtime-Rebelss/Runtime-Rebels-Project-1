import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import checkoutLib from '../lib/checkout.js';
import Cookies from 'js-cookie';
import PaymentForm from '../components/CheckoutForm.jsx';
import api from '../lib/axios.js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentPage = () => {
    const [amountInput, setAmountInput] = useState('');
    const [amount, setAmount] = useState(null);
    const [clientSecret, setClientSecret] = useState('');
    const [loading, setLoading] = useState(true);
    const userId = Cookies.get('userId');

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

            // If logged in, try to fetch default address and include
            if (userId) {
                try {
                    const { data: addresses } = await api.get(`/address/user/${encodeURIComponent(userId)}`);
                    if (Array.isArray(addresses) && addresses.length > 0) {
                        const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
                        if (defaultAddr) {
                            payload.shippingName = defaultAddr.name;
                            payload.shippingPhone = defaultAddr.phoneNumber;
                            payload.shippingAddressLine1 = defaultAddr.address;
                            payload.shippingAddressLine2 = defaultAddr.unit;
                            payload.shippingCity = defaultAddr.city;
                            payload.shippingState = defaultAddr.state;
                            payload.shippingPostalCode = defaultAddr.zipCode;
                            payload.shippingCountry = defaultAddr.country || 'US';
                        }
                    }
                } catch (err) {
                    console.warn('Unable to fetch default address for payment page', err);
                }
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

    return (
        <div>Checkout

        {!clientSecret && (
            <div className="container mx-auto px-4 py-8">
                <label>Enter Amount:</label>
                <input type="number" value={amountInput} onChange={(e) => setAmountInput(e.target.value)} className="border p-2 ml-2" />
                <button onClick={handleStartPayment} className="bg-blue-500 text-white px-4 py-2 ml-4">Pay</button>
            </div>
        )}

        {clientSecret && (
            <div className="container mx-auto px-4 py-8">
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <PaymentForm clientSecret={clientSecret} amount={amount} />
                </Elements>
            </div>
        )}

        </div>
    )
}

export default PaymentPage;