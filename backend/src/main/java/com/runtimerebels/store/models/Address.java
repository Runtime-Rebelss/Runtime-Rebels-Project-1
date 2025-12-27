package com.runtimerebels.store.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(collection = "address")
public class Address {
    @Id
    private String id;

    private String userId;
    private String country;
    private String address;
    private String city;
    private String unit;
    private String state;
    private String zipCode;
    private boolean isDefault;
}
