package com.runtimerebels.store.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(collection = "address")
public class Address {
    private String userId;
    private String country;
    private String address;
    private String city;
    private String state;
    private String zipCode;
}
