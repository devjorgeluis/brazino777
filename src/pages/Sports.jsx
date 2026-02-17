import { useContext, useState, useEffect } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import { AppContext } from "../AppContext";
import { NavigationContext } from "../components/Layout/NavigationContext";
import { callApi } from "../utils/Utils";

const Sports = () => {
    const pageTitle = "Sports";
    const { contextData } = useContext(AppContext);
    const { setShowFullDivLoading } = useContext(NavigationContext);
    const { isMobile } = useOutletContext();
    const location = useLocation();

    const [sportsEmbedUrl, setSportsEmbedUrl] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSportsPage();
        
        if (!isMobile) {
            document.body.classList.add('sideDiff');
        }

        return () => {
            if (!isMobile) {
                document.body.classList.remove('sideDiff');
            }
        };
    }, [location.pathname, isMobile]);

    const loadSportsPage = () => {
        setIsLoading(true);
        setShowFullDivLoading(true);
        callApi(contextData, "GET", "/get-page?page=sports", callbackGetPage, null);
    };

    const callbackGetPage = (result) => {
        if (result.status === 500 || result.status === 422) {
            setIsLoading(false);
            setShowFullDivLoading(false);
        } else {
            setSportsEmbedUrl(result.data.url_embed);
            setIsLoading(false);
            setShowFullDivLoading(false);
        }
    };

    return (
        <>
            {isLoading ? (
                <></>
            ) : sportsEmbedUrl ? (
                <div className="game-iframe-view_gameIframeWrapper game-iframe-view_sportbook">
                    <iframe
                        src={sportsEmbedUrl}
                        title="Sportsbook"
                        className="game-iframe-view_gameIframe game-iframe-view_sportbook"
                        allowFullScreen
                        loading="lazy"
                        style={{ border: 'none' }}
                    />
                </div>
            ) : (
                <div className="game-iframe-view_gameIframeWrapper game-iframe-view_sportbook">
                    <div className="no-game">
                        <div className="leftWrapper">
                            <p className="forbiddenNumber">403</p>
                            <p className="forbiddenText">
                                Forbidden: Access is denied.
                                Sorry, your location is not covered by our service.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sports;