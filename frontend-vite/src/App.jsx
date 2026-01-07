// javascript
import { Routes, Route, Outlet } from "react-router-dom";

import ProductPage from "./pages/ProductPage";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import ResultsPage from "./pages/ResultsPage";
import OrderSuccessPage from "./pages/OrderSuccessPage.jsx";
import OrderCancelPage from "./pages/OrderCancelPage.jsx";
import OrderPage from "./pages/OrderPage";
import LoginPage from "./pages/Auth/LoginPage.jsx";
import SignUpPage from "./pages/Auth/SignUpPage.jsx";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import AdminPage from "./pages/auth/AdminPage";
import AccountPage from "./pages/AccountPage";
import EditProductPage from "./pages/auth/EditProductPage";
import AddProductPage from "./pages/AddProductPage.jsx";
import UserInfoPage from "./pages/auth/UserInfoPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import EnterEmailPage from "./pages/auth/EmailPage";

function App() {

    return (
        <div className="relative h-full w-full">
            <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 bg-base-100" />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/results" element={<ResultsPage />} />
                <Route path="/order-success" element={<OrderSuccessPage />} />
                <Route path="/order-cancel" element={<OrderCancelPage />} />
                <Route path="/orders" element={<OrderPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="details/:orderId" element={<OrderDetailsPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/admin/edit/:id" element={<EditProductPage />} />
                <Route path="/admin/add" element={<AddProductPage />} />
                <Route path="/account/manage" element={<UserInfoPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/email-reset-password" element={<EnterEmailPage />} />
            </Routes>
        </div>
    );
}

export default App;
