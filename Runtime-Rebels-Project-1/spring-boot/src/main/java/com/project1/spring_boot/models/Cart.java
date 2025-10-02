package com.project1.spring_boot.models;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
// @Document() specifies the collection name

@Document("Cart")
public class Cart {

    @Id
    private int id;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Cart(int id, LocalDateTime createdAt) {
        this.id = id;
        this.createdAt = createdAt;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

}
