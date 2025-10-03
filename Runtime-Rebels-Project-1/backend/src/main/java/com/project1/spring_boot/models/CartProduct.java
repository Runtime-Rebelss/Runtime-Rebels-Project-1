package com.project1.spring_boot.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "cart products")
public class CartProduct {

    @Id
    private Integer cartProductId;
    private Product product;
    private Integer quantity;
    
    public CartProduct(Integer cartProductId, Product product, Integer quantity) {
        this.cartProductId = cartProductId;
        this.product = product;
    }

    public Integer getCartProductId() {
        return cartProductId;
    }

    public void setCartProductId(Integer cartProductId) {
        this.cartProductId = cartProductId;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getQuantity() { return quantity; }

    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
