package com.runtimerebels.store.dao;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.runtimerebels.store.models.Cart;

public interface CartRepository extends MongoRepository<Cart, String> {
    Optional<Cart> findByUserId(String userId);

    boolean existsByUserId(String userId);
}
