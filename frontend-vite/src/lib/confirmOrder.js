// src/lib/confirmOrder.js

import api from "./axios";
import orderLib from "./orders";
import Cookies from "js-cookie";

/**
 * confirmOrder()
 * Handles guest + logged-in order confirmation
 * Ensures no double charges, normalized pricing, and consistent UI.
 *
 * @param {
 *   fullName: string,
 *   userId: string | null,
 *   userEmail: string,
 *   setCartItems: Function,
 *   setTotal: Function,
 *   setConfirmation: Function,
 * } params
 */
export async function confirmOrder({
                                       fullName,
                                       userId,
                                       userEmail,
                                       setCartItems,
                                       setTotal,
                                       setConfirmation,
                                   }) {
    // Generate random confirmation number
    const randomCode = "SCZ-" + Math.floor(100000 + Math.random() * 900000);
    setConfirmation(randomCode);

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    let guestEmail = userEmail;
    let guestName = fullName;

    if (!userId && sessionId && (!userEmail || userEmail === "Valued Customer")) {
        try {
            const stripeRes = await fetch(
                `http://localhost:8080/api/stripe/session/${sessionId}`
            );
            const stripeSession = await stripeRes.json();
            guestEmail =
                stripeSession["customer_email"] ||
                stripeSession.customer_details?.email ||
                userEmail;
            guestName =
                stripeSession.shipping_details?.name ||
                stripeSession.customer_details?.name ||
                fullName;

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
        // For if guest has confirmed key already
        if (sessionStorage.getItem(guestConfirmKey)) {
            let items = [];
            try {
                const raw = localStorage.getItem("pendingGuestOrder") || "[]";
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) items = parsed;
                else if (parsed?.items) items = parsed.items;
            } catch {}

            const total = items.reduce(
                (s, it) => s + Number(it.price || 0) * Number(it.quantity || 1),
                0
            );
            setCartItems(items);
            setTotal(total);
            return;
        }

        // NEW GUEST ORDER CREATION
        let items = [];
        try {
            const raw = localStorage.getItem("pendingGuestOrder") || "[]";
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) items = parsed;
            else if (parsed?.items) items = parsed.items;
        } catch {}

        const normalizedItems = items.map((it) => ({
            id: it.id || it.productId,
            productId: it.productId || it.id,
            name: it.name,
            image: it.image,
            price: Number(it.price),
            quantity: Number(it.quantity),
        }));

        // BACKEND PAYLOAD (line totals per item)
        const guestPayload = {
            productIds: normalizedItems.map((it) => it.productId),
            quantity: normalizedItems.map((it) => it.quantity),
            totalPrice: normalizedItems.map((it) => it.price * it.quantity),
            stripeSessionId: sessionId,
        };

        // SAVE TO BACKEND
        const saved = await api.post("/orders/guest", guestPayload);

        // SAVE LOCALLY FOR GUEST ORDER HISTORY
        const localOrder = {
            id: saved.data.id || "guest-" + Date.now(),
            createdAt: saved.data.createdAt,
            userEmail: "Guest",
            items: normalizedItems,
            total: normalizedItems.reduce(
                (s, it) => s + it.price * it.quantity,
                0
            ),
        };

        const existing = orderLib.readLocalOrders() || [];
        orderLib.writeLocalOrders([...existing, localOrder]);

        // Send confirmation email for guest (if we have an email)
        console.log(
            "Guest email details - to:",
            guestEmail,
            "name:",
            guestName,
            "orderNumber:",
            localOrder.id
        );

        if (
            guestEmail &&
            guestEmail !== "Guest User" &&
            guestEmail !== "guest"
        ) {
            try {
                await api.post("/email/confirmation", {
                    to: guestEmail,
                    name: guestName || "Valued Guest",
                    orderNumber: localOrder.id,
                    confirmationNumber: randomCode,
                });
                console.log("Guest confirmation email sent successfully");
            } catch (emailErr) {
                console.error("Failed to send guest confirmation email:", emailErr);
            }
        } else {
            console.warn(
                "Skipping guest email - no valid email address. guestEmail:",
                guestEmail
            );
        }

        // UPDATE UI
        setCartItems(normalizedItems);
        setTotal(localOrder.total);

        // CLEAR CART PROPERLY
        localStorage.removeItem("guestCart");
        localStorage.removeItem("pendingGuestOrder");

        window.dispatchEvent(new Event("cart-updated"));
        sessionStorage.setItem(guestConfirmKey, "1");
        return;
    }

    // Prevent duplicate user order creation
    if (sessionStorage.getItem(userConfirmKey)) {
        const saved = JSON.parse(
            sessionStorage.getItem("confirmedOrder") || "{}"
        );

        if (saved.productIds) {
            // Rebuild UI items from stored order using unit prices
            const items = await Promise.all(
                saved.productIds.map(async (pid, i) => {
                    const { data: product } = await api.get(`/products/${pid}`);
                    const qty = Number(saved.quantity[i] || 1);
                    const lineTotal = Number(saved.totalPrice[i] || 0);
                    const unitPrice = qty > 0 ? lineTotal / qty : 0;

                    return {
                        id: pid,
                        name: product.name,
                        image: product.image || product.imageUrl,
                        quantity: qty,
                        price: unitPrice, // unit price
                    };
                })
            );

            setCartItems(items);
            setTotal(
                items.reduce(
                    (s, it) =>
                        s +
                        Number(it.price || 0) * Number(it.quantity || 1),
                    0
                )
            );
            return;
        }
    }

    // NEW user order creation
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

    // Build payload with line totals per item
    const orderPayload = {
        fullName,
        userEmail,
        userId,
        confirmationNumber: randomCode,
        productIds: pending.map((i) => i.id || i.productId),
        quantity: pending.map((i) => i.quantity),
        totalPrice: pending.map(
            (i) => Number(i.price || 0) * Number(i.quantity || 1)
        ),
        stripeSessionId: sessionId,
        paymentStatus: "Paid",
        orderStatus: "PENDING",
        createdAt: new Date().toISOString(),
    };

    const created = await api.post(`/orders/create/${userId}`, orderPayload);

    console.log("Email: ", userEmail);
    console.log("Order response: ", created.data);

    // Extract the order ID from the response (could be _id or orderId)
    const orderId =
        created.data?.orderId ||
        created.data?._id ||
        created.data?.id ||
        "unknown-id";

    // Send confirmation email with the actual order data
    try {
        await api.post("/email/confirmation", {
            to: userEmail,
            name: fullName || orderPayload.fullName || "Valued Customer",
            orderNumber: orderId,
            confirmationNumber: randomCode,
        });
    } catch (emailErr) {
        console.error("Failed to send user confirmation email:", emailErr);
    }

    const items = await Promise.all(
        orderPayload.productIds.map(async (pid, i) => {
            const { data: product } = await api.get(`/products/${pid}`);
            const qty = Number(orderPayload.quantity[i] || 1);
            const lineTotal = Number(orderPayload.totalPrice[i] || 0);
            const unitPrice = qty > 0 ? lineTotal / qty : 0;

            return {
                id: pid,
                name: product.name,
                image: product.image || product.imageUrl,
                quantity: qty,
                price: unitPrice, // unit price
            };
        })
    );

    setCartItems(items);
    setTotal(items.reduce((s, it) => s + it.price * it.quantity, 0));

    // Save order snapshot for dedupe
    sessionStorage.setItem("confirmedOrder", JSON.stringify(orderPayload));
    sessionStorage.setItem(userConfirmKey, "1");

    // Clear pending server order
    localStorage.removeItem("pendingServerOrder");
    window.dispatchEvent(new Event("cart-updated"));
}
