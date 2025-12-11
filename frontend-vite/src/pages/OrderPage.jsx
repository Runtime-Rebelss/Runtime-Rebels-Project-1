import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../lib/axios";
import orderLib from "../lib/orders.js";
import orderService from "../lib/orderService";
import OrderCard from "../components/OrderCard";
import Cookies from "js-cookie"

const OrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const userId = Cookies.get("userId");
    const adminEmail = Cookies.get("adminEmail");
    const isAdmin = adminEmail === "admin@gmail.com";

    const hydrateOrders = async (orders) => {
        const results = [];

        for (const order of orders) {
            const items = [];
            const productIds = order.productIds || [];
            const quantities = order.quantity || [];
            const finalPrices = order.totalPrice || [];

            for (let i = 0; i < productIds.length; i++) {
                try {
                    const { data: product } = await api.get(`/products/${productIds[i]}`);
                    items.push({
                        id: productIds[i],
                        name: product.name,
                        image: product.imageUrl,
                        price: Number(finalPrices[i]),
                        quantity: Number(quantities[i])
                    });
                } catch (err) {
                    console.error("Error loading product:", err);
                }
            }

            results.push({
                ...order,
                items,
                total: items.reduce((s, it) => s + it.price * it.quantity, 0)
            });
        }

        return results;
    };

    useEffect(() => {
        const controller = new AbortController();

        const fetchOrders = async () => {
            try {
                setLoading(true);

                // admin sees all orders
                if (isAdmin) {
                    const { data } = await api.get("/orders", { signal: controller.signal });
                    const hydrated = await hydrateOrders(data);
                    setOrders(hydrated);
                    return;
                }

                // user only sees their orders when signed in
                if (userId) {
                    const userOrders = await orderService.fetchOrders(controller.signal);
                    setOrders(Array.isArray(userOrders) ? userOrders : []);
                    return;
                }

                // guest sees local storage orders
                const guestOrders = orderLib.readLocalOrders();
                setOrders(Array.isArray(guestOrders) ? guestOrders : []);
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
    }, [isAdmin, userId]);

    const revOrder = orders.slice().reverse();

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-semibold mb-6">
                    {isAdmin ? "All Orders" : "Your Orders"}
                </h1>

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
                        {revOrder.map((order) => {
                            const orderId = order.id || order._id || "-";
                            return <OrderCard key={orderId} order={order} />;
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
export default OrderPage;