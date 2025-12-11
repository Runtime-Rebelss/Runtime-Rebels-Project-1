import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { XCircle } from "lucide-react";

const OrderCancelPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Replace history so "back" won't return to Stripe or cart
        window.history.replaceState({}, "", "/order-cancel");

        // Also prevent going back further — optional extra safety
        window.addEventListener("popstate", (event) => {
            navigate("/order-cancel", { replace: true });
        });

        return () => window.removeEventListener("popstate", () => {});
    }, [navigate]);

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar hideCartCount={true} />

            <div className="max-w-4xl mx-auto px-4 py-10 text-center">
                <div className="bg-red-100 text-red-800 p-4 rounded mb-8">
                    <h1 className="text-2xl font-semibold">Payment Canceled</h1>
                    <p>Your checkout session was canceled.</p>
                </div>

                <div className="bg-base-100 border border-base-300 p-6 rounded-lg shadow text-center space-y-4">
                    <XCircle className="w-14 h-14 mx-auto text-error" />
                    <p className="text-base-content/70">
                        Don’t worry — your cart items are still saved.
                    </p>

                    <div className="flex justify-center gap-4 mt-6">
                        <button className="btn btn-primary" onClick={() => navigate("/cart")}>
                            Return to Cart
                        </button>
                        <button className="btn btn-outline" onClick={() => navigate("/")}>
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderCancelPage;

