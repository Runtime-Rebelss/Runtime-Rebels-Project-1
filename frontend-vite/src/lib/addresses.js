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

export default { getAddressById, getDefaultAddressById, getAddressesByUserId, setDefaultAddress, updateAddress, removeAddress };
