package com.project1.spring_boot.models;

import jakarta.persistence.Entity;

@Entity(name="CART")
public class Cart {
    private int cartId;
    private int customerId;

    public Cart() {
    }

    public int getCartId() {
        return cartId;
    }

    public int getCustomerId() {
        return customerId;
    }

    public void setCartId(int cartId) {
        this.cartId = cartId;
    }

    public void setCustomerId(int customerId) {
        this.customerId = customerId;
    }


}
