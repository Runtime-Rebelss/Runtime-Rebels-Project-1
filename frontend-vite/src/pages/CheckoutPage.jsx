import React, {useState, useEffect, useRef} from 'react';
import {useNavigate, useLocation, Link} from 'react-router-dom';
import Navbar from '../components/Navbar';
import Checkout from '../components/Checkout.jsx';

const hasSaved = new Set();

const CheckoutPage = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const hasRunRef = useRef(false); //  prevents double saves
    const location = useLocation();
    const [cartItems, setCartItems] = useState([]);

    return (
        <div>
            <Navbar/>
            <Checkout/>
        </div>
    )

}

export default CheckoutPage;
