package com.runtimerebels.store.models.dto;

import java.math.BigDecimal;

public record AddOrUpdateItemRequest(String productId, int quantity, BigDecimal price) {
}
