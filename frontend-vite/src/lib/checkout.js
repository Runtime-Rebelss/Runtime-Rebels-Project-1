import cartLib from "./cart.js";
import api from "./axios.js";
import Cookies from "js-cookie"

export async function saveOrder() {
    try {
        // Extract sessionId from URL
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get("session_id");
        
        console.log("Fetching Stripe session:", sessionId);
        const stripeRes = await fetch(`http://localhost:8080/api/stripe/session/${sessionId}`);
        const stripeSession = await stripeRes.json();
        console.log("Stripe session:", stripeSession);

        const customerEmail = stripeSession["customer_email"] || stripeSession.customer_details?.email || "guest";
        const shipping = stripeSession.shipping_details || {};
        const address = shipping.address || {};
        const card = stripeSession.payment_method || {};
        const userId = Cookies.get("userId");

        // Save the customer email from Stripe to cookies for use on success page
        if (customerEmail && customerEmail !== "guest") {
            Cookies.set("userEmail", customerEmail);
        }

        // Save the customer name from Stripe to cookies
        const customerName = shipping.name || stripeSession.customer_details?.name;
        if (customerName) {
            Cookies.set("fullName", customerName);
        }

        if (!userId) {
            const cart = cartLib.loadGuestCart();
        } else {
            api.post(`/orders/confirm/${userId}`);
        }

        const orderData = {
            userEmail: customerEmail || email || userEmail,
            productIds: cart.map(it => it.productId),
            quantities: cart.map(it => it.quantity),
            totalPrice: cart.reduce((sum, it) => sum + it.price * it.quantity, 0),
            deliveryName: shipping.name || stripeSession.customer_details?.name || "Guest",
            deliveryContact: stripeSession.customer_details?.phone || "unknown",
            deliveryAddress: address.line1 || "N/A",
            deliveryCity: address.city || "N/A",
            deliveryState: address.state || "N/A",
        };
        const response = await fetch('http://localhost:8080/api/orders', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(orderData)
        });
        window.dispatchEvent(new Event("cart-updated"));
        if (response.ok) {
            console.log(' Order saved successfully!');
            localStorage.removeItem('guestCart');
        } else {
            console.error(' Failed to save order:', await response.text());
        }
    } catch (err) {
        console.error(' Error posting order:', err);
    }
}

// checkout with Stripe
export async function handleCheckout() {
    try {
        const userId = Cookies.get('userId');
        // get items from local cart
        const cartItems = api.get(`/carts/${userId}`);
        if (!cartItems || cartItems.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        const items = cartItems.map(item => ({
            name: item.name,
            unitAmount: Math.round(item.price * 100), // dollars → cents
            currency: 'usd',
            quantity: item.quantity
        }));

        const response = await api.post('/payments/create-checkout-session', {items});
        const {url} = response.data;
        window.location.href = url;
    } catch (error) {
        console.error('Error starting checkout:', error);
        alert('Failed to start checkout. Please try again.');
    } finally {
    }
}

export default {saveOrder, handleCheckout};
