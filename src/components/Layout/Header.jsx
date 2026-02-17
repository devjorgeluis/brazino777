import { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../AppContext";
import { LayoutContext } from "./LayoutContext";
import SearchInput from "../SearchInput";
import GameCard from "../GameCard";
import { callApi } from "../../utils/Utils";
import LoadApi from "../Loading/LoadApi";
import ImgFavicon3 from "/src/assets/img/favicon-v3.png";
import ImgProfile from "/src/assets/svg/profile.svg";
import ImgBet from "/src/assets/svg/my-bets.svg";
import ImgTransactions from "/src/assets/svg/transactions.svg";
import ImgLogout from "/src/assets/svg/logout.svg";
import ImgAvatar from "/src/assets/img/default-avatar.png";

const Header = ({
    isLogin,
    isMobile,
    userBalance,
    handleLoginClick,
    handleLogoutClick,
    openSupportModal,
    txtSearch,
    setTxtSearch,
    games,
    setGames,
    isProviderSelected = false,
}) => {
    const { contextData } = useContext(AppContext);
    const [showDropdown, setShowDropdown] = useState(false);
    const { setIsUserMenuOpen, launchGameFromSearch } = useContext(LayoutContext);
    const [isLoadingGames, setIsLoadingGames] = useState(false);
    const navigate = useNavigate();
    const searchRef = useRef(null);
    const [searchDelayTimer, setSearchDelayTimer] = useState();

    const configureImageSrc = (result) => {
        (result.content || []).forEach((element) => {
            element.imageDataSrc =
                element.image_local !== null
                    ? contextData.cdnUrl + element.image_local
                    : element.image_url;
        });
    };

    const handleToggleUserMenu = () => {
        setShowDropdown(!showDropdown);
        setIsUserMenuOpen(!showDropdown);
    }

    const formatBalance = (value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return "0.00";
        return num.toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const search = (e) => {
        if (isProviderSelected) return;
        
        let keyword = e.target.value;
        setTxtSearch(keyword);

        if (
            navigator.userAgent.match(
                /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i,
            )
        ) {
            let keyword = e.target.value;
            do_search(keyword);
        } else {
            if (
                (e.keyCode >= 48 && e.keyCode <= 57) ||
                (e.keyCode >= 65 && e.keyCode <= 90) ||
                e.keyCode == 8 ||
                e.keyCode == 46
            ) {
                do_search(keyword);
            }
        }

        if (
            e.key === "Enter" ||
            e.keyCode === 13 ||
            e.key === "Escape" ||
            e.keyCode === 27
        ) {
            searchRef.current?.blur();
        }
    };

    const do_search = (keyword) => {
        clearTimeout(searchDelayTimer);

        if (keyword == "") {
            setGames([]);
            setIsLoadingGames(false);
            return;
        }

        setGames([]);
        setIsLoadingGames(true);

        let pageSize = 500;

        let searchDelayTimerTmp = setTimeout(function () {
            callApi(
                contextData,
                "GET",
                "/search-content?keyword=" +
                txtSearch +
                "&page_group_code=" +
                "default_pages_home" +
                "&length=" +
                pageSize,
                callbackSearch,
                null,
            );
        }, 1000);

        setSearchDelayTimer(searchDelayTimerTmp);
    };

    const callbackSearch = (result) => {
        if (result.status === 500 || result.status === 422) {
        } else {
            configureImageSrc(result);
            setGames(result.content);
        }
        setIsLoadingGames(false);
    };

    const handleSearchClick = () => {
        document.body.classList.toggle('hc-opened-search');
    }

    return (
        <>
            <header>
                <div className="header-wrapper">
                    <div className="container-fluid container-h d-flex">
                        <div className="header-left">
                            <a onClick={() => navigate("/")} className="mobile-logo hm-show">
                                <img src={ImgFavicon3} />
                            </a>
                        </div>
                        <div className="header-right">
                            {
                                !isLogin && 
                                <div className="dropdown d-inline-block d-xl-none dropdown-h-chat hm-show">
                                    <button
                                        className="btn btn-transparent"
                                        type="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                        onClick={() => {
                                            openSupportModal(false);
                                        }}
                                    >
                                        <i className="fa-solid fa-headset"></i>
                                    </button>
                                </div>
                            }
                            <button
                                className="btn btn-transparent btn-h-custom btn-h-custom-mini me-1 btn-search-main"
                                onClick={handleSearchClick}
                            >
                                <i className="fa-solid fa-magnifying-glass"></i>
                            </button>

                            {
                                isLogin ?
                                    <div className="auth">
                                        <div className="auth-data">
                                            <div className="dropdown d-inline-block dropdown-currency">
                                                <div
                                                    className="dropdown-currency-btn"
                                                    data-bs-toggle="dropdown"
                                                >
                                                    <div className="username">
                                                        <div className="back">
                                                            {contextData?.session?.user?.username || '-'}
                                                            <div className="front">{contextData?.session?.user?.username || '-'}</div>
                                                        </div>
                                                    </div>
                                                    <div className="amount">
                                                        ${formatBalance(userBalance)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="dropdown d-inline-block avatar-container">
                                            <div
                                                className="btn btn-avatar"
                                                data-bs-toggle="dropdown"
                                                aria-expanded="true"
                                                onClick={handleToggleUserMenu}
                                                style={{
                                                    backgroundImage: `url(${contextData?.session?.user?.profile_image
                                                            ? contextData.session.user.profile_image
                                                            : ImgAvatar
                                                        })`,
                                                }}
                                            ></div>

                                            <ul
                                                className={`dropdown-menu dropdown-menu-end ${showDropdown ? "show" : ""}`}
                                                style={{ position: "absolute", inset: "0px auto auto 0px", margin: "0px", transform: "translate3d(-130px, 59.6491px, 0px)" }}
                                            >
                                                <li>
                                                    <a onClick={() => {
                                                        navigate("/profile"),
                                                        handleToggleUserMenu();
                                                    }} className="dropdown-item">
                                                        <span className="dropdown-icon">
                                                            <img src={ImgProfile} width="25px" />
                                                        </span> Perfil
                                                    </a>
                                                </li>
                                                <li>
                                                    <a onClick={() => {
                                                        navigate("/profile#transactions"),
                                                        handleToggleUserMenu();
                                                    }} className="dropdown-item">
                                                        <span className="dropdown-icon">
                                                            <img src={ImgTransactions} width="25px" />
                                                        </span> Transacciones
                                                    </a>
                                                </li>
                                                <li>
                                                    <a onClick={() => {
                                                        navigate("/profile#history"),
                                                        handleToggleUserMenu();
                                                    }} className="dropdown-item">
                                                        <span className="dropdown-icon">
                                                            <img src={ImgBet} width="25px" />
                                                        </span> Mis apuestas
                                                    </a>
                                                </li>
                                                <li>
                                                    <a onClick={() => handleLogoutClick()} className="dropdown-item">
                                                        <span className="dropdown-icon">
                                                            <img src={ImgLogout} width="25px" />
                                                        </span> Cerrar sesión
                                                    </a>
                                                </li>
                                                <li><hr className="dropdown-divider" /></li>
                                                <li><h6 className="dropdown-header">Soporte</h6></li>
                                                <li>
                                                    <a
                                                        className="dropdown-item"
                                                        onClick={() => {
                                                            openSupportModal(false);
                                                            handleToggleUserMenu();
                                                        }}
                                                    >
                                                        <span
                                                            className="dropdown-icon chat-web"
                                                        >
                                                            <i className="fa-regular fa-comments"></i>
                                                        </span> Soporte web
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div> :
                                    <div className="header-mobile-right">
                                        <button className="btn btn-theme02 btn-h-custom" onClick={handleLoginClick}>Ingresar</button>
                                        <div className="dropdown dropdown-h-chat ms-1 d-none d-xl-inline-block">
                                            <button
                                                className="btn btn-transparent"
                                                type="button"
                                                data-bs-toggle="dropdown"
                                                aria-expanded="false"
                                                onClick={() => {
                                                    openSupportModal(false);
                                                }}
                                            >
                                                <i className="fa-solid fa-headset"></i>
                                            </button>
                                        </div>
                                    </div>
                            }
                        </div>
                    </div>
                </div>
            </header>
            <div className="float-casino">
                <div className="float-casino-wrapper">
                    <div className="container">
                        <div className="float-casino-input-search">
                            <div className="float-casino-search-container">
                                <SearchInput
                                    txtSearch={txtSearch}
                                    setTxtSearch={setTxtSearch}
                                    searchRef={searchRef}
                                    search={search}
                                    isMobile={isMobile}
                                    games={games}
                                    isLoadingGames={isLoadingGames}
                                    setGames={setGames}
                                    setIsLoadingGames={setIsLoadingGames}
                                    searchDelayTimer={searchDelayTimer}
                                    setSearchDelayTimer={setSearchDelayTimer}
                                    isProviderSelected={isProviderSelected}
                                />
                            </div>
                        </div>
                        <div className="float-casino-search-body">
                            {isLoadingGames && <LoadApi width={60} />}
                            {
                                games.length > 0 && txtSearch.length > 0 &&
                                <>
                                    <div className="float-casino-search-body-title">
                                        Juegos encontrados <span>({games.length})</span>
                                    </div>
                                    <div className="float-casino-search-body-ex">
                                        {games.map((game) => (
                                            <GameCard
                                                key={game.id}
                                                id={game.id}
                                                title={game.name}
                                                isMobile={isMobile}
                                                text={isLogin ? "Jugar" : "Ingresar"}
                                                imageSrc={game.image_local !== null ? contextData.cdnUrl + game.image_local : game.image_url}
                                                onGameClick={() => (isLogin ? launchGameFromSearch(game, "slot", "modal") : handleLoginClick())}
                                            />
                                        ))}
                                    </div>
                                </>
                            }
                            {
                                games.length === 0 && !isLoadingGames && txtSearch.length > 0 &&
                                <div className="float-casino-search-body-no-found">
                                    <i className="fa-solid fa-user-astronaut"></i><br />No se encontraron juegos
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <div className="float-casino-bg"></div>
            </div>
        </>
    );
};

export default Header;