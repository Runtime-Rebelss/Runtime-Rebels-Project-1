package com.runtimerebels.store.models.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {

    private String accessToken;
    private String refreshToken;
    private String userId;
    private String username;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String role;
}
