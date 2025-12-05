import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import Navbar from "../components/Navbar";
import orderService from "../lib/orderService";
import OrderCard from "../components/OrderCard";

const OrderDetailsPage = () => {
    const [order, setOrder] = useState(null);
    const {orderId} = useParams();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        const fetchOrder = async () => {
            try {
                setLoading(true);
                const { order, products, items } = await orderService.fetchOrderDetails(orderId, controller.signal);
                if (order) {
                    // Ensure order.items is populated with the products/items array
                    const orderWithItems = {
                        ...order,
                        items: items ?? products ?? order.items ?? []
                    };
                    setOrder(orderWithItems);
                } else {
                    setOrder(null);
                }
            } catch (err) {
                if (err?.code !== "ERR_CANCELED") {
                    console.warn("orders fetch failed:", err);
                }
            } finally {
                setLoading(false);
            }
        };

        // initial fetch
        fetchOrder();

        const handler = () => fetchOrder();
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

    if (!order) return <div className="p-6 text-center">Order not found</div>;

    return (
        <div>
            <Navbar/>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-semibold mb-6">Order Details</h1>
                <div className="space-y-6">
                    <OrderCard order={order} detailsPage={true} />
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;
