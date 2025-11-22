package com.runtimerebels.store.dao;

import com.runtimerebels.store.models.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

/**
 * Repository interface for performing CRUD operations on {@link Order} documents
 * in the MongoDB database. This interface extends {@link MongoRepository},
 * giving access to common persistence methods such as save, findAll, and delete.
 * <p>
 * It also defines custom query methods for retrieving orders by user email
 * or Stripe session ID.
 *
 * @author Haley Kenney
 */
public interface OrderRepository extends MongoRepository<Order, String> {

    /**
     * Retrieves all orders associated with a specific user's email.
     *
     * @param email
     * @return a list of {@link Order} objects linked to that email
     */
    List<Order> findByUserEmail(String email);

    /**
     * Retrieves all orders that match a given Stripe session ID.
     *
     * @param stripeSessionId
     * @return a list of {@link Order} objects matching the session ID
     */
    List<Order> findByStripeSessionId(String stripeSessionId);
}
