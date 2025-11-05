import { Routes, Route } from "react-router-dom";

import ProductPage from "./pages/ProductPage";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ResultsPage from "./pages/ResultsPage";
//import LoginPage from "./pages/Auth/LoginPage.jsx";
//import SignUpPage from "./pages/Auth/SignUpPage.jsx";

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
            </Routes>
        </div>
    );
}

export default App;
