import { useState, useEffect, useContext, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutContext } from "./LayoutContext";
import ImgHome from "/src/assets/svg/home.svg";
import ImgCasino from "/src/assets/svg/casino.svg";
import ImgLiveCasino from "/src/assets/svg/live-casino.svg";
import ImgSports from "/src/assets/svg/sports.svg";
import ImgLiveSports from "/src/assets/img/deslizalo.png";
import ImgTime from "/src/assets/img/time-animate2.png";
import ImgLogin from "/src/assets/svg/login.svg";
import ImgPhone from "/src/assets/svg/phone.svg";
import ImgLogo from "/src/assets/img/logo.png";

const MobileFooter = ({
    isSlotsOnly,
    isLogin,
    supportParent,
    openSupportModal,
    handleLoginClick
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isSidebarExpanded, toggleSidebar } = useContext(LayoutContext);
    const [expandedMenus, setExpandedMenus] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

    const iconRefs = useRef({});
    const sidebarRef = useRef(null);
    const hamburgerRef = useRef(null);

    const isSlotsOnlyMode = isSlotsOnly === true || isSlotsOnly === "true";
    const isMenuExpanded = (menuId) => expandedMenus.includes(menuId);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            let hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'P.M.' : 'A.M.';
            
            hours = hours % 12;
            hours = hours ? hours : 12;
            const formattedHours = hours.toString().padStart(2, '0');
            
            setCurrentTime(`${formattedHours}:${minutes} ${ampm}`);
        };

        updateTime();

        const intervalId = setInterval(updateTime, 1000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                isSidebarExpanded &&
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target) &&
                hamburgerRef.current &&
                !hamburgerRef.current.contains(event.target)
            ) {
                closeSidebar();
            }
        };

        if (isSidebarExpanded) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSidebarExpanded]);

    const isMenuActive = (item) => {
        const currentPath = location.pathname;
        const currentHash = location.hash;

        if (item.href.includes("#")) {
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

    const isBottomNavActive = (path) => {
        const currentPath = location.pathname;
        return currentPath === path;
    };

    const showFullMenu = isSlotsOnly === "false" || isSlotsOnly === false;

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
            href: "/casino",
            subItems: [
                { name: "Lobby", href: "/casino#home", image: "fa-solid fa-crown" },
                { name: "Juegos Nuevos", href: "/casino#hot", image: "fa-solid fa-fire" },
                { name: "Jokers", href: "/casino#joker", image: "fa-solid fa-diamond" },
                { name: "Juegos de Crash", href: "/casino#arcade", image: "fa-solid fa-gamepad" },
                { name: "Megaways", href: "/casino#megaways", image: "fa-solid fa-dice" },
                { name: "Ruletas", href: "/casino#roulette", image: "fa-solid fa-trophy" },
            ],
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

    const isSubItemActive = (subItem) => {
        return location.pathname + location.hash === subItem.href;
    };

    const closeSidebar = () => {
        if (isSidebarExpanded) {
            toggleSidebar();
            setTimeout(() => {
                document.body.classList.remove('sideDiff');
            }, 10);
        }
    };

    const handleMenuClick = (href, item, e) => {
        e.preventDefault();
        
        if (item && item.subItems) {
            e.stopPropagation();
            toggleSubmenu(item.id);
            return;
        }
        
        if (item && item.action) {
            closeSidebar();
            item.action();
            return;
        }
        
        if (href && href !== "#") {
            closeSidebar();
            
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

    const toggleSubmenu = (menuId) => {
        setExpandedMenus((prev) => 
            prev.includes(menuId) 
                ? prev.filter(id => id !== menuId)
                : [...prev, menuId]
        );
    };

    const handleSubItemClick = (href, e) => {
        e.preventDefault();
        e.stopPropagation();
        closeSidebar();
        navigate(href);
        
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'auto'
        });
    };

    const handleHamburgerClick = () => {
        document.body.classList.toggle('sideDiff');
        toggleSidebar();
    };

    const handleLogoClick = (e) => {
        e.preventDefault();
        closeSidebar();
        navigate("/");
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'auto'
        });
    };

    return (
        <>
            <div className="navbar-mobile">
                <div className="navbar-mobile-ex">
                    <div className="nav-mobile-item">
                        <a 
                            className="btn-action-sidebar" 
                            onClick={handleHamburgerClick}
                            ref={hamburgerRef}
                        >
                            <i className="fa-solid fa-bars"></i><span className="title">Menú</span>
                        </a>
                    </div>
                    {
                        showFullMenu &&
                        <div className="nav-mobile-item">
                            <a
                                onClick={() => navigate("/sports")}
                                className={`${isBottomNavActive("/sports") ? "router-link-active router-link-exact-active active" : ""}`}
                            >
                                <img src={ImgSports} width="20px" /><span className="title">Deportes</span>
                            </a>
                        </div>
                    }
                    <div className="nav-mobile-item">
                        <a
                            onClick={() => navigate("/")}
                            className={`a-special ${isBottomNavActive("/") ? "router-link-active router-link-exact-active active" : ""}`}
                        >
                            <span className="icon-scale">
                                <img src={ImgHome} width="30px" />
                            </span>
                            <img src={ImgHome} width="20px" />
                            <span className="title">Inicio</span>
                        </a>
                    </div>
                    <div className="nav-mobile-item">
                        <a
                            onClick={() => navigate("/casino")}
                            className={`${isBottomNavActive("/casino") ? "router-link-active router-link-exact-active active" : ""}`}
                        >
                            <img src={ImgCasino} width="20px" /><span className="title">Casino</span>
                        </a>
                    </div>
                    {
                        isLogin && showFullMenu ?
                            <div className="nav-mobile-item">
                                <a
                                    onClick={() => navigate("/live-casino")}
                                    className={`${isBottomNavActive("/live-casino") ? "router-link-active router-link-exact-active active" : ""}`}
                                >
                                    <img src={ImgLiveCasino} width="20px" /><span className="title">En vivo</span>
                                </a>
                            </div> : <div className="nav-mobile-item">
                                <a
                                    onClick={() => handleLoginClick()}
                                    className={`${isBottomNavActive("/login") ? "router-link-active router-link-exact-active active" : ""}`}
                                >
                                    <img src={ImgLogin} width="20px" /><span className="title">Ingresar</span>
                                </a>
                            </div>
                    }
                </div>
            </div>

            {isSidebarExpanded && (
                <div className="sidebar" ref={sidebarRef}>
                    <div className="sidebar-head d-flex">
                        <button className="btn btn-sidebar btn-action-sidebar" onClick={handleHamburgerClick}>
                            <i className="fa-solid fa-bars"></i>
                        </button>

                        <a
                            onClick={handleLogoClick}
                            className="sidebar-logo"
                            href="/"
                        >
                            <img alt="Logo" src={ImgLogo} />
                        </a>
                    </div>

                    <div className="sidebar-body">
                        <div className="sidebar-body-ex">
                            <div className="sidebar-title">
                                <span className="icon">
                                    <i className="fa-solid fa-bolt back"></i>
                                    <i className="fa-solid fa-bolt front"></i>
                                </span>
                                Panel
                            </div>

                            <div className="sidebar-item-list">
                                <div>
                                    {menuItems.map((item) => {
                                        const itemRef = (el) => (iconRefs.current[item.id] = el);
                                        const isActive = isMenuActive(item);
                                        const isExpanded = isMenuExpanded(item.id);
                                        const hasSubItems = item.subItems && item.subItems.length > 0;

                                        return (
                                            <div className="sidebar-item" ref={itemRef} key={item.id}>
                                                <a
                                                    href={item.href}
                                                    onClick={(e) => handleMenuClick(item.href, item, e)}
                                                    className={`btn ${isActive ? "btn-featured" : ""} ${hasSubItems ? "has-submenu" : ""}`}
                                                >
                                                    <span className="sidebar-item-icon">
                                                        <img src={item.image} alt={item.name} />
                                                    </span>
                                                    <span className="sidebar-item-name">{item.name}</span>
                                                    {hasSubItems && (
                                                        <span
                                                            className={`sidebar-item-collapse ${isExpanded ? 'expanded' : ''}`}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                toggleSubmenu(item.id);
                                                            }}
                                                        >
                                                            <span className="more">
                                                                <i className={`fa-solid ${isExpanded ? "fa-minus" : "fa-plus"}`}></i>
                                                            </span>
                                                            <span className="minus">
                                                                <i className="fa-solid fa-minus"></i>
                                                            </span>
                                                        </span>
                                                    )}
                                                </a>
                                                {hasSubItems && (
                                                    <div className={`collapse ${isExpanded ? 'show' : ''}`} id={`collapse-${item.id}`}>
                                                        <div className="card card-body">
                                                            <ul>
                                                                {item.subItems.map((subItem, subIndex) => {
                                                                    const isSubActive = isSubItemActive(subItem);
                                                                    return (
                                                                        <li key={subIndex}>
                                                                            <a
                                                                                href={subItem.href}
                                                                                onClick={(e) => handleSubItemClick(subItem.href, e)}
                                                                                className={isSubActive ? 'active' : ''}
                                                                            >
                                                                                <span className="a-icon">
                                                                                    <i className={subItem.image}></i>
                                                                                </span>
                                                                                <span className="a-name">{subItem.name}</span>
                                                                            </a>
                                                                        </li>
                                                                    );
                                                                })}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <hr />

                            <div className="sidebar-extra">
                                <div className="sidebar-time">
                                    <div className="sidebar-time-ex">
                                        <div className="sidebar-time-figure">
                                            <img src={ImgTime} alt="time" />
                                        </div>

                                        <div className="sidebar-time-text">
                                            <span className="span">{currentTime}</span>
                                        </div>
                                    </div>

                                    <p className="mt-1">Hora local</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MobileFooter;