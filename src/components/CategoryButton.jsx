const CategoryButton = ({ name, image, active = false, onClick }) => {
  const baseClass = "category-block__item category-block__item-- category-block__item--carnival";
  const activeClass = active ? "category-block__item--selected" : "";

  return (
    <a className={`${baseClass} ${activeClass}`} onClick={onClick}>
      <img src={image} alt={name} width={35} />
      <span className="category-block__item__text">{name}</span>
    </a>
  );
};

export default CategoryButton;