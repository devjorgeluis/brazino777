import { useContext, useCallback, useRef } from 'react';
import { useOutletContext } from "react-router-dom";
import { AppContext } from '../../AppContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import SlideGameCard from '../SlideGameCard';
// import IconArrowLeft from "/src/assets/svg/arrow-left.svg";
// import IconArrowRight from "/src/assets/svg/arrow-right.svg";

const HotGameSlideshow = ({ games, name, title, onGameClick }) => {
    const { contextData } = useContext(AppContext);
    const swiperRef = useRef(null);
    const prevRef = useRef(null);
    const nextRef = useRef(null);
    const { isMobile } = useOutletContext();

    const handleGameClick = (game, isDemo = false) => {
        if (onGameClick) {
            onGameClick(game, isDemo);
        }
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
        <div className="jel-slider-default-five">
            <div className="container">
                <div className="jel-games-module mb-0">
                    <div className="jel-games-module-ex">
                        <div className="jel-games-module-title">
                            <div className="jel-games-module-title-icon color-01">
                                <i className="fa-solid fa-crown"></i>
                            </div>
                            <h2 className="jel-games-module-title-text mb-0" style={{ fontSize: 16 }}>{title}</h2>
                        </div>
                    </div>
                </div>
                <div className="jel-slider-default-five-ex">
                    {
                        games.length > 6 ?
                        <>
                            <Swiper
                                ref={swiperRef}
                                modules={[Navigation]}
                                slidesPerView={6}
                                spaceBetween={0}
                                breakpoints={{
                                    0: { slidesPerView: 3 },
                                    576: { slidesPerView: 4 },
                                    992: { slidesPerView: 6 }
                                }}
                                navigation={{
                                    prevEl: prevRef.current,
                                    nextEl: nextRef.current,
                                }}
                                className="swiper-container swiper-initialized swiper-horizontal"
                            >
                                {games?.map((game, index) => (
                                    <SwiperSlide
                                        key={`hot-${title}-${name}-${game.id ?? index}-${index}`}
                                    >
                                        <SlideGameCard
                                            id={game.id}
                                            category="slide"
                                            provider={title}
                                            title={game.name}
                                            imageSrc={game.image_local !== null ? contextData.cdnUrl + game.image_local : game.image_url}
                                            onGameClick={() => {
                                                handleGameClick(game);
                                            }}
                                        />
                                    </SwiperSlide>
                                ))}
                                <div className="swiper-button-next" onClick={handleNext}><i className="fa-solid fa-angle-right"></i></div>
                                <div className="swiper-button-prev" onClick={handlePrev}><i className="fa-solid fa-angle-left"></i></div>
                            </Swiper>
                        </> :
                        <div className="swiper-container swiper-initialized swiper-horizontal">
                            <div className="swiper-wrapper">
                                {games?.map((game, index) => (
                                    <div
                                        className="swiper-slide"
                                        key={`hot-${title}-${name}-${game.id ?? index}-${index}`}
                                    >
                                        <SlideGameCard
                                            id={game.id}
                                            category="slide"
                                            provider={title}
                                            title={game.name}
                                            imageSrc={game.image_local !== null ? contextData.cdnUrl + game.image_local : game.image_url}
                                            onGameClick={() => {
                                                handleGameClick(game);
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
};

export default HotGameSlideshow;