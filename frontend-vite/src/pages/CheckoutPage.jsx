import React, {useState, useEffect, useRef} from 'react';
import {useNavigate, useLocation, Link} from 'react-router-dom';
import Navbar from '../components/Navbar';
import Checkout from '../components/Checkout.jsx';
import Cookies from "js-cookie"
import cartHandler from "../lib/cartHandler.js";
import cartLib from "../lib/cart.js";

const hasSaved = new Set();

const CheckoutPage = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const hasRunRef = useRef(false); //  prevents double saves
    const location = useLocation();
    const [cartItems, setCartItems] = useState([]);

    const userId = Cookies.get("userId");

    const {handleUpdateQuantity, handleRemove} = cartHandler({
        setCartItems,
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
        load(true);
    }, [userId]);



    return (
        <div>
            <Navbar/>
            <Checkout
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemove}
            />
        </div>
    )

}

export default CheckoutPage;
