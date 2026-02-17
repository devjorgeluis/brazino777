import { useContext, useCallback, useRef } from "react";
import { AppContext } from "../AppContext";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import ImgFooterProvidersIcon from "/src/assets/svg/footerProvidersIcon.svg";

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
        <div className="providers providers--show">
            <h2 className="title wrapper-providers__block-item-title-see-more">
                <span className="image-wrapper">
                    <img src={ImgFooterProvidersIcon} alt="slots" loading="lazy" />
                </span>
                <div className="title__text">Proveedores</div>
                <span className="title__slider">
                    <span className="title__slider__left"></span>
                    <span className="title__slider__right"></span>
                </span>
            </h2>

            <div className="footer-game-categories-block">
                <ul className="footer-game-categories-block__categories">
                    <Swiper
                        ref={swiperRef}
                        modules={[Navigation]}
                        spaceBetween={0}
                        slidesPerView={7.8}
                        navigation={{
                            prevEl: prevRef.current,
                            nextEl: nextRef.current,
                        }}
                        breakpoints={{
                            320: { slidesPerView: 2 },
                            768: { slidesPerView: 4 },
                            1280: { slidesPerView: 7.8 },
                        }}
                    >
                        {
                            providers.map((provider, idx) => {
                                const imageUrl = provider.image_local
                                    ? `${contextData.cdnUrl}${provider.image_local}`
                                    : provider.image_url;

                                return (
                                    <SwiperSlide key={idx} className="swiper-slide">
                                        <li key={idx} className="category" onClick={(e) => handleClick(e, provider)}>
                                            <a>
                                                <span className="image-wrapper">
                                                    <img src={imageUrl} alt={provider?.name} />
                                                </span>
                                                <span className="text-wrapper">{ provider?.name }</span>
                                            </a>
                                        </li>
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
                </ul>
            </div>
        </div>
    );
};

export default ProviderContainer;