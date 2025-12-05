import api from "./axios";

export function deleteProduct(id) {
    return api.delete(`/products/${id}`);
}

export function updateProduct(id, data) {
    return api.put(`/products/${id}`, data);
}

export function getProductById(id) {
    return api.get(`/products/${id}`);
}
