import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";
import orderLib from "../lib/orders.js";
import orderService from "../lib/orderService";
import Cookies from "js-cookie"

const AccountPage = () => {
    const userEmail = Cookies.get("userEmail");
    const userId = Cookies.get("userId");
    const firstName = Cookies.get("firstName");
    const lastName = Cookies.get("lastName");

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

    const formatDate = (date) => {
        const d = new Date(date);
        if (isNaN(d.getTime())) return "Unknown date";
        return d.toLocaleDateString();
    };

    const getTotal = (order) => {
        return orderLib.fmtUSD(order?.total ?? order?.items?.reduce(
            (s, it) => s + Number(it.price || 0) * Number(it.quantity || 1),
            0
        ));
    };

    const getItemCount = (order) => {
        const products = order?.products || order?.productIds || [];
        return Array.isArray(products) ? products.length : 0;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <span className="loading loading-spinner loading-xl"></span>
            </div>
        );
    }

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

                                {loading ? (
                                    <p className="text-sm text-base-content/70">Loading…</p>
                                ) : orders.length === 0 ? (
                                    <p className="text-sm text-base-content/70">
                                        You haven&apos;t placed any orders yet.
                                    </p>
                                ) : (
                                    <ul className="space-y-3 max-h-56 overflow-y-auto text-sm">
                                        {revOrder.slice(0, 5).map((order) => (
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
                        {/* LOGIN & SECURITY */}
                        <section
                            className="card bg-base-200 shadow-md hover:shadow-lg transition cursor-pointer"
                            onClick={() => (window.location.href = "/account/manage")}
                        >
                            <div className="card-body">
                                <h2 className="card-title">Login & Security</h2>
                                <p className="text-sm text-base-content/70">
                                    Edit login, and name
                                </p>
                                <button className="btn btn-primary btn-sm mt-3 w-fit">
                                    View Login
                                </button>
                            </div>
                        </section>
                        {/* YOUR ADDRESSES */}
                        <section
                            className="card bg-base-200 shadow-md hover:shadow-lg transition cursor-pointer"
                            onClick={() => (window.location.href = "/account/addresses")}
                        >
                            <div className="card-body">
                                <h2 className="card-title">Your Addresses</h2>
                                <p className="text-sm text-base-content/70">
                                    Edit and view your addresses
                                </p>
                                <button className="btn btn-primary btn-sm mt-3 w-fit">
                                    View Addresses
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
