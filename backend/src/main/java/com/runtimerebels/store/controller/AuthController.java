package com.runtimerebels.store.controller;

import com.runtimerebels.store.dao.UserRepository;
import com.runtimerebels.store.models.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


/**
 * REST controller responsible for authentication-related endpoints.
 *
 * <p>
 *     This controller wills erve as the entry point for user authentication
 *     opperations such as login, registration, and token validiation under the
 *     base path <code>/api/auth</code>.
 * </p>
 *
 * @author Henry Locke, Alexander Nima
 * @since 11-19-2025
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;


}
