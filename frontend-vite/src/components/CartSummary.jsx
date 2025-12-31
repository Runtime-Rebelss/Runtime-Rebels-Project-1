import React from 'react';
import cartLib from "../lib/cart.js";
import { Link } from 'react-router-dom';

const CartSummary = ({items = [], onCheckout, onContinue, loading = false, userId = null}) => {
    return (
        <div>
            <div className="card bg-base-100 border border-base-300 sticky top-20">
                <div className="card-body">
                    <h3 className="card-title">Order Summary</h3>
                    <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>${Number(cartLib.calcTotal(items) || 0).toLocaleString()}</span>
                        </div>
                    </div>
                    <p className="text-sm text-base-content/60 mt-3">
                        Shipping and total calculated at checkout.
                    </p>
                    <div className="card-actions mt-4">
                        {userId ? (
                        <Link to="/checkout" className="w-full">
                        <button
                            className="btn btn-primary w-full"
                            disabled={!Array.isArray(items) || items.length === 0 || loading}
                        >
                            {loading ? 'Processing…' : 'Proceed to Checkout'}
                        </button>
                        </Link>
                        ) : (
                        <button
                            className="btn btn-primary w-full"
                            onClick={() => onCheckout ? onCheckout() : null}>Pay with Stripe
                            </button>
                    )}

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
