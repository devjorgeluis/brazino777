import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutContext } from "./Layout/LayoutContext";

const SearchInput = ({
    txtSearch,
    setTxtSearch,
    searchRef,
    search,
    isMobile,
    games,
    isLoadingGames,
    onSearchSubmit,
    onGameSelect,
    onClear
}) => {
    const { setShowMobileSearch } = useContext(LayoutContext);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const searchContainerRef = useRef(null);
    const suppressDropdownRef = useRef(false);

    useEffect(() => {
        if (suppressDropdownRef.current) {
            suppressDropdownRef.current = false;
            return;
        }
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

    return (
        <div id="vue-search-form-block">
            <form className={`form form--search ${txtSearch.trim() !== "" ? 'active' : ''}`} ref={searchContainerRef}>
                <section className="form--search__input">
                    <span
                        className="close-search show"
                        onClick={() => {
                            setIsDropdownVisible(false),
                                onClear();
                        }}
                    ></span>
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
                    <button
                        type="button"
                        className="button button--search"
                        aria-label="Search button"
                        onClick={() => {
                            suppressDropdownRef.current = true;
                            setIsDropdownVisible(false);
                            onSearchSubmit();
                        }}
                    ></button>
                </section>
                {isDropdownVisible && (
                    <>
                        {(games?.length > 0 || isLoadingGames) && (
                            <>
                                {isLoadingGames ? (
                                    <></>
                                ) : (
                                    <div className="form--search__games-search active">
                                        <div className="games-list">
                                            {
                                                games.map((game, idx) => {
                                                    return <a
                                                        key={idx}
                                                        className="game"
                                                        onClick={() => {
                                                            suppressDropdownRef.current = true;
                                                            onGameSelect(game);
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
        </div>
    );
};

export default SearchInput;