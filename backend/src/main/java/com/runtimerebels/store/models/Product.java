package com.runtimerebels.store.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
/**
 * Represents a product available for purchase in the Runtime Rebels e-commerce store.
 * Stores basic product information such as name, description, price, and image URL.
 * Persisted in the "products" MongoDB collection.
 *
 * @author Haley Kenney, Frank Gonzalez
 *
 */

@Document(collection = "products") // Mongo collection name
public class Product {
    @Id
    private String id;
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;

    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }
    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getImageUrl() {
        return imageUrl;
    }
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

}
