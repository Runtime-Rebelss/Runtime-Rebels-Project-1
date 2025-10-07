import React from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";

const Hero = () => {
    return (
        <div className="w-full mb-10 rounded-xl overflow-hidden">
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
                            Step into your style
                        </h1>
                        <p className="mb-6 text-lg max-w-md text-justify leading-relaxed">
                            Discover our latest collection of shoes, apparel, and accessories.
                        </p>
                        <a href="/products" className="btn btn-primary">
                            Shop Now
                        </a>
                    </div>
                </div>

                {/* Slide 2 */}
                <div className="relative">
                    <img
                        src="https://images.unsplash.com/photo-1514996937319-344454492b37"
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
                        <a href="/products" className="btn btn-primary">
                            Explore Now
                        </a>
                    </div>
                </div>

                {/* Slide 3 */}
                <div className="relative">
                    <img
                        src="https://images.unsplash.com/photo-1606813903219-1b5d0c68af97"
                        alt="Accessories"
                        className="object-cover h-[400px] md:h-[500px] lg:h-[600px] w-full"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-start pl-10 text-white">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Complete Your Look
                        </h1>
                        <p className="mb-6 text-lg max-w-md text-justify leading-relaxed">
                            From statement accessories to everyday essentials — find it all here.
                        </p>
                        <a href="/products" className="btn btn-primary">
                            Shop Accessories
                        </a>
                    </div>
                </div>
            </Carousel>
        </div>
    );
};

export default Hero;
