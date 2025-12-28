import React, {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router'
import toast from 'react-hot-toast';
import NavBar from '../../components/Navbar.jsx';
import addressService, {getAddressById} from "../../lib/addresses.js";
import {Country, State, City} from 'country-state-city';

const EditAddressPage = () => {
    const [address, setAddress] = useState(null);
    const addressId = address?.id || address?._id || "";
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const {id} = useParams();

    const [countries, setCountries] = useState(Country.getAllCountries());
    const [states, setStates] = useState([]);

    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedState, setSelectedState] = useState("");

    useEffect(() => {
        // Fetch the address data
        const fetchData = async () => {
            try {
                const {data} = await addressService.getAddressById(id);

                setAddress({
                    name: data.name,
                    country: data.country,
                    address: data.address,
                    city: data.city,
                    unit: data.unit,
                    state: data.state,
                    zipCode: data.zipCode,
                    phoneNumber: data.phoneNumber
                });
            } catch (err) {
                console.error("Failed to load address:", err);
                toast.error("Address not found");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [addressId, navigate]);

    const handleCountryChange = (country) => {
        const countryStates = State.getStatesOfCountry(country.isoCode);

        setSelectedCountry(country.name);
        setStates(countryStates);
        setSelectedState(countryStates.length > 0 ? "" : null);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await addressService.updateAddress(addressId, {
                name: address.name,
                country: selectedCountry,
                address: address.address,
                city: address.city,
                unit: address.unit,
                state: states.length > 0 ? selectedState : null,
                zipCode: address.zipCode,
                phoneNumber: address.phoneNumber
            });

            toast.success("Address updated!");
            navigate("/account/addresses");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update address");
        }
    };

    if (loading || !address) {
        return (
            <div className="flex items-center justify-center h-screen">
                <span className="loading loading-spinner loading-xl"></span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200">
            <NavBar/>

            <div className="container mx-auto px-4 py-10">
                <h1 className="text-3xl font-semibold mb-6">Edit Address</h1>

                <form
                    // Fix scrolling issue here
                    onSubmit={handleSubmit}
                    className="max-w-xl mx-auto bg-base-100 p-6 rounded-lg shadow-md space-y-4"
                >
                    {/* COUNTRY */}
                    <div>
                        <label className="label flex">Country/Region</label>
                        <select value={address.country} className="select select-neutral w-full"
                                onChange={(e) =>
                                    setAddress(prev => ({...prev, country: e.target.value})
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
                            value={address.name}
                            onChange={(e) =>
                                setAddress(prev => ({...prev, name: e.target.value})
                                )}
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
                            value={address.phoneNumber}
                            onChange={(e) =>
                                setAddress(prev => ({...prev, phoneNumber: e.target.value})
                                )}
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
                            value={address.address}
                            onChange={(e) =>
                                setAddress(prev => ({...prev, address: e.target.value})
                                )}
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
                            value={address.unit}
                            onChange={(e) =>
                                setAddress(prev => ({...prev, unit: e.target.value})
                                )}
                        />
                    </div>
                    {/* CITY */}
                    <div className="flex">
                        <label className="label grid">City
                            <input
                                type="text"
                                name="city"
                                className="input input-bordered"
                                value={address.city}
                                onChange={(e) =>
                                    setAddress(prev => ({...prev, city: e.target.value})
                                    )}
                                required
                            />
                        </label>
                        {/* STATE */}
                        {states.length > 0 &&
                            <label className="label grid mx-4">State
                                <select
                                    value={address.state || ""}
                                    onChange={(e) => setAddress(prev => ({...prev, state: e.target.value})
                                    )}
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
                                value={address.zipCode}
                                onChange={(e) =>
                                    setAddress(prev => ({...prev, zipCode: e.target.value})
                                    )}
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
    )
}

export default EditAddressPage;