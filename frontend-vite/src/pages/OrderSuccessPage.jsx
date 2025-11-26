import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import cartLib from "../lib/cart";
import api from '../lib/axios';

const OrderSuccessPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [confirmation, setConfirmation] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        // Generate random confirmation number
        const randomCode = "SCZ-" + Math.floor(100000 + Math.random() * 900000);
        setConfirmation(randomCode);
        const params = new URLSearchParams(window.location.search);
        const status = params.get('status');

        // Try to load the last order cart first (fallback to guestCart)
        const savedOrder = localStorage.getItem("lastOrderCart");
        const savedCart = savedOrder
            ? JSON.parse(savedOrder).items || []
            : JSON.parse(localStorage.getItem("guestCart") || "{}").items || [];

        setCartItems(savedCart);
        const totalPrice = savedCart.reduce(
            (sum, it) => sum + (it.price || 0) * (it.quantity || 0),
            0
        );
        setTotal(totalPrice);
        const userId = localStorage.getItem("userId");
        api.post(`/orders/confirm/${userId}`);


        // Clear only guestCart but leave lastOrderCart (so data persists for success)
        localStorage.removeItem("guestCart");
        window.dispatchEvent(new Event("cart-updated"));
    }, []);


    return (
        <div className="min-h-screen bg-base-200">
            <Navbar hideCartCount={true} />

            <div className="max-w-4xl mx-auto px-4 py-10 text-center">
                <div className="bg-green-100 text-green-800 p-4 rounded mb-8">
                    <h1 className="text-2xl font-semibold">Payment successful!</h1>
                    <p>Thank you for your purchase.</p>
                </div>

                <div className="bg-base-100 border border-base-300 p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Order Confirmation</h2>
                    <p className="text-sm text-base-content/70 mb-8">
                        Confirmation Number:{" "}
                        <span className="font-bold text-primary">{confirmation}</span>
                    </p>

                    {/* Order summary table */}
                    {cartItems.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                <tr>
                                    <th>Product</th>
                                    <th className="w-32 text-center">Quantity</th>
                                    <th className="text-right">Price</th>
                                </tr>
                                </thead>
                                <tbody>
                                {cartItems.map((it, idx) => (
                                    <tr key={idx}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="mask mask-squircle w-14 h-14">
                                                    <img
                                                        src={it.image}
                                                        alt={it.name}
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{it.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-center">{it.quantity}</td>
                                        <td className="text-right">
                                            ${(it.price * it.quantity).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="border-t">
                                    <td></td>
                                    <td className="text-right font-semibold">Total:</td>
                                    <td className="text-right font-semibold">
                                        ${total.toFixed(2)}
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-center gap-4">
                    <button className="btn btn-primary" onClick={() => {
                        localStorage.removeItem("lastOrderCart");
                        navigate("/");
                    }}>
                        Continue Shopping
                    </button>
                    <button className="btn btn-outline" onClick={() => navigate("/orders")}>
                        View My Orders
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
