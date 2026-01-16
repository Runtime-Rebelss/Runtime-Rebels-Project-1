import React, {useEffect, useState} from "react";
import Navbar from "../components/Navbar";
import AvatarCard from "../components/AvatarCard.jsx";

const AboutPage = () => {
    const [devs, setDevs] = useState([]);

    useEffect(() => {
        fetch(`${import.meta.env.BASE_URL}team.json`)
            .then((response) => response.json())
            .then((data) => setDevs(data))
            .catch((error) => console.error("Error fetching team data:", error));
    }, []);

    return (
        <div>
            <Navbar/>
            <div className="container mx-auto px-4 py-8 p-5 max-w">
                <h1 className="text-2xl font-semibold mb-6">
                    About Scamazon
                </h1>
                <p>
                    Scamazon is a ecommerce website built for educational purposes as part of
                    a class project. It is not affiliated with or endorsed by Amazon in any way.
                </p>
                <p className="mt-4">
                    This project was created to demonstrate web development skills including
                    frontend and backend development, user authentication, and e-commerce functionality.
                </p>
                <h1 className="text-2xl font-semibold mt-4">Contributors</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {devs.map((dev) => (
                        <AvatarCard key={dev.id} avatar={dev.avatar} name={dev.name} github={dev.github} linkedin={dev.linkedin}/>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AboutPage;
