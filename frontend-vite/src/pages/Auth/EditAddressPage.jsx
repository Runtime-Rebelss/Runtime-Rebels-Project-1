import React, {useEffect, useState} from 'react'
import { useNavigate} from 'react-router'
import toast from 'react-hot-toast';
import addressService from "../../lib/addresses.js";
import {getProductById} from "../../lib/products.js";

const EditAddressPage = () => {
    const [address, setAddress] = useState(null);
    const addressId = address?.id || address?._id || "";
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

useEffect(() => {
    // Fetch the address data
    const fetchData = async () => {
        try {
            const { data } = await addressService.getAddressById(addressId);

            setAddress({
                country: data.country,
                address: data.address,
                city: data.city,
                unit: data.unit,
                state: data.state,
                zipCode: data.zipCode,
                phoneNumber: data.phoneNumber
            });
        } catch (err) {
            console.error("Failed to load product:", err);
            toast.error("Product not found");
        } finally {
            setLoading(false);
        }
    };

    fetchData();
}, [addressId, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await addressService.updateAddress(addressId, {
                country: address.country,
                address: address.address,
                city: address.city,
                unit: address.unit,
                state: address.state,
                zipCode: address.zipCode,
                phoneNumber: address.phoneNumber
            });

            toast.success("Address updated!");
            navigate("/account/addresses");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update address");
        }
    };

    return <div>Edit Address Page</div>;
}

export default EditAddressPage;