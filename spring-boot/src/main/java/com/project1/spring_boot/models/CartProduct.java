package com.project1.spring_boot.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("CartProduct")
public class CartProduct {

    @Id
    private int id;
    private String name;
    private double price;
    private int quantity;
    
    public CartProduct(int id, String name, double price, int quantity) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.quantity = quantity;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }
}
