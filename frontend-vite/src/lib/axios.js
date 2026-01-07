import axios from "axios";

const defaultBaseURL = import.meta.env.DEV
    ? "http://localhost:8080/api"
    : "https://scamazon-backend.onrender.com/api";

// Set via Vite env vars:
// - .env.development / .env.production
// - or shell: VITE_API_BASE_URL=... npm run dev|build
const baseURL = import.meta.env.VITE_API_BASE_URL || defaultBaseURL;

const api = axios.create({
    baseURL,
    withCredentials : true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Attach auth header when token is present in localStorage
api.interceptors.request.use((config) => {
    try {
        // Don't attach Authorization header for auth endpoints (login/register/signup/refresh)
        // Note: payments endpoints should receive an Authorization header when a token exists.
        const skipAuthPaths = ['/auth/login', '/auth/register', '/auth/signup', '/auth/refreshToken', '/auth/refresh'];
        const requestPath = (config.url || '').toString();
        const isAuthRequest = skipAuthPaths.some(p => requestPath.includes(p));

        if (!isAuthRequest) {
            const token = localStorage.getItem('authToken') || localStorage.getItem('token');
            if (token) {
                config.headers = config.headers || {};
                if (!config.headers.Authorization && !config.headers.authorization) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        }
    } catch (e) {
        // ignore errors reading localStorage
    }
    return config;
}, (error) => Promise.reject(error));

export default api;