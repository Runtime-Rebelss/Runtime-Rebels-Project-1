
import { Routes, Route } from "react-router-dom";

import ProductPage from "./pages/ProductPage";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import ResultsPage from "./pages/ResultsPage";
import OrderSuccessPage from "./pages/OrderSuccessPage.jsx";
import OrderCancelPage from "./pages/OrderCancelPage.jsx";
import OrderPage from "./pages/OrderPage";
import LoginPage from "./pages/Auth/LoginPage.jsx";
import SignUpPage from "./pages/Auth/SignUpPage.jsx";
import OrderDetailsPage from "./pages/OrderDetailsPage";

function App() {
    return (
        <div className="relative h-full w-full">
            <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 bg-base-100" />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/results" element={<ResultsPage />} />
                <Route path="/order-success" element={<OrderSuccessPage />} />
                <Route path="/order-cancel" element={<OrderCancelPage />} />
                <Route path="/orders" element={<OrderPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="details/:orderId" element={<OrderDetailsPage />} />
            </Routes>
        </div>
    );
}

export default App;
