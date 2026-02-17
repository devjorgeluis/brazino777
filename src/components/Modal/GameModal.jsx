import { useState, useEffect } from "react";
import LoadCasino from "../Loading/LoadCasino";

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
    <div className="modal-overlay">
      <div className={`iframe-content ${isFullscreen ? 'fullscreen' : ''}`}>
        <div className="button-container">
          <button className="icon-button" onClick={toggleFullscreen}>
            <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
          </button>
          <button className="icon-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <>
          {!iframeLoaded && <LoadCasino />}
          {gameUrl && (
            <iframe
              src={gameUrl}
              allow="autoplay"
              className="iframe-style"
              onLoad={handleIframeLoad}
              style={{ display: iframeLoaded ? 'block' : 'none' }}
            ></iframe>
          )}
        </>
      </div>
    </div>
  );
};

export default GameModal;