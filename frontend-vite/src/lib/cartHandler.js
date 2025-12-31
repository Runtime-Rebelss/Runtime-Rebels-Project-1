// javascript
// File: `lib/cartHandlers.js`
import cartLib from './cart.js';

export function createCartHandlers({ setCartItems, ignoreNextCartUpdatedRef, getUserId = () => null, dispatchTarget = window }) {
    const handleUpdateQuantity = async (productId, newQty) => {
        // Local update
        setCartItems(prev => {
            const items = Array.isArray(prev) ? [...prev] : [];
            const idx = items.findIndex(it => it.productId === productId || it.id === productId);
            if (idx === -1) {
                console.warn('updateQuantity: product not found in state', productId);
                return items;
            }
            if (Number(newQty) === 0) {
                items.splice(idx, 1);
            } else {
                items[idx] = { ...items[idx], quantity: Number(newQty) };
            }
            return items;
        });

        // Stops constant refreshing
        ignoreNextCartUpdatedRef.current = true;
        try {
            const userId = getUserId();
            await cartLib.updateQuantity(productId, newQty, userId);
        } catch (err) {
            console.warn('updateQuantity failed, reloading cart', err);
            ignoreNextCartUpdatedRef.current = false;
            dispatchTarget.dispatchEvent(new Event('cart-updated'));
        }
    };

    const handleRemove = async (productId) => {
        // Local remove
        setCartItems(prev => (Array.isArray(prev) ? prev.filter(it => it.productId !== productId && it.id !== productId) : prev));

        ignoreNextCartUpdatedRef.current = true;
        try {
            await cartLib.removeItem(productId);
        } catch (err) {
            console.warn('removeItem failed, reloading cart', err);
            ignoreNextCartUpdatedRef.current = false;
            dispatchTarget.dispatchEvent(new Event('cart-updated'));
        }
    };
    return { handleUpdateQuantity, handleRemove };
}

export default createCartHandlers;
