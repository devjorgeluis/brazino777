import { useContext, useCallback, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import CategoryButton from "./CategoryButton";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const CategoryContainer = (props) => {
  const { isMobile } = useOutletContext();
  const swiperRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const handleCategoryClick = useCallback((category, index) => {
    if (props.onCategoryClick) {
      props.onCategoryClick(category, category.id, category.table_name, index, true);
    }
    if (props.onCategorySelect) {
      props.onCategorySelect(category);
    }
  }, [props]);

  const handleNext = useCallback(() => {
    if (!swiperRef.current) return;
    swiperRef.current.swiper.slideNext();
  }, []);

  const handlePrev = useCallback(() => {
    if (!swiperRef.current) return;
    swiperRef.current.swiper.slidePrev();
  }, []);

  if (!props.categories || props.categories.length === 0) {
    return null;
  }

  return (
    <>
      <nav className="filter-and-search-relative">
        <div className="filter-and-search-cat">
          <div className="filter-content">
            <div className="swiper-container">
              <div className="swiper-wrapper justify-content-center">
                {isMobile && props.categories.length > 0 ? (
                  <Swiper
                    ref={swiperRef}
                    modules={[Navigation]}
                    spaceBetween={0}
                    slidesPerView={5}
                    navigation={{
                      prevEl: prevRef.current,
                      nextEl: nextRef.current,
                    }}
                    breakpoints={{
                      320: { slidesPerView: 4 },
                    }}
                    className="swiper-container swiper-initialized swiper-horizontal"
                  >
                    {props.categories.map((category, idx) => {
                      return (
                        <SwiperSlide key={idx} className="swiper-slide">
                          <CategoryButton
                            key={category.id ?? category.code ?? idx}
                            name={category.name}
                            code={category.code}
                            image={category.image}
                            active={props.selectedCategoryIndex === idx}
                            onClick={() => handleCategoryClick(category, idx)}
                          />
                        </SwiperSlide>
                      );
                    })}
                    {
                      props.categories.length > 4 && <>
                        <div className="swiper-button-next" onClick={handleNext}>
                          <i className="fa-solid fa-angle-right"></i>
                        </div>
                        <div className="swiper-button-prev" onClick={handlePrev}>
                          <i className="fa-solid fa-angle-left"></i>
                        </div>
                      </>
                    }
                  </Swiper>
                ) : (
                  props.categories.map((category, index) => (
                    <CategoryButton
                      key={category.id ?? category.code ?? index}
                      name={category.name}
                      code={category.code}
                      image={category.image}
                      active={props.selectedCategoryIndex === index}
                      onClick={() => handleCategoryClick(category, index)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default CategoryContainer;