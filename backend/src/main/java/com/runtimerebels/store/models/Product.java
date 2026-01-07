package com.runtimerebels.store.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.util.List;

/**
 * Represents a product available for purchase in the Runtime Rebels e-commerce store.
 * Stores product information including name, description, price, image URL, and categories.
 * Persisted in the "products" MongoDB collection.
 *
 * @author Haley Kenney, Frank Gonzalez
 * @since 11-19-2025
 */

@Document(collection = "products") // Mongo collection name
public class Product {
    @Id
    private String id;
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private String slug;
    private String externalId;
    private String sku;
    private List<String> categories;
    /**
     * Semantic embedding vector for Atlas Vector Search.
     * Generated from product text (name/description/categories).
     */
    private List<Double> embedding;

    /**
     * Gets the product ID.
     * @return the product ID
    */
    public String getId() {
        return id;
    }
    /**
     * Sets the product ID.
     * @param id the product ID
    */
    public void setId(String id) {
        this.id = id;
    }

    /**
     * Gets the product name.
     * @return the product name
    */
    public String getName() {
        return name;
    }
    /**
     * Sets the product name.
     * @param name the product name
    */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Gets the product description.
     * @return the product description
    */
    public String getDescription() {
        return description;
    }
    /**
     * Sets the product description.
     * @param description the product description
    */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Gets the product price.
     * @return the product price
    */
    public BigDecimal getPrice() {
        return price;
    }
    /**
     * Sets the product price.
     * @param price the product price
    */
    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    /**
     * Gets the product image URL.
     * @return the product image URL
    */
    public String getImageUrl() {
        return imageUrl;
    }
    /**
     * Sets the product image URL.
     * @param imageUrl the product image URL
    */
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    /**
     * Gets the product slug.
     * @return the product slug
    */
    public String getSlug() {
        return slug;
    }

    /**
     * Sets the product slug.
     * @param slug the product slug
    */
    public void setSlug(String slug) {
        this.slug = slug;
    }

    /**
     * Gets the product external ID.
     * @return the product external ID
    */
    public String getExternalId() {
        return externalId;
    }

    /**
     * Sets the product external ID.
     * @param externalId the product external ID
    */
    public void setExternalId(String externalId) {
        this.externalId = externalId;
    }

    /**
     * Gets the product SKU.
     * @return the product SKU
    */
    public String getSku() {
        return sku;
    }

    /**
     * Sets the product SKU.
     * @param sku the product SKU
    */
    public void setSku(String sku) {
        this.sku = sku;
    }

    /**
     * Gets the product categories.
     * @return the list of product categories
    */
    public List<String> getCategories() {
        return categories;
    }

    /**
     * Sets the product categories.
     * @param categories the list of product categories
    */
    public void setCategories(List<String> categories) {
        this.categories = categories;
    }

    /**
     * Gets the embedding vector.
     * @return embedding vector, or null if not generated
     */
    public List<Double> getEmbedding() {
        return embedding;
    }

    /**
     * Sets the embedding vector.
     * @param embedding embedding vector
     */
    public void setEmbedding(List<Double> embedding) {
        this.embedding = embedding;
    }
}
