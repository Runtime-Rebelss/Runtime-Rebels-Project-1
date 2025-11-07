import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  const addToCart = () => setCartCount((prev) => prev + 1);
  const clearCart = () => setCartCount(0);

  return (
    <CartContext.Provider value={{ cartCount, addToCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);