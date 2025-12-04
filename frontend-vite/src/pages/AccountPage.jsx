import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../lib/axios";

const AccountPage = () => {
    const userEmail = localStorage.getItem("userEmail");
    const userId = localStorage.getItem("userId");
    const firstName = localStorage.getItem("firstName");

    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoadingOrders(false);
            return;
        }

        const ac = new AbortController();

        (async () => {
            try {
                // Adjust endpoint if your backend uses a different one
                const res = await api.get(`/orders/user/${encodeURIComponent(userId)}`, {
                    withCredentials: true,
                    signal: ac.signal,
                });

                setOrders(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Failed to load orders:", err);
                setOrders([]);
            } finally {
                setLoadingOrders(false);
            }
        })();

        return () => ac.abort();
    }, [userId]);

    const formatDate = (date) => {
        const d = new Date(date);
        if (isNaN(d.getTime())) return "Unknown date";
        return d.toLocaleDateString();
    };

    const getTotal = (order) => {
        const total =
            order?.totalAmount ??
            order?.total ??
            order?.totalPrice ??
            order?.orderTotal ??
            0;
        return `$${Number(total).toFixed(2)}`;
    };

    const getItemCount = (order) => {
        const products = order?.products || order?.productIds || [];
        return Array.isArray(products) ? products.length : 0;
    };

    return (
        <div>
            <Navbar />

            <main className="container mx-auto px-4 py-10">
                {/* Greeting */}
                <h1 className="text-4xl font-bold mb-6">
                    My Account
                </h1>

                {!userId ? (
                    <p className="text-lg">
                        You are not signed in.{" "}
                        <a href="/login" className="link link-primary">
                            Sign in
                        </a>
                        .
                    </p>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* YOUR PAYMENTS */}
                        <section className="card bg-base-200 shadow-md hover:shadow-lg transition">
                            <div className="card-body">
                                <h2 className="card-title">Your Payments</h2>
                                <p className="text-sm text-base-content/70 mb-3">
                                    Recent payment activity from your orders.
                                </p>

                                {loadingOrders ? (
                                    <p className="text-sm text-base-content/70">Loading…</p>
                                ) : orders.length === 0 ? (
                                    <p className="text-sm text-base-content/70">
                                        You haven&apos;t placed any orders yet.
                                    </p>
                                ) : (
                                    <ul className="space-y-3 max-h-56 overflow-y-auto text-sm">
                                        {orders.slice(0, 5).map((order) => (
                                            <li
                                                key={order._id || order.id}
                                                className="border-b border-base-300 pb-2 last:border-0"
                                            >
                                                <div className="font-semibold">{getTotal(order)}</div>
                                                <div className="text-base-content/70">
                                                    {formatDate(order?.createdAt || order?.date)}
                                                </div>
                                                <div className="text-xs text-base-content/60">
                                                    {getItemCount(order)} items
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </section>

                        {/* YOUR ORDERS */}
                        <section
                            className="card bg-base-200 shadow-md hover:shadow-lg transition cursor-pointer"
                            onClick={() => (window.location.href = "/orders")}
                        >
                            <div className="card-body">
                                <h2 className="card-title">Your Orders</h2>
                                <p className="text-sm text-base-content/70">
                                    View and track all your orders.
                                </p>
                                <button className="btn btn-primary btn-sm mt-3 w-fit">
                                    View Orders
                                </button>
                            </div>
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AccountPage;
