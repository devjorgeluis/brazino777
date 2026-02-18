import { useContext, useCallback, useRef, useEffect, useState } from 'react';
import { useOutletContext } from "react-router-dom";
import { AppContext } from '../../AppContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import GameCard from '../GameCard';

const HotGameSlideshow = ({ games, name, title, onGameClick }) => {
    const { contextData } = useContext(AppContext);
    const swiperRef = useRef(null);
    const prevRef = useRef(null);
    const nextRef = useRef(null);
    const [isPrevDisabled, setIsPrevDisabled] = useState(true);
    const [isNextDisabled, setIsNextDisabled] = useState(false);

    const handleGameClick = (game, isDemo = false) => {
        if (onGameClick) {
            onGameClick(game, isDemo);
        }
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
    }, [games, updateNavigationState]);

    return (
        <div className="new-block games-block-wrapper">
            <h2 className="title title--new title--categories">
                <a className="title__text">
                    {title}
                </a>
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
            </h2>
            <div className="games-block">
                {
                    games.length >= 6 ?
                    <>
                        <Swiper
                            ref={swiperRef}
                            modules={[Navigation]}
                            slidesPerView={6.2}
                            spaceBetween={10}
                            breakpoints={{
                                0: { slidesPerView: 2.8 },
                                576: { slidesPerView: 5.8 },
                                992: { slidesPerView: 6.2 }
                            }}
                            navigation={{
                                prevEl: prevRef.current,
                                nextEl: nextRef.current,
                            }}
                            className="swiper-wrapper"
                            onInit={updateNavigationState}
                        >
                            {games?.map((game, index) => (
                                <SwiperSlide
                                    key={`hot-${title}-${name}-${game.id ?? index}-${index}`}
                                >
                                    <GameCard
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
                        </Swiper>
                    </> :
                    <div className="swiper-wrapper">
                        {games?.map((game, index) => (
                            <div
                                className="swiper-slide"
                                key={`hot-${title}-${name}-${game.id ?? index}-${index}`}
                            >
                                <GameCard
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
                }
            </div>
        </div>
    );
};

export default HotGameSlideshow;