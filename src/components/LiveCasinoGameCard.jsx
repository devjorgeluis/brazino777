const LiveCasinoGameCard = (props) => {
    return (
        <div className="game-lc" onClick={props.onGameClick}>
            <div className="game-lc-ex">
                <a
                    className="game-lc-figure cursor-pointer"
                    style={{
                        backgroundImage: `url(${props.imageSrc})`,
                    }}
                >
                    <div className="livecasino-machine-title">
                        <span>{props.title}</span>
                    </div>
                    <img className="provider" src={props.imageSrc} />
                </a>
                <div className="game-lc-footer">
                    <a href="javascript:void(0)" className="btn btn-pl">Jugar</a>
                    <div className="btn-favorite"><i className="fa-star fa-regular"></i></div>
                </div>
            </div>
        </div>
    );
};

export default LiveCasinoGameCard;
