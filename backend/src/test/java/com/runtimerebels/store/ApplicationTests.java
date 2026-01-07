package com.runtimerebels.store;

import com.runtimerebels.store.dao.CartRepository;
import com.runtimerebels.store.dao.CartItemRepository;
import com.runtimerebels.store.dao.OrderRepository;
import com.runtimerebels.store.dao.ProductRepository;
import com.runtimerebels.store.dao.UserRepository;
import com.runtimerebels.store.dao.TokenRepository;
import org.junit.jupiter.api.Test;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest
class ApplicationTests {

	@MockBean
	private CartRepository cartRepository;

	@MockBean
	private CartItemRepository cartItemRepository;

	@MockBean
	private OrderRepository orderRepository;

	@MockBean
	private ProductRepository productRepository;

	@MockBean
	private MongoTemplate mongoTemplate;

	@MockBean
	private UserRepository userRepository;

	@MockBean
	private TokenRepository tokenRepository;

	@Test
	void contextLoads() {
	}

}
