import { Routes, Route } from "react-router-dom";
import ProductList from "./components/ProductList";
import ProductDetails from "./components/ProductDetails";

function App() {
    return (
        <>
            <h1>Hello from Vite + React 🚀</h1>
            {/* <button className="btn btn-soft btn-error">Error</button> */}
            <Routes>
                <Route path="/" element={<ProductList />} />
                <Route path="/products/:id" element={<ProductDetails />} />
            </Routes>
        </>
    );
}

export default App;
