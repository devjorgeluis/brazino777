import { useCallback } from "react";
import CategoryButton from "./CategoryButton";

const CategoryContainer = (props) => {
  const handleCategoryClick = useCallback((category, index) => {
    if (props.onCategoryClick) {
      props.onCategoryClick(category, category.id, category.table_name, index, true);
    }
    if (props.onCategorySelect) {
      props.onCategorySelect(category);
    }
  }, [props]);

  if (!props.categories || props.categories.length === 0) {
    return null;
  }

  return (
    <nav className="category-block category-block--align-center">
      {
        props.categories.map((category, index) => (
          <CategoryButton
            key={category.id ?? category.code ?? index}
            name={category.name}
            code={category.code}
            image={category.image}
            active={props.selectedCategoryIndex === index}
            onClick={() => handleCategoryClick(category, index)}
          />
        )
        )
      }
    </nav>
  );
};

export default CategoryContainer;