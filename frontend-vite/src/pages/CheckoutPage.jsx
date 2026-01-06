import React, {useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Checkout from '../components/Checkout.jsx';
import CheckoutAddresses from '../components/CheckoutAddresses.jsx';
import Cookies from "js-cookie"
import cartHandler from "../lib/cartHandler.js";
import cartLib from "../lib/cart.js";
import checkoutLib from "../lib/checkout.js";
import addressService from "../lib/addresses.js";
import toast from "react-hot-toast";
import CheckoutSummary from "../components/CheckoutSummary.jsx";

const hasSaved = new Set();

const CheckoutPage = () => {
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState([]);
    const navigate = useNavigate();
    const hasRunRef = useRef(false); //  prevents double saves
    const location = useLocation();
    const [cartItems, setCartItems] = useState([]);
    const ignoreNextCartUpdatedRef = useRef(false);
    const [isVis, setIsVis] = useState(false);

    const userId = Cookies.get("userId");

    const toggleVisibility = () => {
        setIsVis(!isVis);
    }

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
                const mapped = items.map(it => ({
                    id: it.id || it.productId,
                    productId: it.productId || it.id,
                    name: it.name,
                    image: it.image,
                    price: Number(it.price || 0),
                    quantity: Number(it.quantity || 1),
                }));
                console.debug('[CheckoutPage] loaded server cart items:', mapped);
                setCartItems(mapped);
            } catch (err) {
                if (err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') return;
                console.warn('Cart load failed', err);
                setCartItems([]);
            } finally {
                if (showLoading) setLoading(false);
            }
        };
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

    useEffect(() => {
        const fetchAddress = async () => {
            try {
                const response = await addressService.getAddressesByUserId(userId);
                setAddress(response.data);
            } catch (error) {
                console.error("Error fetching address:", error);
                toast.error("Failed to load address!");
            } finally {
                setLoading(false);
            }
        };
        fetchAddress();
    }, [userId]);

    const defaultAddress = address.find(addr => addr.default === true);
    const defaultFirst = address.slice();

    // When button "set default" is clicked, move that address to the front of the list
    defaultFirst.sort((a, b) => b.default - a.default);

    return (
        <div className="checkout-page">
            <Navbar/>
            <div className="container mx-auto px-4 py-8">
                <main className="checkout-container">
                    <div className="mb-6 text-center">
                    <h1 className="text-3xl font-semibold inline-flex items-center justify-center">
                        Checkout
                    </h1>
                    </div>
                    <section className="checkout-form">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <CheckoutAddresses
                                    address={defaultAddress}
                                    addresses={address}
                                />
                                <Checkout
                                    cartItems={cartItems}
                                    onUpdateQuantity={handleUpdateQuantity}
                                    onRemove={handleRemove}
                                    handleCheckout={checkoutLib.handleCheckout}
                                />
                            </div>
                            <div className="lg:col-span-1">
                                <CheckoutSummary
                                    items={cartItems}
                                    loading={loading}
                                    onCheckout={checkoutLib.handleCheckout}
                                    onContinue={() => navigate('/')}
                                    userId={userId}
                                />
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    )

}

export default CheckoutPage;
