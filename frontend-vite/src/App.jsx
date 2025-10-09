import { Routes, Route } from "react-router-dom";
import ProductList from "./components/ProductList.jsx";
import ProductDetails from "./components/ProductDetails.jsx";
import AddToCartButton from "./components/AddToCartButton.jsx";

function App() {
    return (
        <>
            <h1>Hello from Vite + React 🚀</h1>
            {/* <button className="btn btn-soft btn-error">Error</button> */}
            <Routes>
                <Route path="/" element={<ProductList />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/cart/add/:productId" element={<AddToCartButton />} />
            </Routes>
        </>
    );
}

export default App;
