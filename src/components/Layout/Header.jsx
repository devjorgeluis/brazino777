import { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../AppContext";
import { LayoutContext } from "./LayoutContext";
import ImgSupport from "/src/assets/svg/support-black.svg";

const Header = ({
    isLogin,
    isMobile,
    isSlotsOnly,
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

    // Opens the sidebar by adding "mobile-show" to the <aside>
    const handleHamburgerClick = () => {
        const aside = document.querySelector('aside');
        if (aside) {
            aside.classList.add('mobile-show');
        }
    };

    return (
        <>
            <header>
                <div className="header--container">
                    <div className="header--left">
                        <div
                            className="hamburger-icon"
                            onClick={handleHamburgerClick}
                        ></div>
                        <a onClick={() => navigate("/")} className="site-logo" aria-label="Site logo"></a>
                    </div>
                    <div className="header--links">
                        <a onClick={() => navigate("/casino")} className="button button--competitions">Casino</a>
                        {
                            isSlotsOnly === "false" && <>
                                <a onClick={() => navigate("/live-casino")} className="button button--competitions">Casino En Vivo</a>
                                <a onClick={() => navigate("/sports")} className="button button--competitions">Deportes</a>
                            </>
                        }

                        <div className="header--buttons">
                            <button className="button-support" onClick={() => { openSupportModal(false); }}>
                                <img src={ImgSupport} />
                            </button>                             
                            <a onClick={() => navigate("/sports")} className="button button--register">Entrar</a>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;