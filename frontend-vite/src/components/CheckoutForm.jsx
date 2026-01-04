import React, {useRef, useState} from 'react';
import {PaymentElement, ShippingAddressElement, useElements, useStripe} from '@stripe/react-stripe-js';
import Cookies from "js-cookie"

const CheckoutForm = ({clientSecret, amount}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [succeeded, setSucceeded] = useState(false);
    const isMountedRef = useRef(true);
    const userId = Cookies.get("userId");
    const [message, setMessage] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        if (!stripe || !elements) {
            setMessage("Stripe has not loaded yet. Please try again later.");
            setLoading(false);
            return;
        }
        setLoading(true);
        const cardElement = elements.getElement(CardElement);

        const {error: stripeError, paymentIntent} = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement

            },
        });

        if (paymentIntent && paymentIntent.status === 'succeeded') {
            setMessage("YAYYYY")
        } else {
            setMessage(`payment status: ${paymentIntent?.status || 'unknown'}`);
        }
        setLoading(false);
    }

    const paymentElementOptions = {
        layout: {
            type: "accordion",
            defaultCollapsed: false,
            radios: true,
            spacedAccordionItems: true,
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <PaymentElement id="payment-element" options={paymentElementOptions}/>
            </div>

            <button disabled={loading} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
                {loading ? "Processing..." : `Pay $${(amount / 100).toFixed(2)}`}
            </button>

            {message && <div className="mt-4 text-yellow-600">{message}</div>}
        </form>
    )
}

export default CheckoutForm;