const SlideGameCard = (props) => {
  const providerParts = props.provider?.trim().split(" ") || [];
  const mainTitle = providerParts[0] || "";
  const subTitle = providerParts.length > 1 ? providerParts.slice(1).join(" ") : "";

  return (
    <div className="jel-slider-default-art">
      <div className="jel-slider-default-art-ex">
        <a
          className="cy-live-casino-grid-item-thumbnail cursor-pointer"
          onClick={props.onGameClick}
        >
          <span className="a-hover">
            <span className="a-hover-title">
              {mainTitle}

              {subTitle && (
                <span className="a-hover-title-subtitle">
                  {subTitle}
                </span>
              )}
            </span>

            <span className="a-hover-footer">
              <span className="a-hover-footer-name">{props.title}</span>
            </span>
          </span>

          <div className="fav">
            <i className="fa-regular fa-star"></i>
          </div>

          <img src={props.imageSrc} alt={props.title} />
        </a>
      </div>
    </div>
  );
};

export default SlideGameCard;
