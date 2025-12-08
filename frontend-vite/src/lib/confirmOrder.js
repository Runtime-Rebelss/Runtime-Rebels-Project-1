// src/lib/confirmOrder.js

import api from "./axios";
import orderLib from "./orders";

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
    const randomCode = "SCZ-" + Math.floor(100000 + Math.random() * 900000);
    setConfirmation(randomCode);

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    const guestConfirmKey = `guest-confirm-${sessionId}`;
    const userConfirmKey = `user-confirm-${sessionId}`;

    if (!userId) {
        if (sessionStorage.getItem(guestConfirmKey)) {
            let items = [];
            try {
                const raw = localStorage.getItem("pendingGuestOrder") || "[]";
                const parsed = JSON.parse(raw);
                items = Array.isArray(parsed) ? parsed : parsed.items;
            } catch {
            }

            const total = items.reduce((s, it) => s + it.price * it.quantity, 0);
            setCartItems(items);
            setTotal(total);
            return;
        }

        // Guest order
        let items = [];
        try {
            const raw = localStorage.getItem("pendingGuestOrder") || "[]";
            const parsed = JSON.parse(raw);
            items = Array.isArray(parsed) ? parsed : parsed.items;
        } catch {
        }

        const normalized = items.map(it => ({
            id: it.id || it.productId,
            productId: it.productId || it.id,
            name: it.name,
            image: it.image,
            price: Number(it.price),
            quantity: Number(it.quantity),
        }));

        // Backend payload
        const guestPayload = {
            productIds: normalized.map(it => it.productId),
            quantity: normalized.map(it => it.quantity),
            totalPrice: normalized.map(it => it.price * it.quantity),
            stripeSessionId: sessionId,
        };

        const saved = await api.post("/orders/guest", guestPayload);

        // Save local guest order history
        const localOrder = {
            id: saved.data.id || "guest-" + Date.now(),
            createdAt: saved.data.createdAt,
            userEmail: "Guest",
            items: normalized,
            total: normalized.reduce((s, it) => s + it.price * it.quantity, 0),
        };

        const existing = orderLib.readLocalOrders();
        orderLib.writeLocalOrders([...(existing || []), localOrder]);

        // Update UI
        setCartItems(normalized);
        setTotal(localOrder.total);

        // Clear guest storage
        localStorage.removeItem("guestCart");
        localStorage.removeItem("pendingGuestOrder");

        window.dispatchEvent(new Event("cart-updated"));
        sessionStorage.setItem(guestConfirmKey, "1");
        return;
    }

    // User already confirmed? Restore UI
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
                        price: lineTotal / qty,
                    };
                })
            );

            setCartItems(items);
            setTotal(items.reduce((s, it) => s + it.price * it.quantity, 0));
            return;
        }
    }

    // Create user order
    let pending = [];
    try {
        pending = JSON.parse(localStorage.getItem("pendingServerOrder") || "[]");
    } catch {
    }

    if (!pending.length) {
        console.warn("No pendingServerOrder snapshot found.");
        return;
    }
    // Gets correct order
    const enriched = await Promise.all(
        pending.map(async item => {
            const {data: product} = await api.get(`/products/${item.id || item.productId}`);

            return {
                id: item.id || item.productId,
                quantity: Number(item.quantity),
                name: product.name,
                image: product.image || product.imageUrl,
                price: Number(product.price), // authoritative unit price
            };
        })
    );

    // Create backend order
    const orderPayload = {
        fullName,
        userEmail,
        userId,
        confirmationNumber: randomCode,
        productIds: enriched.map(i => i.id),
        quantity: enriched.map(i => i.quantity),
        totalPrice: enriched.map(i => i.price * i.quantity),
        stripeSessionId: sessionId,
        paymentStatus: "Paid",
        orderStatus: "PENDING",
        createdAt: new Date().toISOString(),
    };

    const created = await api.post(`/orders/create/${userId}`, orderPayload);

    // Save dedupe snapshot
    sessionStorage.setItem("confirmedOrder", JSON.stringify(orderPayload));
    sessionStorage.setItem(userConfirmKey, "1");

    // Update UI
    setCartItems(enriched);
    setTotal(enriched.reduce((s, it) => s + it.price * it.quantity, 0));

    localStorage.removeItem("pendingServerOrder");
    window.dispatchEvent(new Event("cart-updated"));
}