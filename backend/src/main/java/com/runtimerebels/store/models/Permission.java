package com.runtimerebels.store.models;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum Permission {
    CUSTOMER_READ("customer:read"),
    CUSTOMER_DELETE("customer:delete"),
    CUSTOMER_UPDATE("customer:update"),
    CUSTOMER_CREATE("customer:create"),

    ADMIN_READ("admin:read"),
    ADMIN_DELETE("admin:delete"),
    ADMIN_UPDATE("admin:update"),
    ADMIN_CREATE("admin:create");

    @Getter
    private final String permission;

}
