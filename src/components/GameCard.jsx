const GameCard = (props) => {
  return (
    <div className="float-casino-search-item" onClick={props.onGameClick}>
      <div className="game-art">
        <a className="game-art-ex" href="#">
          <span
            className="game-art-figure"
            style={{
              backgroundImage: `url(${props.imageSrc})`,
            }}
          >
            <span className="game-art-only">
              <span className="game-art-only-i">
                <i className="fa-solid fa-user front"></i>
                <i className="fa-solid fa-user back"></i>
              </span>
              0
            </span>

            <span className="game-art-figure-hover">
              <span className="game-art-figure-hover-ex">
                <span className="game-art-figure-hover-item">
                  <span
                    className="game-art-figure-hover-item-top"
                    style={{ display: "none" }}
                  >
                    Jackpot
                  </span>
                  <span className="game-art-figure-hover-item-bottom">
                    {props.title || "Giga Match Gems"}
                  </span>
                </span>

                <span
                  className="game-art-figure-hover-item"
                  style={{ display: "none" }}
                >
                  <span className="game-art-figure-hover-item-top">
                    Effective RTP
                  </span>
                  <span className="game-art-figure-hover-item-bottom">
                    {props.rtp || "98.00%"}
                  </span>
                </span>
              </span>
            </span>
          </span>

          <span className="game-art-name">
            {props.title || "Giga Match Gems"}
          </span>

          <span className="game-art-date">
            {props.provider || "casino"}
          </span>

          <span className="game-art-favorite">
            <i className="fa-star fa-regular"></i>
          </span>
        </a>
      </div>
    </div>
  );
};

export default GameCard;
