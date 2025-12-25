package com.runtimerebels.store.dao;

import com.runtimerebels.store.models.Order;
import com.runtimerebels.store.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);

}
