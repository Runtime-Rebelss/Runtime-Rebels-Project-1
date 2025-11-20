import React, {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {ShoppingBag} from "lucide-react";
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


const OrderDetailsPage = () => {
    const [orders, setOrders] = useState([]);
    const {orderId} = useParams();
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const controller = new AbortController();

        const fetchOrders = async () => {
            try {
                setLoading(true);
                const {data} = await api.get(`/orders/details/${encodeURIComponent(orderId)}`, {
                    signal: controller.signal,
                });
                setOrders(data);
            } catch (err) {
                if (err?.code !== "ERR_CANCELED") {
                    console.warn("orders fetch failed:", err);
                }
            } finally {
                setLoading(false);
            }
        };

        // initial fetch
        fetchOrders();

        const handler = () => fetchOrders();
        window.addEventListener("cart-updated", handler);
        window.addEventListener("order-updated", handler);

        return () => {
            controller.abort();
            window.removeEventListener("cart-updated", handler);
            window.removeEventListener("order-updated", handler);
        };
    }, [orderId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <span className="loading loading-spinner loading-xl"></span>
            </div>
        )
    }

    if (!orders) return <div className="p-6 text-center">Order not found</div>;

    const total =
        orders.items ??
        (orders.items || []).reduce(
            (s, it) => s + Number(it.price || 0) * Number(it.quantity || 1),
            0
        );

    const userEmail = localStorage.getItem("userEmail");

    return (
        <div>
            <Navbar/>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-semibold mb-6">Order Details</h1>
                <div className="space-y-6">
                    <div className="card bg-base-100 border border-base-300 overflow-hidden">
                        <div
                            className="bg-base-200/60 border border-base-300 px-4 py-3 grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                            <div>
                                <div className="font-medium">Order Placed</div>
                                <div className="opacity-70">
                                    {fmtDate(orders.createdAt || Date.now())}
                                </div>
                            </div>
                            <div>
                                <div className="font-medium">Total</div>
                                <div className="opacity-70">{fmtUSD(total)}</div>
                            </div>
                            <div>
                                <div className="font-medium">Ship to</div>
                                <div className="opacity-70">
                                    {orders.shipTo?.fullName || userEmail}
                                </div>
                            </div>
                            <div className="md:text-right">
                                <div className="font-medium">Order ID</div>
                                <div className="opacity-70">{orderId}</div>
                            </div>
                        </div>

                        <div className="p-4 divide-y divide-base-300">
                            {(orders.items || []).map((it, i) => (
                                <div
                                    key={`${it.id || it.productId || i}-${orderId}`}
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
                                            Qty: {orders.quantity?.[i]} • {""}
                                            {fmtUSD(orders.totalPrice?.[i] || product.price)}
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => navigate(`/product/${it.id || it.productId || ""}`)}
                                    >
                                        View item
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;
