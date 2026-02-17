const CategoryButton = ({ name, image, active = false, onClick }) => {
  const baseClass = "swiper-slide";
  const baseSubClass = "filter-lc-ex";

  const activeClass = active ? "swiper-slide-active" : "";
  const activeSubClass = active ? "active" : "";

  return (
    <div className={`${baseClass} ${activeClass}`} onClick={onClick}>
      <div className="filter-lc">
        <div className={`${baseSubClass} ${activeSubClass}`}>
          <img src={image} alt={name} width={35} />
          <br />
          {name}
        </div>
      </div>
    </div>
  );
};

export default CategoryButton;