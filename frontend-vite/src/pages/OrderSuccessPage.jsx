import React, {useEffect, useState, useRef} from "react";
import {useNavigate} from "react-router-dom";
import Navbar from "../components/Navbar";
import orderLib from "../lib/orders.js";
import api from "../lib/axios";
import Cookies from "js-cookie";
import cartLib from "../lib/cart";

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
        const confirmOrder = async () => {
            // Generate random confirmation number
            const randomCode = "SCZ-" + Math.floor(100000 + Math.random() * 900000);
            setConfirmation(randomCode);

            const params = new URLSearchParams(window.location.search);
            const sessionId = params.get("session_id");
            
            // For guests, try to get email/name from Stripe if not in cookies
            let guestEmail = userEmail;
            let guestName = fullName;
            
            if (!userId && sessionId && (!userEmail || userEmail === "Valued Customer")) {
                try {
                    const stripeRes = await fetch(`http://localhost:8080/api/stripe/session/${sessionId}`);
                    const stripeSession = await stripeRes.json();
                    guestEmail = stripeSession["customer_email"] || stripeSession.customer_details?.email || userEmail;
                    guestName = (stripeSession.shipping_details?.name || stripeSession.customer_details?.name || fullName);
                    
                    // Save to cookies for future use
                    if (guestEmail && guestEmail !== "guest") {
                        Cookies.set("userEmail", guestEmail);
                    }
                    if (guestName) {
                        Cookies.set("fullName", guestName);
                    }
                } catch (err) {
                    console.warn("Failed to fetch Stripe session for guest email:", err);
                }
            }
            
            // Used to separate guest and user orders
            const guestConfirmKey = `guest-confirm-${sessionId}`;
            const userConfirmKey = `user-confirm-${sessionId}`;

            if (!userId) {
                if (sessionStorage.getItem(guestConfirmKey)) {
                    // Accept either an array or an object with { items: [...] }
                    let items = [];
                    try {
                        const raw = localStorage.getItem("pendingGuestOrder") || "[]";
                        const parsed = JSON.parse(raw);
                        if (Array.isArray(parsed)) items = parsed;
                        else if (parsed && Array.isArray(parsed.items)) items = parsed.items;
                    } catch (e) {
                        items = [];
                    }

                    const total = items.reduce(
                        (s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0
                    );
                    setCartItems(items);
                    setTotal(total);
                    return;
                }
                let items = [];
                try {
                    const raw = localStorage.getItem("pendingGuestOrder");
                    const parsed = raw ? JSON.parse(raw) : [];

                    if (Array.isArray(parsed)) items = parsed;
                    else if (parsed && Array.isArray(parsed.items)) items = parsed.items;

                } catch (e) {
                    console.warn("Failed to parse pendingGuestOrder:", e);
                    items = [];
                }

                // Normalize items so they contain an `id` field (used by Product routes)
                const normalizedItems = (items || []).map((it) => ({
                    id: it.id || it.productId || it._id || "",
                    productId: it.productId || it.id || it._id || "",
                    name: it.name || it.productName || "Item",
                    image: it.image || it.imageUrl || "",
                    price: Number(it.price || it.unitPrice || 0),
                    quantity: Number(it.quantity || it.qty || 1),
                }));

                const guestOrder = {
                    id: "guest-" + Date.now(),
                    createdAt: new Date(),
                    items: normalizedItems,
                    total: normalizedItems.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0),
                    status: "Paid",
                    shipTo: {fullName: Cookies.get("userEmail") || "Guest User"}
                };

                const existing = orderLib.readLocalOrders();
                orderLib.writeLocalOrders([...existing, guestOrder]);

                // Send confirmation email for guest
                console.log("Guest email details - to:", guestEmail, "name:", guestName, "orderNumber:", guestOrder.id);
                
                // Only send email if we have a valid email
                if (guestEmail && guestEmail !== "Guest User" && guestEmail !== "guest") {
                    try {
                        await api.post("/email/confirmation", {
                            to: guestEmail,
                            name: guestName || "Valued Guest",
                            orderNumber: guestOrder.id,
                            confirmationNumber: randomCode
                        });
                        console.log("Guest confirmation email sent successfully");
                    } catch (emailErr) {
                        console.error("Failed to send guest confirmation email:", emailErr);
                    }
                } else {
                    console.warn("Skipping guest email - no valid email address. guestEmail:", guestEmail);
                }

                sessionStorage.setItem(guestConfirmKey, "1");
                // Update the cart
                setCartItems(items);
                setTotal(guestOrder.total);

                // Clear only guestCart but leave lastOrderCart (so data persists for success)
                localStorage.removeItem("guestCart");
                localStorage.removeItem("pendingGuestOrder");
                window.dispatchEvent(new Event("cart-updated"));

                return;
            }
            // Prevent duplicate user order creation
            if (sessionStorage.getItem(userConfirmKey)) {
                const saved = JSON.parse(sessionStorage.getItem("confirmedOrder") || "{}");

                if (saved.productIds) {
                    const items = await Promise.all(
                        saved.productIds.map(async (pid, i) => {
                            const {data: product} = await api.get(`/products/${pid}`);
                            const qty = saved.quantity[i];
                            const lineTotal = saved.totalPrice[i];
                            return {
                                id: pid,
                                name: product.name,
                                image: product.image || product.imageUrl,
                                quantity: qty,
                                price: lineTotal / qty
                            };
                        })
                    );

                    setCartItems(items);
                    setTotal(items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0));
                    return;
                }
            }

            let pending = [];
            try {
                pending = JSON.parse(localStorage.getItem("pendingServerOrder") || "[]");
            } catch {
                pending = [];
            }

            if (!pending.length) {
                console.warn("No pendingServerOrder snapshot found.");
                return;
            }

            // create backend order
            const orderPayload = {
                fullName: fullName,
                userEmail,
                userId,
                confirmationNumber: randomCode,
                productIds: pending.map(i => i.id || i.productId),
                quantity: pending.map(i => i.quantity),
                totalPrice: pending.map(i => (i.price || 0) * i.quantity),
                stripeSessionId: sessionId,
                paymentStatus: "Paid",
                orderStatus: "PENDING",
                createdAt: new Date().toISOString()
            };

            const created = await api.post(`/orders/create/${userId}`, orderPayload);

            console.log("Email: ", userEmail)
            console.log("Order response: ", created.data);
            
            // Extract the order ID from the response (could be _id or orderId)
            const orderId = created.data?.orderId || created.data?._id || created.data?.id || "unknown-id";
            
            // Send confirmation email with the actual order data
            await api.post("/email/confirmation", {
                to: userEmail,
                name: fullName || orderPayload.fullName || "Valued Customer",
                orderNumber: orderId,
                confirmationNumber: randomCode
            });

            setCartItems(pending);
            // Needs fixed
            setTotal(orderPayload.totalPrice.reduce((s, t) => s + Number(t), 0));

            localStorage.removeItem("pendingServerOrder");
            window.dispatchEvent(new Event("cart-updated"));

        };
        confirmOrder();
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
                                    <tr key={index}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="mask mask-squircle w-14 h-14">
                                                    <img src={it.image} className="object-cover" />
                                                </div>
                                                <span className="font-medium">{it.name}</span>
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