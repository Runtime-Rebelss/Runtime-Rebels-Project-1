import React, {useEffect, useState} from 'react'
import Navbar from '../components/Navbar';
import cartLib from "../lib/cart.js";
import checkoutLib from "../lib/checkout.js";
import Cookies from "js-cookie"
import CartContent from '../components/CartContent.jsx';
import CartSummary from '../components/CartSummary.jsx';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
    const userId = Cookies.get("userId");
    const isGuest = !userId;

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const ac = new AbortController();

        const load = async () => {
            setLoading(true);
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
                    setLoading(false);
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
                setLoading(false);
            }
        };

        load();

        const onCartUpdated = () => load();
        window.addEventListener('cart-updated', onCartUpdated);

        return () => {
            ac.abort();
            window.removeEventListener('cart-updated', onCartUpdated);
        };
    }, [userId]);

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar/>
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6 text-center">
                    <h1 className="text-3xl font-semibold">Your Cart</h1>
                    <p className="text-base-content/60">{isGuest ? 'Guest cart' : 'Signed-in cart'}</p>
                </div>

                {/* Cart List on left and Summary on right */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <CartContent
                            loading={loading}
                            cartItems={cartItems}
                        />
                    </div>

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