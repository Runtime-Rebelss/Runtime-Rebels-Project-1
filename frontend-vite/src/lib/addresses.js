import api from "./axios";
import Cookies from "js-cookie"

export async function removeAddress(addressId) {
    const userId = Cookies.get("userId");
    // Check if address exists
    if (!userId) return;
    // Deletes the address for the user
    await api.delete(`/address/delete/${addressId}`);
}

export async function getAddressById(addressId) {
    return api.get(`/address/${addressId}`);
}

export default { removeAddress, getAddressById };