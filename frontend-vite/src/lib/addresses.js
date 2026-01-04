import api from "./axios";
import Cookies from "js-cookie"

export async function getAddressById(addressId) {
    return api.get(`/address/${addressId}`);
}

export async function getDefaultAddressById(addressId) {
    return api.get(`/address/default/${addressId}`);
}

export async function getAddressesByUserId(userId) {
    if (!userId) return null;
    return api.get(`/address/user/${encodeURIComponent(userId)}`);
}

export async function setDefaultAddress(addressId) {
    window.location.reload();
    return api.put(`/address/default/${addressId}`);
}

export async function setAddressShipTo(addressId) {
    window.location.reload();
    return api.put(`/address/shipTo/${addressId}`);
}

export async function updateAddress(addressId, data) {
    return api.put(`/address/update/${addressId}`, data);
}

export async function removeAddress(addressId) {
    const userId = Cookies.get("userId");
    // Check if address exists
    if (!userId) return;
    window.location.reload();
    // Deletes the address for the user
    return await api.delete(`/address/delete/${addressId}`);
}

export function formatPhoneNumber(phoneNumberString) {
    // Remove any invalid characters
    const cleaned = ('' + phoneNumberString).replace(/\D/g, '');

    // Format the number as XXX-XXX-XXXX
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

    if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`;
    }

    return phoneNumberString;
}

export default {
    getAddressById,
    getDefaultAddressById,
    getAddressesByUserId,
    setDefaultAddress,
    setAddressShipTo,
    updateAddress,
    removeAddress,
    formatPhoneNumber
};
