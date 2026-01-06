import React, {useEffect, useState, useRef} from 'react'
import Navbar from '../components/Navbar';
import cartLib from "../lib/cart.js";
import checkoutLib from "../lib/checkout.js";
import Cookies from "js-cookie"
import CartContent from '../components/CartContent.jsx';
import CartSummary from '../components/CartSummary.jsx';
import { useNavigate } from 'react-router-dom';
import cartHandler from '../lib/cartHandler.js';

const CartPage = () => {
    const userId = Cookies.get("userId");
    const isGuest = !userId;

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const ignoreNextCartUpdatedRef = useRef(false);

    const {handleUpdateQuantity, handleRemove} = cartHandler({
        setCartItems,
        ignoreNextCartUpdatedRef,
    });

    useEffect(() => {
        const ac = new AbortController();

        const load = async (showLoading = true) => {
            if (showLoading) setLoading(true);
            try {
                if (!userId) {
                    const {items} = cartLib.loadGuestCart();
                    setCartItems(items.map((it) => ({
                        id: it.productId || it.id,
                        productId: it.productId || it.id,
                        name: it.name,
                        image: it.image,
                        price: Number(it.price || 0),
                        quantity: Number(it.quantity || 1),
                    })));
                    if (showLoading) setLoading(false);
                    return;
                }

                const items = await cartLib.loadServerCart(userId, ac.signal);
                setCartItems(items.map(it => ({
                    id: it.id || it.productId,
                    productId: it.productId || it.id,
                    name: it.name,
                    image: it.image,
                    price: Number(it.price || 0),
                    quantity: Number(it.quantity || 1),
                })));
            } catch (err) {
                if (err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') return;
                console.warn('Cart load failed', err);
                setCartItems([]);
            } finally {
                if (showLoading) setLoading(false);
            }
        };

        // initial load should show loading state
        load(true);

        const onCartUpdated = (ev) => {
            console.debug('cart-updated event received', ev && ev.detail);
            // If we set this flag while performing an optimistic update, ignore the incoming event
            if (ignoreNextCartUpdatedRef.current) {
                console.debug('Ignoring cart-updated because ignore flag set');
                ignoreNextCartUpdatedRef.current = false;
                return;
            }

            load(false);
        };
        window.addEventListener('cart-updated', onCartUpdated);

        return () => {
            ac.abort();
            window.removeEventListener('cart-updated', onCartUpdated);
        };
    }, [userId]);

    return (
        <div>
            <Navbar/>
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6 text-center">
                    <h1 className="text-3xl font-semibold inline-flex items-center justify-center">
                        Your Cart
                        {loading && (
                            <span className="ml-3 inline-flex items-center" role="status" aria-live="polite">
                                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                                <span className="sr-only">Loading</span>
                            </span>
                        )}
                    </h1>
                    <p className="text-base-content/60 mt-2">{isGuest ? 'Guest cart' : 'Signed-in cart'}</p>
                </div>
                {/* Cart List on left and Summary on right */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <CartContent
                            loading={loading}
                            cartItems={cartItems}
                            onUpdateQuantity={handleUpdateQuantity}
                            onRemove={handleRemove}
                        />
                    </div>
                    {/* CART SUMMARY - Right Side */}
                    <div className="lg:col-span-1">
                        <CartSummary
                            items={cartItems}
                            loading={loading}
                            onCheckout={checkoutLib.handleCheckout}
                            onContinue={() => navigate('/')}
                            userId={userId}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartPage;