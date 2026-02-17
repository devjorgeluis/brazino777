import { useRef } from 'react';
import { useOutletContext } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ImgBanner1 from "/src/assets/img/slider-1.png";
import ImgBanner2 from "/src/assets/img/slider-2.png";
import ImgBanner3 from "/src/assets/img/slider-3.png";
import ImgBanner4 from "/src/assets/img/slider-4.png";
import ImgBanner5 from "/src/assets/img/slider-5.png";
import ImgMobileBanner1 from "/src/assets/img/mobile-slider-1.png";
import ImgMobileBanner2 from "/src/assets/img/mobile-slider-2.png";
import ImgMobileBanner3 from "/src/assets/img/mobile-slider-3.png";
import ImgMobileBanner4 from "/src/assets/img/mobile-slider-4.png";
import ImgMobileBanner5 from "/src/assets/img/mobile-slider-5.png";
import ImgMobileBanner6 from "/src/assets/img/mobile-slider-6.png";

const Slideshow = () => {
  const swiperRef = useRef(null);
  const { isMobile } = useOutletContext();

  const slides = isMobile ? [
    { id: 0, image: ImgMobileBanner1 },
    { id: 1, image: ImgMobileBanner2 },
    { id: 2, image: ImgMobileBanner3 },
    { id: 3, image: ImgMobileBanner4 },
    { id: 4, image: ImgMobileBanner5 },
    { id: 5, image: ImgMobileBanner6 },
  ] : [
    { id: 0, image: ImgBanner1 },
    { id: 1, image: ImgBanner2 },
    { id: 2, image: ImgBanner3 },
    { id: 3, image: ImgBanner4 },
    { id: 4, image: ImgBanner5 },
  ];

  return (
    <div className="w-full relative">
      <div className="jel-banner-container">
        <div className="container">
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
            <div className="disclaimer-container" style={{ display: 'block' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slideshow;