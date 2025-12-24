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

        let cart = [];
        if (!userId) {
            const guest = cartLib.loadGuestCart();
            cart = guest.items || [];
        } else {
            cart = await cartLib.loadServerCart(userId);
            // Inform backend to confirm the server order if needed
            api.post(`/orders/confirm/${userId}`).catch(() => {});
        }

        const orderData = {
            userEmail: customerEmail || Cookies.get('userEmail'),
            productIds: cart.map(it => it.productId || it.id),
            quantities: cart.map(it => it.quantity),
            totalPrice: cart.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 0), 0),
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
        // get items from local cart or server
        let items = [];
        if (!userId) {
            const guest = cartLib.loadGuestCart();
            if (!Array.isArray(guest.items) || guest.items.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            items = guest.items;
        } else {
            const serverItems = await cartLib.loadServerCart(userId);
            if (!Array.isArray(serverItems) || serverItems.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            items = serverItems;
        }

        const payloadItems = items.map(item => ({
            name: item.name,
            unitAmount: Math.round((item.price || 0) * 100), // dollars → cents
            currency: 'usd',
            quantity: item.quantity
        }));

        const customerEmail = Cookies.get('userEmail') || null;
        const body = { items: payloadItems, customerEmail };

        // If logged in, include addressId (default or first) so backend can prefill Stripe customer/shipping
        if (userId) {
            try {
                const { data: addresses } = await api.get(`/address/user/${encodeURIComponent(userId)}`);
                if (Array.isArray(addresses) && addresses.length > 0) {
                    const defaultAddr = addresses.find(a => a.default) || addresses[0];
                    body.addressId = defaultAddr?.id ?? defaultAddr?._id ?? null;
                }
            } catch (err) {
                console.warn('Unable to fetch addresses for checkout', err);
            }

            // If we still don't have an addressId, ask user to set one and stop
            if (!body.addressId) {
                alert('Please add and set a default shipping address in your account before checking out.');
                return;
            }
        }

        const response = await api.post('/payments/create-checkout-session', body);
        const {url} = response.data;
        window.location.href = url;
    } catch (error) {
        console.error('Error starting checkout:', error);
        alert('Failed to start checkout. Please try again.');
    } finally {
    }
}

export default {saveOrder, handleCheckout};
