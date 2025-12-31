import {Link} from "react-router-dom";
import React, {useState} from "react";
import toast from "react-hot-toast";
import checkoutService from "../lib/checkout";
import {useNavigate} from "react-router-dom";

const CheckoutCard = ({ item }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    return (
        <div>s</div>
    )
}

export default CheckoutCard;