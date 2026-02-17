import { useState, useEffect, useContext, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../../AppContext";
import ImgHome from "/src/assets/svg/home.svg";
import ImgCasino from "/src/assets/svg/casino.svg";
import ImgLiveCasino from "/src/assets/svg/live-casino.svg";
import ImgSports from "/src/assets/svg/sports.svg";
import ImgLiveSports from "/src/assets/svg/live-bet.svg";
import ImgPhone from "/src/assets/svg/phone.svg";

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

    const toggleSubmenu = (menuId) => {
        setExpandedMenus((prev) =>
            prev.includes(menuId)
                ? prev.filter(id => id !== menuId)
                : [...prev, menuId]
        );
    };

    const handleCloseMenu = () => {
        const aside = document.querySelector('aside');
        if (aside) {
            aside.classList.remove('mobile-show');
        }
    };

    return (
        <>
            <aside>
                <nav className="side-menu side-menu--expand">
                    <div className="close-menu" onClick={handleCloseMenu}></div>
                    <div className="auth-buttons">
                        <a onClick={() => navigate("/login")} className="button button--register">Entrar</a>
                    </div>
                    <nav className="category-block">
                        {menuItems.map((item, index) => {
                            const itemRef = (el) => (iconRefs.current[item.id] = el);
                            const isActive = isMenuActive(item);

                            return (
                                <a
                                    className={`category-block__item category-block__item-- category-block__item--carnival ${isActive ? "active" : ""}`}
                                    ref={itemRef} key={index}
                                    onClick={() => handleMenuClick(item.href, item)}
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