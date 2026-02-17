import { useRef } from 'react';
import { useOutletContext } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ImgBanner1 from "/src/assets/img/casino-slider-1.png";
import ImgBanner2 from "/src/assets/img/casino-slider-2.png";
import ImgBanner3 from "/src/assets/img/casino-slider-3.png";
import ImgBanner4 from "/src/assets/img/casino-slider-4.png";
import ImgBanner5 from "/src/assets/img/casino-slider-5.png";
import ImgBanner6 from "/src/assets/img/casino-slider-6.png";
import ImgBanner7 from "/src/assets/img/casino-slider-7.png";
import ImgBanner8 from "/src/assets/img/casino-slider-8.png";
import ImgBanner9 from "/src/assets/img/casino-slider-9.png";
import ImgBanner10 from "/src/assets/img/casino-slider-10.png";
import ImgRightBanner from "/src/assets/svg/banner.svg";

const CasinoSlideshow = () => {
  const swiperRef = useRef(null);
  const { isMobile } = useOutletContext();

  const slides = [
    { id: 0, image: ImgBanner1 },
    { id: 1, image: ImgBanner2 },
    { id: 2, image: ImgBanner3 },
    { id: 3, image: ImgBanner4 },
    { id: 4, image: ImgBanner5 },
    { id: 5, image: ImgBanner6 },
    { id: 6, image: ImgBanner7 },
    { id: 7, image: ImgBanner8 },
    { id: 8, image: ImgBanner9 },
    { id: 9, image: ImgBanner10 },
  ];

  return (
    <div className="jel-banner-double-container">
      <div className="container">
        <div className="jel-banner-double-container-ex">
          <div className="jel-banner-double-left">
            <div className="swiper-container swiper-initialized swiper-horizontal swiper-backface-hidden">
              <Swiper
                ref={swiperRef}
                modules={[Autoplay, Pagination]}
                slidesPerView={1}
                pagination={{
                  clickable: true,
                  el: '.swiper-pagination',
                }}
                loop={true}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                className="swiper-wrapper"
              >
                {slides.map((slide) => (
                  <SwiperSlide key={slide.id} className="swiper-slide">
                    <div className="top-banner-component">
                      <div className="image-container">
                        <picture>
                          <img
                            className={isMobile ? "display-mobile" : "display-pc"}
                            src={slide.image}
                            alt={`Banner ${slide.id + 1}`}
                            title={`Banner ${slide.id + 1}`}
                            loading="lazy"
                          />
                        </picture>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              <div className="swiper-pagination swiper-pagination-clickable swiper-pagination-bullets swiper-pagination-horizontal" />
            </div>
          </div>
          <div className="jel-banner-double-right">
            <img src={ImgRightBanner} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CasinoSlideshow;