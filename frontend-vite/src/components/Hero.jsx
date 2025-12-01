import React from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";

/**
 * Hero carousel for the homepage. Shows promotional slides for products.
 * 
 * @author Frank Gonzalez, Haley Kenney
 * @since 11-19-2025
 * @returns {JSX.Element}
 */
const Hero = () => {
    return (
        <div className="w-full mb-10 overflow-hidden">
            <Carousel
                autoPlay={true}
                infiniteLoop={true}
                interval={4000}
                transitionTime={800}
                stopOnHover={false}
                showArrows={true}
                showThumbs={false}
                showStatus={false}
                swipeable={true}
                emulateTouch={true}
            >
                {/* Slide 1 */}
                <div className="relative">
                    <img
                        src="https://images.unsplash.com/photo-1542291026-7eec264c27ff"
                        alt="Shoes"
                        className="object-cover h-[400px] md:h-[500px] lg:h-[600px] w-full"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-start pl-10 text-white">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Step Up Your Game
                        </h1>
                        <p className="mb-6 text-lg max-w-md text-justify leading-relaxed">
                            Discover our latest sports footwear and equipment to elevate your performance.
                        </p>
                        <a href="/results?categories=sports%2Band%2Boutdoor" className="btn btn-primary">
                            Shop Now
                        </a>
                    </div>
                </div>

                {/* Slide 2 */}
                <div className="relative">
                    <img
                        src="https://images.unsplash.com/photo-1724184888115-e76e42f53dcc?q=80&w=2532&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Clothing"
                        className="object-cover h-[400px] md:h-[500px] lg:h-[600px] w-full"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-start pl-10 text-white">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            New Season, New Style
                        </h1>
                        <p className="mb-6 text-lg max-w-md text-justify leading-relaxed">
                            Refresh your wardrobe with the latest trends and timeless pieces.
                        </p>
                        <a href="/results?categories=clothing" className="btn btn-primary">
                            Explore Now
                        </a>
                    </div>
                </div>

                {/* Slide 3 */}
                <div className="relative">
                    <img
                        src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Tech Accessories"
                        className="object-cover h-[400px] md:h-[500px] lg:h-[600px] w-full"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-start pl-10 text-white">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Need a Tech Upgrade?
                        </h1>
                        <p className="mb-6 text-lg max-w-md text-justify leading-relaxed">
                            From hard drives to cables, find the accessories you need to stay connected.
                        </p>
                        <a href="/results?categories=electronics" className="btn btn-primary">
                            Shop Electronics
                        </a>
                    </div>
                </div>
            </Carousel>
        </div>
    );
};

export default Hero;
