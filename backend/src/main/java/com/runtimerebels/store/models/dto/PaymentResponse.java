package com.runtimerebels.store.models.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class PaymentResponse {

    private String id;
    private String clientSecret;
    private Long amount;
    private String currency;
    private String status;
}
