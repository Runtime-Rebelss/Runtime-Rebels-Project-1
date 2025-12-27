package com.runtimerebels.store.controller;

import com.runtimerebels.store.dao.AddressRepository;
import com.runtimerebels.store.models.Address;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/address")
public class AddressController {

    @Autowired
    private AddressRepository addressRepository;

    // Get all users addresses
    @GetMapping
    public List<Address> findAllAddresses() {
        return addressRepository.findAll();
    }

    // Find via addressId
    @GetMapping("/{addressId}")
    public ResponseEntity<Address> getAddresses(@PathVariable String addressId) {
        return addressRepository.findById(addressId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get address by userId
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Address>> getAddressesByUserId(@PathVariable String userId) {
        List<Address> addresses = addressRepository.findByUserId(userId);

        if (addresses.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(addresses);
    }

    @PutMapping("/default/{addressId}")
    public ResponseEntity<Address> defaultAddress(@PathVariable String addressId) {
        Optional<Address> opt = addressRepository.findById(addressId);
        // Check if address exists
        if (opt.isPresent()) {
            Address address = opt.get();
            // Set all other addresses for the user to not default
            List<Address> userAddresses = addressRepository.findByUserId(address.getUserId());
            for (Address addr : userAddresses) {
                if (addr.isDefault()) {
                    addr.setDefault(false);
                    addressRepository.save(addr);
                }
            }
            // Set the selected address as default
            address.setDefault(true);
            Address updatedAddress = addressRepository.save(address);
            return ResponseEntity.ok(updatedAddress);
        }
        return ResponseEntity.notFound().build();
    }
    // Creates a new address for a user
    @PostMapping("/add/{userId}")
    public ResponseEntity<Address> AddAddress(@PathVariable String userId, @RequestBody Address address) {
        address.setUserId(userId);
        Address savedAddress = addressRepository.save(address);
        address.setDefault(false);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedAddress);
    }

    @DeleteMapping("/delete/{addressId}")
    public ResponseEntity<Address> deleteAddress(@PathVariable String addressId) {
        // Check if the address exists
        if (!addressRepository.existsById(addressId)) {
            System.out.println("poop");
            return ResponseEntity.notFound().build();
        }
        // Delete the address
        addressRepository.deleteById(addressId);

        return ResponseEntity.ok().build();
    }

}
