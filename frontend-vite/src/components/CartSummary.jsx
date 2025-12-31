import React from 'react';
import cartLib from "../lib/cart.js";

// Accept onCheckout and onContinue callbacks so parent can control actions
const CartSummary = ({items = [], onCheckout, onContinue, loading = false, userId = null}) => {
    const subtotal = (Array.isArray(items) ? items : []).reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0);
    const taxRate = 0.07; // Example tax rate of 7%
    const taxes = subtotal * taxRate;
    const total = subtotal + taxes;

    const handleClick = async () => {
        if (onCheckout) {
            await onCheckout();
            return;
        }

        try {
            const url = await cartLib.handleCheckout(userId);
            if (url) window.location.href = url;
        } catch (err) {
            console.error('Checkout failed', err);
            alert('Checkout failed');
        }
    };

    return (
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
                            disabled={!Array.isArray(items) || items.length === 0 || loading}
                            onClick={handleClick}
                        >
                            {loading ? 'Processing…' : 'Pay with Stripe'}
                        </button>
                        <button
                            className="btn btn-outline w-full"
                            onClick={() => onContinue ? onContinue() : null}
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CartSummary;
