import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../AppContext";
import ImgSupport from "/src/assets/svg/support-black.svg";
import ImgRefresh from "/src/assets/svg/refresh_menu_2.svg";
import ImgRefreshHover from "/src/assets/svg/refresh_menu-hover_2.svg";

const Header = ({
    isLogin,
    isMobile,
    isSlotsOnly,
    userBalance,
    handleLoginClick,
    openSupportModal,
    refreshBalance
}) => {
    const { contextData } = useContext(AppContext);
    const navigate = useNavigate();
    const [isRefreshing, setIsRefreshing] = useState(false)

    const formatBalance = (value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return "0.00";
        return num.toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const handleHamburgerClick = () => {
        const aside = document.querySelector('aside');
        if (aside) {
            aside.classList.add('mobile-show');
        }
    };

    const handleRefreshBalance = () => {
        if (isRefreshing) return;
        setIsRefreshing(true);
        refreshBalance(() => {
            setIsRefreshing(false);
        });
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
                        <a onClick={() => navigate("/")} className={`site-logo ${isLogin ? "site-logo--authenticated" : ""}`} aria-label="Site logo"></a>
                    </div>
                    <div className="header--links user--auth">
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
                            {
                                isLogin ? 
                                <div className={`header--auth-buttons mobile`}>
                                    <a onClick={() => navigate("/profile#info")} className="button button--profile button--profile--unverified " aria-label="profile button">
                                        <img id="user_avatar_img" src="https://brazww-cdn.com/files/avatars/general-avatar.svg?v1178" loading="lazy" alt="User image" className="user__avatar" width="40" height="40" />
                                        <span className="user_text">{contextData?.session?.user?.username}</span>
                                    </a>
                                    <div id="vue-balances-header" className="vue-balances vue-balances">
                                        <div className="user">
                                            <p className="user-balance">
                                                <span className="balance-currency">$</span>
                                                <span className="balance-amount">{formatBalance(userBalance || 0)}</span>
                                            </p>
                                            <div className={`update__image ${isRefreshing ? "spin" : ""}`} onClick={handleRefreshBalance}>
                                                <img src={ImgRefresh} alt="refresh" className="update__image-default" loading="lazy" />
                                                <img src={ImgRefreshHover} alt="refresh hover" className="update__icon-active" loading="lazy" />
                                            </div>
                                        </div>
                                    </div>
                                </div> : 
                                <a onClick={handleLoginClick} className="button button--register">Entrar</a>
                            }
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;