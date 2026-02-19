import { useState, useEffect, useContext, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../../AppContext";
import ImgHome from "/src/assets/svg/home.svg";
import ImgCasino from "/src/assets/svg/casino.svg";
import ImgLiveCasino from "/src/assets/svg/live-casino.svg";
import ImgSports from "/src/assets/svg/sports.svg";
import ImgLiveSports from "/src/assets/svg/live-bet.svg";
import ImgPhone from "/src/assets/svg/phone.svg";
import ImgRefresh from "/src/assets/svg/refresh_menu_2.svg";
import ImgRefreshHover from "/src/assets/svg/refresh_menu-hover_2.svg";

const Sidebar = ({ isSlotsOnly, isLogin, isMobile, supportParent, openSupportModal, isUserMenuOpen, setIsUserMenuOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { contextData } = useContext(AppContext);
    const [expandedMenus, setExpandedMenus] = useState([]);
    const iconRefs = useRef({});
    const isMenuExpanded = (menuId) => expandedMenus.includes(menuId);

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'auto'
        });
    }, [location.pathname, location.hash]);

    useEffect(() => {
        const currentPath = location.pathname;
        const hash = location.hash.slice(1);

        if (currentPath.startsWith("/live-casino") && hash && !isMenuExpanded("live-casino")) {
            setExpandedMenus((prev) => [...prev, "live-casino"]);
        }

        if (currentPath.startsWith("/profile") && !isMenuExpanded("profile")) {
            setExpandedMenus((prev) => [...prev, "profile"]);
        }

        if (currentPath.startsWith("/casino") && hash && !isMenuExpanded("casino")) {
            setExpandedMenus((prev) => [...prev, "casino"]);
        }
    }, [location.pathname, location.hash]);

    const isSlotsOnlyMode = isSlotsOnly === true || isSlotsOnly === "true";

    const menuItems = [
        {
            id: "home",
            name: "Inicio",
            image: ImgHome,
            href: "/",
        },
        {
            id: "casino",
            name: "Casino",
            image: ImgCasino,
            href: "/casino"
        },
        ...(isSlotsOnlyMode
            ? []
            : [
                {
                    id: "live-casino",
                    name: "Casino en vivo",
                    image: ImgLiveCasino,
                    href: "/live-casino",
                },
                {
                    id: "sports",
                    name: "Deportes",
                    image: ImgSports,
                    href: "/sports",
                },
                {
                    id: "live-sports",
                    name: "Deportes en vivo",
                    image: ImgLiveSports,
                    href: "/live-sports"
                },
            ]),
        ...(supportParent
            ? [
                {
                    id: "support",
                    name: "Contactá a Tu Cajero",
                    image: ImgPhone,
                    href: "#",
                    action: () => {
                        openSupportModal(true);
                    },
                },
            ]
            : []),
    ];

    const isMenuActive = (item) => {
        const currentPath = location.pathname;
        const currentHash = location.hash;

        if (item.href && item.href.includes("#")) {
            return location.pathname + location.hash === item.href;
        }

        if (item.id === "profile" && currentPath.startsWith("/profile")) {
            return true;
        }

        if (item.href === currentPath && !currentHash) {
            return true;
        }

        return false;
    };

    const closeUserMenu = () => {
        setIsUserMenuOpen(false);
    };

    const handleMenuClick = (href, item, e) => {
        e.preventDefault();
        handleCloseMenu();

        if (item && item.action) {
            closeUserMenu();
            item.action();
            return;
        }

        if (href && href !== "#") {
            closeUserMenu();

            if (href === location.pathname + location.hash) {
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'auto'
                });
            } else {
                navigate(href);
            }
        }
    };

    const handleCloseMenu = () => {
        const aside = document.querySelector('aside');
        if (aside) {
            aside.classList.remove('mobile-show');
        }
    };

    const formatBalance = (value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return "0.00";
        return num.toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    return (
        <>
            <aside>
                <nav className="side-menu side-menu--expand">
                    <div className="close-menu" onClick={handleCloseMenu}></div>
                    {
                        isLogin ? <section className="auth_mobile_info">
                            <div className="side_profile">
                                <a
                                    onClick={() => {
                                        navigate(isMobile ? "/profile" : "/profile#info"),
                                        handleCloseMenu();
                                    }}
                                    className="button button--profile button--profile--unverified"
                                >
                                    <img
                                        id="user_avatar_img"
                                        data-current-src="https://brazww-cdn.com/files/avatars/general-avatar.svg?v1178"
                                        data-src="https://brazww-cdn.com/files/avatars/general-avatar.svg?v1178"
                                        src="https://brazww-cdn.com/files/avatars/general-avatar.svg?v1178"
                                        loading="lazy"
                                        alt="User image"
                                        className="user__avatar"
                                        width="40"
                                        height="40"
                                    />
                                    <span className="user_text">{contextData?.session?.user?.username}</span>
                                </a>
                            </div>
                            <div className="user--balance_info">
                                <div id="vue-balances-side_menu" className="vue-balances vue-balances">
                                    <div className="aside__balance balance">
                                        <p className="main_balance_code">
                                            <span>Saldo de juego</span>
                                            <span className="balance-amount">
                                                <span className="balance-amount__amount">{formatBalance(contextData?.session?.user?.balance)}</span>
                                                <span className="balance-amount__currency">$</span>
                                            </span>
                                            <span className="reload-balance">
                                                <img
                                                    src={ImgRefresh}
                                                    alt="refresh"
                                                    className="reload-balance__icon-default"
                                                    loading="lazy" />
                                                <img
                                                    src={ImgRefreshHover}
                                                    alt="refresh hover"
                                                    className="reload-balance__icon-active"
                                                    loading="lazy"
                                                />
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section> : 
                        <div className="auth-buttons">
                            <a onClick={() => navigate("/login")} className="button button--register">Entrar</a>
                        </div>
                    }
                    <nav className="category-block">
                        {menuItems.map((item, index) => {
                            const itemRef = (el) => (iconRefs.current[item.id] = el);
                            const isActive = isMenuActive(item);

                            return (
                                <a
                                    className={`category-block__item category-block__item-- category-block__item--carnival ${isActive ? "active" : ""}`}
                                    ref={itemRef} key={index}
                                    onClick={(e) => handleMenuClick(item.href, item, e)}
                                >
                                    <img
                                        src={item.image}
                                        alt="Carnival"
                                        loading="lazy"
                                    />
                                    <span className="category-block__item__text"> {item.name} </span>
                                </a>
                            );
                        })}
                    </nav>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;