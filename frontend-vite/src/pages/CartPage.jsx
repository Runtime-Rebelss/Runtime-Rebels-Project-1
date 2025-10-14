import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, X } from 'lucide-react';
import Navbar from '../components/Navbar';

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [toastMsg, setToastMsg] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    // ✅ No login required: fall back to a stable guest id if no user email is set
    const userId = localStorage.getItem('userEmail') || 'guest';

    const navigate = useNavigate();
    const searchRef = useRef(null);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await fetch(`/api/carts/${userId}`);
                if (!res.ok) throw new Error('Failed to load cart');

                const cartData = await res.json();
                console.log('Raw cart data from API:', cartData);

                const items = await Promise.all(
                    (cartData.productIds || [])
                        .filter((pid) => pid && typeof pid === 'string' && pid.length > 0)
                        .map(async (productId, index) => {
                            try {
                                const productRes = await fetch(`/api/products/${productId}`);
                                if (!productRes.ok) throw new Error(`Product ${productId} not found`);
                                const product = await productRes.json();

                                const quantity = cartData.quantities?.[index] ?? 1;
                                const grams = cartData.grams?.[index] ?? 1;
                                const finalPrice = cartData.finalPrices?.[index] ?? product.price * grams;

                                return {
                                    ...product,
                                    quantity,
                                    grams,
                                    finalPrice,
                                    itemTotal: finalPrice * quantity,
                                };
                            } catch (err) {
                                console.warn(`Skipping invalid product id ${productId}`, err);
                                return null;
                            }
                        })
                );

                const validItems = items.filter((i) => i !== null);
                setCartItems(validItems);
                setTotal(validItems.reduce((sum, i) => sum + i.itemTotal, 0));
            } catch (err) {
                console.error('Error fetching cart:', err);
                setToastMsg('Error loading cart. Please try again.');
            }
        };

        fetchCart();
    }, [userId]);

    useEffect(() => {
        if (toastMsg) {
            const timer = setTimeout(() => setToastMsg(''), 4000);
            return () => clearTimeout(timer);
        }
    }, [toastMsg]);

    useEffect(() => {
        const loadSearchResults = async () => {
            if (searchInput.trim() === '') {
                setSearchResults([]);
                return;
            }
            try {
                const res = await fetch(`/api/products?search=${encodeURIComponent(searchInput)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data.slice(0, 5));
                } else {
                    setSearchResults([]);
                }
            } catch (err) {
                console.error('Failed to load search results:', err);
                setSearchResults([]);
            }
        };
        loadSearchResults();
    }, [searchInput]);

    const updateQuantity = async (productId, newQty) => {
        if (newQty < 1) {
            setToastMsg('Quantity must be at least 1.');
            setIsSuccess(false);
            return;
        }
        try {
            const res = await fetch(
                `/api/carts/update?userId=${encodeURIComponent(userId)}&productId=${productId}&quantity=${newQty}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                }
            );
            if (!res.ok) throw new Error('Update failed.');
            setToastMsg('Cart updated successfully!');
            setIsSuccess(true);
            const updatedItems = cartItems.map((item) =>
                (item.id || item._id) === productId
                    ? {
                        ...item,
                        quantity: newQty,
                        itemTotal: item.finalPrice * newQty,
                    }
                    : item
            );
            setCartItems(updatedItems);
            setTotal(updatedItems.reduce((sum, i) => sum + i.itemTotal, 0));
        } catch (err) {
            console.error('Error updating quantity:', err);
            setToastMsg('Failed to update cart. Please try again.');
            setIsSuccess(false);
        }
    };

    // const removeItem = async (productId, productName) => {
    //   try {
    //     const res = await fetch(
    //       `/api/cart/remove?userId=${encodeURIComponent(userId)}&productId=${productId}`,
    //       {
    //         method: 'DELETE',
    //         headers: { 'Content-Type': 'application/json' },
    //       }
    //     );
    //     if (!res.ok) throw new Error('Remove failed.');
    //     setToastMsg(`"${productName}" removed from cart.`);
    //     setIsSuccess(true);
    //     const updatedItems = cartItems.filter((item) => (item.id || item._id) !== productId);
    //     setCartItems(updatedItems);
    //     setTotal(updatedItems.reduce((sum, i) => sum + i.itemTotal, 0));
    //   } catch (err) {
    //     console.error('Error removing item:', err);
    //     setToastMsg('Failed to remove item. Please try again.');
    //     setIsSuccess(false);
    //   }
    // };

    // const proceedToCheckout = () => {
    //   if (cartItems.length === 0) {
    //     setToastMsg('Your cart is empty. Add items to proceed to checkout.');
    //     setIsSuccess(false);
    //     return;
    //   }
    //   navigate('/checkout');
    // };

    // const handleSearchSubmit = (e) => {
    //   e.preventDefault();
    //   setSearchOpen(false);
    //   navigate(`/collections?search=${encodeURIComponent(searchInput)}`);
    // };

    // const handleSearchClick = () => {
    //   navigate(`/collections?focus=true&search=${encodeURIComponent(searchInput)}`);
    // };

    const viewProduct = (productId) => {
        navigate(`/products/${productId}`);
    };

    const getBadgeColor = (badge) => {
        switch (badge?.toLowerCase()) {
            case 'bestseller':
                return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white';
            case 'new':
                return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white';
            case 'trending':
                return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
            case 'limited':
                return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
            default:
                return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30">
            <Navbar
                handleSearchSubmit={handleSearchSubmit}
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                searchResults={searchResults}
                viewProduct={viewProduct}
                handleSearchClick={handleSearchClick}
                setSearchOpen={setSearchOpen}
                searchOpen={searchOpen}
            />
            {/* Cart Section */}
            <section className="max-w-6xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-light tracking-wide text-gray-900 mb-4">Your Cart</h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto rounded-full"></div>
                    <p className="text-gray-600 mt-4">Review your selected items before checkout</p>
                </div>

                {cartItems.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-light text-gray-900 mb-4">Your cart is empty</h3>
                        <p className="text-gray-600 mb-8">Discover our beautiful jewelry collections</p>
                        <button
                            onClick={() => navigate('/collections')}
                            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white py-4 px-8 rounded-xl font-medium tracking-wider hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            Explore Collections
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-6">
                            {cartItems.map((item) => (
                                <div
                                    key={item.id || item._id}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300"
                                >
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        {/* Product Image */}
                                        <div className="relative flex-shrink-0">
                                            <img
                                                src={
                                                    item.image ||
                                                    item.imageUrl ||
                                                    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                                                }
                                                alt={item.name}
                                                className="w-full sm:w-32 h-48 sm:h-32 object-cover rounded-xl"
                                            />
                                            {item.badge && (
                                                <span
                                                    className={`absolute top-3 left-3 px-3 py-1 text-xs font-medium rounded-full ${getBadgeColor(
                                                        item.badge
                                                    )}`}
                                                >
                          {item.badge}
                        </span>
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-grow">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                                <div>
                                                    <h3
                                                        className="text-xl font-medium text-gray-900 mb-2 hover:text-amber-600 cursor-pointer transition-colors"
                                                        onClick={() => viewProduct(item.id || item._id)}
                                                    >
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                                                    <p className="text-sm text-gray-500 mb-1">{item.grams} grams</p>
                                                    <p className="text-lg font-semibold text-gray-900">₹{item.finalPrice.toLocaleString()}</p>
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center bg-gray-50 rounded-xl p-1">
                                                        <button
                                                            onClick={() => updateQuantity(item.id || item._id, item.quantity - 1)}
                                                            className="w-10 h-10 bg-white text-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <div className="w-16 text-center font-medium text-gray-900">{item.quantity}</div>
                                                        <button
                                                            onClick={() => updateQuantity(item.id || item._id, item.quantity + 1)}
                                                            className="w-10 h-10 bg-white text-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(item.id || item._id, item.name)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Item Total */}
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Subtotal ({item.quantity} × {item.grams}g)
                          </span>
                                                    <span className="text-lg font-semibold text-gray-900">₹{item.itemTotal.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-32">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal ({cartItems.length} items)</span>
                                        <span>₹{total.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping</span>
                                        <span className="text-green-600 font-medium">Free</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flex justify-between text-lg font-semibold text-gray-900">
                                            <span>Total</span>
                                            <span>₹{total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={proceedToCheckout}
                                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-4 px-6 rounded-xl font-medium tracking-wider hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mb-4"
                                >
                                    Proceed to Checkout
                                </button>

                                <button
                                    onClick={() => navigate('/collections')}
                                    className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Continue Shopping
                                </button>

                                {/* Security Badge */}
                                <div className="mt-6 text-center">
                                    <div className="flex items-center justify-center text-sm text-gray-500">
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        Secure Checkout
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* Toast Notification */}
            {toastMsg && (
                <div
                    className={`fixed top-6 right-6 bg-white shadow-2xl border ${
                        isSuccess ? 'border-green-200 text-green-800' : 'border-red-200 text-red-800'
                    } px-6 py-4 rounded-2xl z-50 animate-slide-in-right max-w-sm backdrop-blur-sm`}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-8 h-8 ${isSuccess ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center flex-shrink-0`}
                        >
                            <svg
                                className={`w-4 h-4 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d={isSuccess ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'}
                                />
                            </svg>
                        </div>
                        <p className="font-medium">{toastMsg}</p>
                        <button
                            onClick={() => setToastMsg('')}
                            className="ml-2 flex-shrink-0 w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
                        >
                            <X className="w-3 h-3 text-gray-600" />
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes slide-in-right {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                .animate-slide-in-right {
                    animation: slide-in-right 0.4s ease-out;
                }
            `}</style>
        </div>
    );
};

export default CartPage;
