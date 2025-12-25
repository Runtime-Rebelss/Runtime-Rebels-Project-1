package com.runtimerebels.store.dao;

import com.runtimerebels.store.models.Address;
import com.runtimerebels.store.models.CartItem;
import com.runtimerebels.store.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface AddressRepository extends MongoRepository<Address, String> {
    List<Address> findByUserId(String userId);

}
