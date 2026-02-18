import { useState, useContext, useEffect, useRef } from "react";
import { LayoutContext } from "./Layout/LayoutContext";
import { AppContext } from "../AppContext";
import LoginModal from "./Modal/LoginModal";
import LoadApi from "./Loading/LoadApi";

const SearchInput = ({
    txtSearch,
    setTxtSearch,
    searchRef,
    search,
    isMobile,
    games,
    isLoadingGames
}) => {
    const { contextData } = useContext(AppContext);
    const { setShowMobileSearch, isLogin, launchGameFromSearch } = useContext(LayoutContext);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    const searchContainerRef = useRef(null);

    useEffect(() => {
        const hasResultsOrLoading =
            (games?.length > 0 || isLoadingGames) ||
            (txtSearch.trim() !== "" && !isLoadingGames);

        setIsDropdownVisible(txtSearch.trim() !== "" && hasResultsOrLoading);
    }, [txtSearch, games, isLoadingGames]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setIsDropdownVisible(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleChange = (event) => {
        const value = event.target.value;
        setTxtSearch(value);
        search({ target: { value }, key: event.key, keyCode: event.keyCode });
    };

    const handleFocus = () => {
        if (isMobile) {
            setShowMobileSearch(true);
        }
        if (txtSearch.trim() !== "") {
            setIsDropdownVisible(true);
        }
    };

    const handleLoginClick = () => {
        setShowLoginModal(true);
    };

    const handleLoginConfirm = () => {
        setShowLoginModal(false);
    };

    return (
        <>
            {showLoginModal && (
                <LoginModal
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onConfirm={handleLoginConfirm}
                />
            )}
            <form className={`form form--search ${txtSearch.trim() !== "" ? 'active' : ''}`} ref={searchContainerRef}>
                <section className="form--search__input">
                    <span className="close-search show" onClick={() => setIsDropdownVisible(false)}></span>
                    <p>
                        <label htmlFor="search">
                            <input
                                className="form-control"
                                id="search"
                                type="text"
                                autoComplete="off"
                                placeholder="Buscar juego"
                                ref={searchRef}
                                value={txtSearch}
                                onChange={handleChange}
                                onKeyUp={search}
                                onFocus={handleFocus}
                            />
                        </label>
                    </p>
                </section>
                <section className="form--search__submit">
                    <button type="button" className="button button--search" aria-label="Search button"></button>
                </section>
                {isDropdownVisible && (
                    <>
                        {(games?.length > 0 || isLoadingGames) && (
                            <>
                                {isLoadingGames ? (
                                    <div className="mt-3">
                                        <LoadApi />
                                    </div>
                                ) : (
                                    <div className="form--search__games-search active">
                                        <div className="games-list">
                                            {
                                                games.map((game, idx) => {
                                                    return <a
                                                        key={idx}
                                                        className="game"
                                                        onClick={() => {
                                                            if (isLogin) {
                                                                launchGameFromSearch(game, "slot", "modal");
                                                            } else {
                                                                handleLoginClick();
                                                            }
                                                            setIsDropdownVisible(false);
                                                        }}
                                                    >
                                                        {game.title || game.name || "Unnamed Game"}
                                                    </a>;
                                                })
                                            }
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </form>
        </>
    );
};

export default SearchInput;