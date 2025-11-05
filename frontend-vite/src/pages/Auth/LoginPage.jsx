import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Search, Menu, X, Mail, Phone, User } from 'lucide-react';

const LoginPage = () => {
    // Need to check if user has account already
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    // Create nav bar here too



    // Need to get email and password
}

export default LoginPage;