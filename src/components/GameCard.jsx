const GameCard = (props) => {
  return (
    <div className="games-block__game games-block__game--interactive" onClick={props.onGameClick}>
      <a href="">
        <img className="game-image" src={props.imageSrc} loading="lazy" alt={props.title}></img>
      </a>
      <div className="game-hover">
        <p className="game-title">{props.title}</p>
        <a href="/game/once_again_upon_a_time_hold_win_ss" className="button button--play" data-ajax="false">Jugar</a>
      </div>
      <div className="game-title-wrapper">
        <p className="game-title">{props.title}</p>
        <p className="game-producer">{props.provider}</p>
      </div>
    </div>
  );
};

export default GameCard;
