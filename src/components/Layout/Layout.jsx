import { useContext, useState, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../AppContext";
import { LayoutContext } from "./LayoutContext";
import { NavigationContext } from "./NavigationContext";
import { callApi } from "../../utils/Utils";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileFooter from "./MobileFooter";
import LoginModal from "../Modal/LoginModal";
import SupportModal from "../Modal/SupportModal";
import MyProfileModal from "../Modal/MyProfileModal";
// import HistoryModal from "../Modal/HistoryModal";
import FullDivLoading from "../Loading/FullDivLoading";
import GameModal from "../Modal/GameModal";

const Layout = () => {
    const { contextData } = useContext(AppContext);
    const [selectedPage, setSelectedPage] = useState("lobby");
    const [isLogin, setIsLogin] = useState(contextData.session !== null);
    const [isMobile, setIsMobile] = useState(false);
    const [userBalance, setUserBalance] = useState("");
    const [supportWhatsApp, setSupportWhatsApp] = useState("");
    const [supportTelegram, setSupportTelegram] = useState("");
    const [supportEmail, setSupportEmail] = useState("");
    const [supportParent, setSupportParent] = useState("");
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [supportParentOnly, setSupportParentOnly] = useState(false);
    const [showMyProfileModal, setShowMyProfileModal] = useState(false);
    const [topGames, setTopGames] = useState([]);
    const [topArcade, setTopArcade] = useState([]);
    const [topCasino, setTopCasino] = useState([]);
    const [topLiveCasino, setTopLiveCasino] = useState([]);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isSlotsOnly, setIsSlotsOnly] = useState("");
    const [showFullDivLoading, setShowFullDivLoading] = useState(false);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const closeTimeoutRef = useRef(null);

    const [txtSearch, setTxtSearch] = useState("");
    const [searchGames, setSearchGames] = useState([]);
    const [isProviderSelected, setIsProviderSelected] = useState(false);

    const [shouldShowGameModal, setShouldShowGameModal] = useState(false);
    const [gameModalData, setGameModalData] = useState({
        gameUrl: "",
        gameName: null,
        gameImg: null,
        gameId: null,
        gameType: null,
        gameLauncher: null
    });
    const refGameModal = useRef();
    const navigate = useNavigate();
    const location = useLocation();
    const isSportsPage = location.pathname === "/sports" || location.pathname === "/live-sports";

    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    useEffect(() => {
        if (contextData.session != null) {
            setIsLogin(true);
            if (contextData.session.user && contextData.session.user.balance) {
                setUserBalance(contextData.session.user.balance);
                setSupportWhatsApp(contextData.session.support_whatsapp || "");
                setSupportTelegram(contextData.session.support_telegram || "");
                setSupportEmail(contextData.session.support_email || "");
                setSupportParent(contextData.session.support_parent || "");
            }
            refreshBalance();
        }
        getStatus();
    }, [contextData.session]);

    useEffect(() => {
        const checkIsMobile = () => {
            return window.innerWidth <= 767;
        };

        const checkShouldCollapseSidebar = () => {
            return window.innerWidth < 1024;
        };

        const checkIsSmallScreen = () => {
            return window.innerWidth < 1024;
        };

        setIsMobile(checkIsMobile());
        setIsSmallScreen(checkIsSmallScreen());

        if (checkShouldCollapseSidebar()) {
            setIsSidebarExpanded(false);
        }

        const handleResize = () => {
            setIsMobile(checkIsMobile());
            setIsSmallScreen(checkIsSmallScreen());

            if (checkShouldCollapseSidebar()) {
                setIsSidebarExpanded(false);
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (isUserMenuOpen) {
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
            }
        }

        return () => {
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
            }
        };
    }, [isUserMenuOpen]);

    const refreshBalance = () => {
        setUserBalance("");
        callApi(contextData, "GET", "/get-user-balance", callbackRefreshBalance, null);
    };

    const callbackRefreshBalance = (result) => {
        setUserBalance(result && result.balance);
    };

    const getStatus = () => {
        callApi(contextData, "GET", "/get-status", callbackGetStatus, null);
    };

    const getPage = (page) => {
        setSelectedPage(page);
        setShowFullDivLoading(true);
        callApi(contextData, "GET", "/get-page?page=" + page, callbackGetPage, null);
        navigate("/" + (page === "home" ? "" : page));
    };

    const callbackGetPage = () => {
        setShowFullDivLoading(false);
    };

    const callbackGetStatus = (result) => {
        if ((result && result.slots_only == null) || (result && result.slots_only == false)) {
            setIsSlotsOnly("false");
        } else {
            setIsSlotsOnly("true");
        }

        setSupportWhatsApp(result && result.support_whatsapp ? result.support_whatsapp : "");
        setSupportTelegram(result && result.support_telegram ? result.support_telegram : "");
        setSupportEmail(result && result.support_email ? result.support_email : "");
        setSupportParent(result && result.support_parent ? result.support_parent : "");
        setTopGames(result.top_hot);
        setTopArcade(result.top_arcade);
        setTopCasino(result.top_slot);
        setTopLiveCasino(result.top_livecasino);

        if (result && result.user === null) {
            localStorage.removeItem("session");
        }
    };

    const handleLoginClick = () => {
        setShowLoginModal(true);
    };

    const handleLoginSuccess = (balance) => {
        setUserBalance(balance);
    };

    const handleLogoutClick = () => {
        setShowFullDivLoading(true);
        callApi(contextData, "POST", "/logout", (result) => {
            if (result.status === "success") {
                setShowFullDivLoading(false);
                setTimeout(() => {
                    localStorage.removeItem("session");
                    window.location.href = "/";
                }, 200);
            }
        }, null);
    };

    const openSupportModal = (parentOnly = false) => {
        setSupportParentOnly(Boolean(parentOnly));
        setShowSupportModal(true);
    };

    const closeSupportModal = () => {
        setShowSupportModal(false);
        setSupportParentOnly(false);
    };

    const launchGameFromSearch = (game, type, launcher) => {
        setShowMobileSearch(false);
        setShouldShowGameModal(true);
        setShowFullDivLoading(true);

        const gameId = game?.id;
        const gameName = game?.name;
        const gameImg = game?.image_local != null ? contextData.cdnUrl + game?.image_local : null;

        setGameModalData({
            gameId: gameId,
            gameType: type,
            gameLauncher: launcher,
            gameName: gameName,
            gameImg: gameImg,
            gameUrl: ""
        });

        // Fetch game URL
        callApi(contextData, "GET", "/get-game-url?game_id=" + gameId, (result) => {
            setShowFullDivLoading(false);
            if (result.status === "0") {
                setGameModalData(prev => ({
                    ...prev,
                    gameUrl: result.url
                }));
            }
        }, null);
    };

    const closeGameModal = () => {
        setShouldShowGameModal(false);
        setGameModalData({
            gameUrl: "",
            gameName: null,
            gameImg: null,
            gameId: null,
            gameType: null,
            gameLauncher: null
        });
    };

    const reloadGame = (game, type, launcher) => {
        const gameToUse = game || { id: gameModalData.gameId, name: gameModalData.gameName };
        launchGameFromSearch(gameToUse, type || gameModalData.gameType, launcher || gameModalData.gameLauncher);
    };

    const layoutContextValue = {
        isLogin,
        userBalance,
        supportWhatsApp,
        supportTelegram,
        supportEmail,
        handleLoginClick,
        handleLogoutClick,
        refreshBalance,
        isSidebarExpanded,
        toggleSidebar,
        showMobileSearch,
        setShowMobileSearch,
        openSupportModal,
        launchGameFromSearch,
        setIsUserMenuOpen,
        txtSearch,
        setTxtSearch,
        searchGames,
        setSearchGames,
        isProviderSelected,
        setIsProviderSelected
    };

    return (
        <LayoutContext.Provider value={layoutContextValue}>
            <NavigationContext.Provider
                value={{ selectedPage, setSelectedPage, getPage, showFullDivLoading, setShowFullDivLoading }}
            >
                <FullDivLoading show={showFullDivLoading} />
                {showLoginModal && (
                    <LoginModal
                        isMobile={isMobile}
                        isOpen={showLoginModal}
                        onClose={() => setShowLoginModal(false)}
                        onLoginSuccess={handleLoginSuccess}
                    />
                )}
                {showMyProfileModal && (
                    <MyProfileModal
                        isOpen={showMyProfileModal}
                        onClose={() => setShowMyProfileModal(false)}
                    />
                )}

                <div id="orbit-container">
                    <Header
                        isLogin={isLogin}
                        isMobile={isMobile}
                        userBalance={userBalance}
                        handleLoginClick={handleLoginClick}
                        handleLogoutClick={handleLogoutClick}
                        openSupportModal={openSupportModal}
                        txtSearch={txtSearch}
                        setTxtSearch={setTxtSearch}
                        games={searchGames}
                        setGames={setSearchGames}
                        isProviderSelected={isProviderSelected}
                    />

                    <Sidebar
                        isSlotsOnly={isSlotsOnly}
                        isMobile={isMobile}
                        isLogin={isLogin}
                        supportParent={supportParent}
                        openSupportModal={openSupportModal}
                        handleLoginClick={handleLoginClick}
                        handleLogoutClick={handleLogoutClick}
                        isUserMenuOpen={isUserMenuOpen}
                        setIsUserMenuOpen={setIsUserMenuOpen}
                    />
                    <div className="wrapper">
                        <Outlet context={{ isSlotsOnly, isLogin, isMobile, topGames, topArcade, topCasino, topLiveCasino }} />
                    </div>
                </div>

                {shouldShowGameModal && gameModalData.gameUrl && (
                    <GameModal
                        gameUrl={gameModalData.gameUrl}
                        gameName={gameModalData.gameName}
                        gameImg={gameModalData.gameImg}
                        reload={reloadGame}
                        launchInNewTab={() => {
                            if (gameModalData.gameUrl) {
                                window.open(gameModalData.gameUrl, '_blank');
                            }
                        }}
                        ref={refGameModal}
                        onClose={closeGameModal}
                        isMobile={isMobile}
                    />
                )}
                <SupportModal
                    isOpen={showSupportModal}
                    onClose={closeSupportModal}
                    supportWhatsApp={supportWhatsApp}
                    supportTelegram={supportTelegram}
                    supportEmail={supportEmail}
                    supportParentOnly={supportParentOnly}
                    supportParent={supportParent}
                />
                {isMobile && !isSportsPage &&
                    <MobileFooter
                        isSlotsOnly={isSlotsOnly}
                        isLogin={isLogin}
                        supportParent={supportParent}
                        openSupportModal={openSupportModal}
                        handleLoginClick={handleLoginClick}
                    />}
            </NavigationContext.Provider>
        </LayoutContext.Provider>
    );
};

export default Layout;