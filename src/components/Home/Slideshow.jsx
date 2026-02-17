import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import ImgBanner1 from "/src/assets/img/slider-1.jpg";
import ImgBanner2 from "/src/assets/img/slider-2.jpg";
import ImgBanner3 from "/src/assets/img/slider-3.jpg";
import ImgBanner4 from "/src/assets/img/slider-4.jpg";
import ImgBanner5 from "/src/assets/img/slider-5.jpg";
import ImgBanner6 from "/src/assets/img/slider-6.jpg";
import ImgBanner7 from "/src/assets/img/slider-7.jpg";
import ImgBanner8 from "/src/assets/img/slider-8.jpg";
import ImgBanner9 from "/src/assets/img/slider-9.jpg";

const Slideshow = () => {
  const swiperRef = useRef(null);

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
  ];

  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.swiper.slideNext();
    }
  };

  const handlePrev = () => {
    if (swiperRef.current) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  return (
    <div id="vue-slider-block">
      <div className="swiper-container swiper-container-initialized swiper-container-horizontal swiper-container-pointer-events">
        <Swiper
          ref={swiperRef}
          modules={[Autoplay]}
          slidesPerView={1.3}
          centeredSlides={true}
          spaceBetween={80}
          loop={true}
          autoplay={{
            delay: 300000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            320: { spaceBetween: 0, slidesPerView: 1 },
            1200: { spaceBetween: 80, slidesPerView: 1 },
          }}
          className="swiper-wrapper swiper-wrapper-container"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id} className="swiper-slide">
              <picture>
                <img
                  className="swiper-slide__background swiper-lazy swiper-lazy-loaded"
                  src={slide.image}
                  alt={`Banner ${slide.id + 1}`}
                  title={`Banner ${slide.id + 1}`}
                  loading="lazy"
                />
              </picture>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="swiper-navigation">
          <div className="swiper-button-prev" onClick={handlePrev}></div>
          <div className="swiper-button-next" onClick={handleNext}></div>
        </div>
      </div>
    </div>
  );
};

export default Slideshow;