import { useContext, useCallback, useState, useEffect, useRef } from "react";
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
    const [isPrevDisabled, setIsPrevDisabled] = useState(true);
    const [isNextDisabled, setIsNextDisabled] = useState(false);

    const providers = categories.filter((cat) => cat.code && cat.code !== "home");

    const handleClick = (e, provider) => {
        e.preventDefault();
        onProviderSelect(provider);
    };

    const handleNext = useCallback(() => {
        if (!swiperRef.current || isNextDisabled) return;
        swiperRef.current.swiper.slideNext();
    }, [isNextDisabled]);

    const handlePrev = useCallback(() => {
        if (!swiperRef.current || isPrevDisabled) return;
        swiperRef.current.swiper.slidePrev();
    }, [isPrevDisabled]);

    const updateNavigationState = useCallback(() => {
            if (!swiperRef.current) return;
            
            const swiper = swiperRef.current.swiper;
            setIsPrevDisabled(swiper.isBeginning);
            setIsNextDisabled(swiper.isEnd);
        }, []);
    
    useEffect(() => {
        if (!swiperRef.current) return;
        
        const swiper = swiperRef.current.swiper;
        
        updateNavigationState();
        
        swiper.on('slideChange', updateNavigationState);
        swiper.on('reachBeginning', () => setIsPrevDisabled(true));
        swiper.on('reachEnd', () => setIsNextDisabled(true));
        swiper.on('fromEdge', () => {
            setIsPrevDisabled(false);
            setIsNextDisabled(false);
        });

        return () => {
            swiper.off('slideChange', updateNavigationState);
            swiper.off('reachBeginning', () => setIsPrevDisabled(true));
            swiper.off('reachEnd', () => setIsNextDisabled(true));
            swiper.off('fromEdge', () => {
                setIsPrevDisabled(false);
                setIsNextDisabled(false);
            });
        };
    }, [updateNavigationState]);

    useEffect(() => {
        setTimeout(updateNavigationState, 100);
    }, [providers, updateNavigationState]);    

    return (
        <div className="providers providers--show">
            <h2 className="title wrapper-providers__block-item-title-see-more">
                <span className="image-wrapper">
                    <img src={ImgFooterProvidersIcon} alt="slots" loading="lazy" />
                </span>
                <div className="title__text">Proveedores</div>
                {
                    providers.length > 5 &&
                    <span className="title__slider">
                        <span 
                            className={`title__slider__left ${isPrevDisabled ? 'disabled' : ''}`} 
                            onClick={handlePrev}
                            role="button"
                            tabIndex={0}
                            aria-disabled={isPrevDisabled}
                        ></span>
                        <span 
                            className={`title__slider__right ${isNextDisabled ? 'disabled' : ''}`} 
                            onClick={handleNext}
                            role="button"
                            tabIndex={0}
                            aria-disabled={isNextDisabled}
                        ></span>
                    </span>
                }
            </h2>

            <div className="footer-game-categories-block">
                <ul className="footer-game-categories-block__categories">
                    <Swiper
                        ref={swiperRef}
                        modules={[Navigation]}
                        spaceBetween={15}
                        slidesPerView={7.8}
                        navigation={{
                            prevEl: prevRef.current,
                            nextEl: nextRef.current,
                        }}
                        breakpoints={{
                            320: { slidesPerView: 2.8 },
                            768: { slidesPerView: 5.8 },
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
                                                <span className="text-wrapper">{provider?.name}</span>
                                            </a>
                                        </li>
                                    </SwiperSlide>
                                )
                            })
                        }
                    </Swiper>
                </ul>
            </div>
        </div>
    );
};

export default ProviderContainer;