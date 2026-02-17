import { useContext, useCallback, useRef } from "react";
import { AppContext } from "../AppContext";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const ProviderContainer = ({
    categories,
    onProviderSelect,
}) => {
    const { contextData } = useContext(AppContext);
    const swiperRef = useRef(null);
    const prevRef = useRef(null);
    const nextRef = useRef(null);

    const providers = categories.filter((cat) => cat.code && cat.code !== "home");

    const handleClick = (e, provider) => {
        e.preventDefault();
        onProviderSelect(provider);
    };

    const handleNext = useCallback(() => {
        if (!swiperRef.current) return;
        swiperRef.current.swiper.slideNext();
    }, []);

    const handlePrev = useCallback(() => {
        if (!swiperRef.current) return;
        swiperRef.current.swiper.slidePrev();
    }, []);

    return (
        <div className="jel-games-providers-module">
            <div className="container">
                <div className="jel-games-providers-module-ex">
                    <div className="jel-games-providers-module-title">
                        <div className="jel-games-providers-module-title-icon"><i className="fa-solid fa-dice"></i></div>
                        <div className="jel-games-providers-module-title-text">Proveedores</div>
                    </div>

                    <div className="jel-games-providers-module-body">
                        <div className="jel-games-providers-module-body-ex">
                            <Swiper
                                ref={swiperRef}
                                modules={[Navigation]}
                                spaceBetween={0}
                                slidesPerView={6}
                                navigation={{
                                    prevEl: prevRef.current,
                                    nextEl: nextRef.current,
                                }}
                                breakpoints={{
                                    320: { slidesPerView: 2 },
                                    768: { slidesPerView: 4 },
                                    1280: { slidesPerView: 6 },
                                }}
                                className="swiper-container swiper-initialized swiper-horizontal"
                            >
                                {
                                    providers.map((provider, idx) => {
                                        const imageUrl = provider.image_local
                                            ? `${contextData.cdnUrl}${provider.image_local}`
                                            : provider.image_url;

                                        return (
                                            <SwiperSlide key={idx} className="swiper-slide">
                                                <div className="jel-games-provider-art" onClick={(e) => handleClick(e, provider)}>
                                                    <a className="jel-games-provider-art-ex cursor-pointer">
                                                        {
                                                            provider.image_local ? 
                                                            <span className="jel-games-provider-art-figure" title={provider?.name} style={{backgroundImage: `url(${imageUrl})`}}></span> :
                                                            <span className="jel-games-provider-art-figure jel-games-provider-art-text">{ provider?.name }</span>
                                                        }

                                                        <span className="btn jel-games-provider-btn">Ver juegos</span>
                                                    </a>
                                                </div>
                                            </SwiperSlide>
                                        )
                                    })
                                }

                                {
                                    providers.length > 5 && <>
                                        <div className="swiper-button-next" onClick={handleNext}><i className="fa-solid fa-angle-right"></i></div>
                                        <div className="swiper-button-prev" onClick={handlePrev}><i className="fa-solid fa-angle-left"></i></div>  
                                    </>
                                }
                            </Swiper>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderContainer;