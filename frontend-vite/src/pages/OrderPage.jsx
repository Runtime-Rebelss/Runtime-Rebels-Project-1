import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../lib/axios";

const fmtUSD = (n) =>
    `$${Number(n || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
const fmtDate = (d) =>
    new Date(d).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

const OrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // OPTIONAL: load local orders (delete if you already set orders elsewhere)
    useEffect(() => {
        try {
            const raw = localStorage.getItem("guestOrders");
            const list = raw ? JSON.parse(raw) : [];
            setOrders(Array.isArray(list) ? list : []);
        } catch {
            setOrders([]);
        }
    }, []);

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-semibold mb-6">Your Orders</h1>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <span className="loading loading-spinner loading-lg" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="card bg-base-100 border border-base-300">
                        <div className="card-body items-center text-center">
                            <ShoppingBag className="w-10 h-10 mb-3" />
                            <h3 className="card-title font-normal">No orders yet</h3>
                            <p className="text-base-content/70 mb-3">
                                When you place an order, it will appear here.
                            </p>
                            <button className="btn btn-primary" onClick={() => navigate("/")}>
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const total =
                                order.total ??
                                (order.items || []).reduce(
                                    (s, it) =>
                                        s +
                                        Number(it.price || 0) * Number(it.quantity || 1),
                                    0
                                );

                            return (
                                <div
                                    key={order.id}
                                    className="card bg-base-100 border border-base-300 overflow-hidden"
                                >
                                    <div className="bg-base-200/60 border border-base-300 px-4 py-3 grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                                        <div>
                                            <div className="font-medium"> Order Placed</div>
                                            <div className="opacity-70">
                                                {fmtDate(order.createdAt || Date.now())}
                                            </div>
                                        </div>
                                    <div>
                                        <div className="font-medium"> Total</div>
                                        <div className="opacity-70">{fmtUSD(total)}</div>
                                    </div>
                                    <div>
                                        <div className="font-medium"> Ship to</div>
                                        <div className="opacity-70"></div>
                                        {order.shipTo?.fullName || "Guest"}
                                    </div>
                                    <div className="md:text-right">
                                        <div className="font-medium"> Order Placed</div>
                                        <div className="opacity-70"> {order.id || "-"}</div>
                                    </div>
                                </div>

                                    <div className="p-4 divide-y divide-base-300">
                                        {(order.items || []).map((it, i) => (
                                            <div
                                                key={(it.id || it.productId || i) + String(order.id)}
                                                className="py-4 flex items-center gap-4"
                                            >
                                                <div className="w-20 h-20 bg-base-200 rounded overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={
                                                            it.image ||
                                                            "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=70"
                                                        }
                                                        alt={it.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium truncate">{it.name}</div>
                                                    <div className="text-sm opacity-70">
                                                        Qty: {it.quantity} •{" "}
                                                        {fmtUSD(
                                                            Number(it.price || 0) * Number(it.quantity || 1)
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    className="btn btn-outline btn-sm"
                                                    onClick={() =>
                                                        navigate(`/products/${it.id || it.productId || ""}`)
                                                    }
                                                >
                                                    View item
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderPage;
