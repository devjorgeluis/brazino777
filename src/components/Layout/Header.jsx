import { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../AppContext";
import { LayoutContext } from "./LayoutContext";
import SearchInput from "../SearchInput";
import GameCard from "../GameCard";
import { callApi } from "../../utils/Utils";
import LoadApi from "../Loading/LoadApi";


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
                <div className="header--container">
                    <div className="header--left">
                        <div className="hamburger-icon"></div>
                        <a href="/" className="site-logo" aria-label="Site logo"></a>
                    </div>
                    <div className="header--links">
                        <a href="/promotions" className="button button--competitions">Torneos</a
                        ><a href="/bonuses" className="button button--bonus">Promociones</a
                        ><a href="/help" className="button button--help">Ayuda</a>
                        <div className="header--buttons">
                            <a href="/auth/register" className="button button--register">Registro</a
                            ><a href="/auth/login" className="button button--login">Entrar</a>
                        </div>
                    </div>
                </div>
            </header>

        </>
    );
};

export default Header;