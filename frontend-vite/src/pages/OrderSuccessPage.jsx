import React, {useEffect, useState, useRef} from "react";
import {useNavigate} from "react-router-dom";
import Navbar from "../components/Navbar";
import orderLib from "../lib/orders.js";
import Cookies from "js-cookie";
import {confirmOrder} from "../lib/confirmOrder";

const OrderSuccessPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [confirmation, setConfirmation] = useState("");
    const navigate = useNavigate();
    const fullName = Cookies.get("fullName") || "Valued Customer";
    const userId = Cookies.get("userId");
    const userEmail = Cookies.get("userEmail");
    const didRun = useRef(false);

    useEffect(() => {
        // Stop from running twice
        if (didRun.current) return;
        didRun.current = true;

        (async () => {
            try {
                await confirmOrder({
                    fullName,
                    userId,
                    userEmail,
                    setCartItems,
                    setTotal,
                    setConfirmation,
                });
            } catch (err) {
                console.warn('confirmOrder failed', err);
            }

            // Guest fallback: if confirmOrder did not populate items for guests,
            // try reading pendingGuestOrder or guestCart from localStorage.
            if (!userId) {
                try {
                    let raw = localStorage.getItem('pendingGuestOrder');
                    if (!raw) raw = localStorage.getItem('guestCart');
                    if (raw) {
                        const parsed = JSON.parse(raw);
                        let items = [];
                        if (Array.isArray(parsed)) items = parsed;
                        else if (Array.isArray(parsed?.items)) items = parsed.items;

                        if (items.length > 0 && cartItems.length === 0) {
                            // Normalize items
                            const normalized = items.map(it => {
                                const unitAmt = it.unitAmount || it.unit_amount || it.unitAmt;
                                const price = unitAmt ? (Number(unitAmt) / 100) : (it.price ? Number(it.price) : 0);
                                return {
                                    id: it.id || it.productId || it._id || null,
                                    productId: it.productId || it.id || it._id || null,
                                    name: it.name || it.productName || 'Item',
                                    image: it.image || it.imageUrl || '',
                                    price: Number(isFinite(price) ? price : 0),
                                    quantity: Number(it.quantity || it.qty || 1) || 1,
                                };
                            });

                            setCartItems(normalized);
                            const t = normalized.reduce((s, it) => s + (Number(it.price || 0) * Number(it.quantity || 1)), 0);
                            setTotal(t);

                            // If we don't have a confirmation number yet, create a fallback
                            setConfirmation(prev => prev || ('GUEST-' + Math.floor(100000 + Math.random() * 900000)));
                        }
                    }
                } catch (err) {
                    console.warn('Failed to read guest pending order from localStorage', err);
                }
            }
        })();
    }, [fullName, userId, userEmail]);

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
                        Confirmation Number: {" "}
                        <span className="font-bold text-primary">{confirmation}</span>
                    </p>

                    {cartItems.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                <tr>
                                    <th>Product</th>
                                    <th className="text-center">Qty</th>
                                    <th className="text-right">Price</th>
                                </tr>
                                </thead>
                                <tbody>
                                {cartItems.map((it, index) => (
                                    <tr key={it.productId || it.id || index}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="mask mask-squircle w-14 h-14">
                                                    <img src={it.image} alt={it.name || 'Product image'} className="object-cover" />
                                                </div>
                                                <span className="font-medium">{it.name}</span>
                                            </div>
                                        </td>
                                        <td className="text-center">{it.quantity}</td>
                                        <td className="text-right">
                                            ${(Number(it.price || 0) * Number(it.quantity || 1)).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="border-t">
                                    <td></td>
                                    <td className="text-right font-semibold">Total:</td>
                                    <td className="text-right font-semibold">
                                        {orderLib.fmtUSD(total)}
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-center gap-4">
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            orderLib.clearDedupeKey()
                            navigate("/")}}
                    >
                        Continue Shopping
                    </button>

                    <button
                        className="btn btn-outline"
                        onClick={() => {
                            orderLib.clearDedupeKey()
                            navigate("/orders")}}
                    >
                        View My Orders
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
