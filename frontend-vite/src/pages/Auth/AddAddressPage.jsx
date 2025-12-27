import React, {useState, useEffect} from "react";
import Navbar from "../../components/Navbar";
import toast from "react-hot-toast";
import {useNavigate} from "react-router-dom";
import Cookies from "js-cookie";
import api from "../../lib/axios";
import {Country, State, City} from 'country-state-city';

const AddAddressPage = () => {
    const navigate = useNavigate();
    const [showSuccess, setShowSuccess] = useState(false);
    const [countries, setCountries] = useState(Country.getAllCountries());
    const [states, setStates] = useState([]);

    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedState, setSelectedState] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        phoneNumber: "",
        address: "",
        unit: "",
        city: "",
        zipCode: "",
        state: "",
        country: "",
    });

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
    };

    const handleCountryChange = (country) => {
        const countryStates = State.getStatesOfCountry(country.isoCode);

        setSelectedCountry(country.name);
        setStates(countryStates);
        setSelectedState(countryStates.length > 0 ? "" : null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.phoneNumber || !formData.address || !formData.city || !formData.zipCode) {
            toast.error("Please fill all required fields.");
            return;
        }

        const userId = Cookies.get("userId");

        try {
            await api.post(`/address/add/${userId}`, {
                name: formData.name,
                address: formData.address,
                city: formData.city,
                zipCode: formData.zipCode,
                state: states.length > 0 ? selectedState : null,
                country: selectedCountry,
                unit: formData.unit,
                phoneNumber: formData.phoneNumber,
            });
            toast.success("Address added successfully!");
            navigate("/account/addresses");
            setShowSuccess(true);

        } catch (err) {
            console.error(err);
            toast.error("Failed to add address.");
        }
    };

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar/>
            <div className="container mx-auto px-4 py-10">
                <h1 className="text-3xl font-bold mb-6 text-center">
                    Add New Address
                </h1>
                <form
                    onSubmit={handleSubmit}
                    className="max-w-xl mx-auto bg-base-100 p-6 rounded-lg shadow-md space-y-4"
                >
                    {/* COUNTRY */}
                    <div>
                        <label className="label flex">Country/Region</label>
                        <select value={selectedCountry} className="select select-neutral w-full"
                                onChange={(e) =>
                                    handleCountryChange(
                                        countries.find((c) => c.name === e.target.value),
                                    )
                                }>
                            <option value="" disabled>Select Country</option>
                            {countries.map((country) => (
                                <option key={country.name} value={country.name}>{country.name}</option>
                            ))}
                        </select>
                    </div>
                    {/* NAME */}
                    <div>
                        <label className="label">Full name</label>
                        <input
                            type="text"
                            name="name"
                            className="input input-bordered w-full"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {/* PHONE NUMBER */}
                    <div>
                        <label className="label">Phone number</label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            className="input input-bordered w-full"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {/* STREET ADDRESS */}
                    <div>
                        <label className="label">Street address</label>
                        <input
                            type="text"
                            name="address"
                            placeholder="Street address or P.O. Box"
                            className="input input-bordered w-full"
                            value={formData.address}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {/* UNIT OR SUITE NUMBER */}
                    <div>
                        <label className="label">Unit or suite number (Optional)</label>
                        <input
                            type="text"
                            name="unit"
                            placeholder="Apt, suite, unit, building, floor, etc."
                            className="input input-bordered w-full"
                            value={formData.unit}
                            onChange={handleChange}
                        />
                    </div>
                    {/* CITY */}
                    <div className="flex">
                        <label className="label grid">City
                            <input
                                type="text"
                                name="city"
                                className="input input-bordered"
                                value={formData.city}
                                onChange={handleChange}
                                required
                            />
                        </label>
                        {/* STATE */}
                        {states.length > 0 &&
                        <label className="label grid mx-4">State
                            <select
                                value={selectedState || ""}
                                onChange={(e) => setSelectedState(e.target.value)}
                                className="select select-neutral"
                                required
                            >
                                <option value="">Select</option>
                                {states.map((state) => (
                                    <option key={state.isoCode} value={state.isoCode}>
                                        {state.name}</option>
                                ))}
                            </select>
                        </label>
                        }
                        {/* ZIP CODE */}
                        <label className="label grid flex mx-4">ZIP Code
                            <input
                                type="text"
                                name="zipCode"
                                className="input input-bordered"
                                value={formData.zipCode}
                                onChange={handleChange}
                                required
                            />
                        </label>
                    </div>
                    <button type="submit" className="btn btn-primary w-full mt-4">
                        Add Address
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddAddressPage;
