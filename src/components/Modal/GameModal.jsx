import { useState, useEffect } from "react";
import LoadPage from "../Loading/LoadPage";

const GameModal = ({
  gameUrl,
  gameName,
  gameImg,
  onClose,
  isMobile,
}) => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isMobile && gameUrl) {
      window.location.href = gameUrl;
    }
  }, [gameUrl, isMobile]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const elem = document.documentElement;
    if (!isFullscreen) {
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    }
  };

  const handleIframeLoad = () => {
    setIframeLoaded(true);
  };

  if (isMobile) return null;

  return (
    <div className="game--page">
      {!iframeLoaded && <LoadPage />}
      <div className={`game-wrapper game-wrapper--desktop ${isFullscreen ? "game-wrapper--fullscreen" : ""}`}>
        <div className="game-controls">
          <div className="game-controls__left">
            <a className="game-control-button go-back" onClick={onClose}></a>
            <h1 className="game-title">{gameName}</h1>
          </div>
          <div className="game-controls__right">
            <span className="game-control-button fullscreen" onClick={toggleFullscreen}>
              <span></span>
            </span>
            <a className="game-control-button exit" onClick={onClose}></a>
          </div>
        </div>
        <div className="game">
          <div className="overlay overlay--initial">
            <img
              src={gameImg}
              alt="image overlay"
            />
            <div className="overlay-content"></div>
          </div>
          <div id="game_wrapper">
            {gameUrl && (
              <iframe
                src={gameUrl}
                allow="autoplay"
                className="iframe-style"
                onLoad={handleIframeLoad}
                style={{ display: iframeLoaded ? 'block' : 'none' }}
              ></iframe>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameModal;