import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import Navbar from "../components/Navbar";
import orderService from "../lib/orderService";
import OrderCard from "../components/OrderCard";

const OrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const controller = new AbortController();

        const fetchOrders = async () => {
            try {
                setLoading(true);
                const orders = await orderService.fetchOrders(controller.signal);
                setOrders(Array.isArray(orders) ? orders : [orders]);
            } catch (err) {
                if (err?.code !== "ERR_CANCELED") {
                    console.warn("orders fetch failed:", err);
                    setOrders([]);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();

        const handler = () => fetchOrders();
        window.addEventListener("cart-updated", handler);
        window.addEventListener("order-updated", handler);

        return () => {
            controller.abort();
            window.removeEventListener("cart-updated", handler);
            window.removeEventListener("order-updated", handler);
        };
    }, []);

    const revOrder = orders.slice().reverse();

    {/* Show loading spinner while fetching orders */}
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <span className="loading loading-spinner loading-xl"></span>
            </div>
        );
    }

    {/* Show empty state if no orders */}
    if (orders.length === 0) {
        return (
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
        );
    }

    return (
        <div>
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-semibold mb-6">Your Orders</h1>
                <div className="space-y-6">

                    {/* Generate OrderCard components for each order */}
                    {revOrder.map((order) => {
                        const orderId = order.id || order._id || "-";
                        return (
                            <OrderCard key={orderId} order={order} />
                        );
                    })}

                </div>
            </div>
        </div>
    );
};
export default OrderPage;