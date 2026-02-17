import { useState, useContext, useEffect, useRef } from "react";
import { LayoutContext } from "./Layout/LayoutContext";
import { AppContext } from "../AppContext";
import LoginModal from "./Modal/LoginModal";

const SearchInput = ({
    txtSearch,
    setTxtSearch,
    searchRef,
    search,
    isMobile,
    games,
    isLoadingGames,
    setGames,
    setIsLoadingGames,
    searchDelayTimer,
    setSearchDelayTimer,
    isProviderSelected = false
}) => {
    const { contextData } = useContext(AppContext);
    const { setShowMobileSearch } = useContext(LayoutContext);
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
        if (isProviderSelected) return;
        
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
    
    const handleLoginConfirm = () => {
        setShowLoginModal(false);
    };
    
    const handleCloseSearch = () => {
        setTxtSearch("");
        setGames([]);
        setIsLoadingGames(false);
        
        if (searchDelayTimer) {
            clearTimeout(searchDelayTimer);
            setSearchDelayTimer(null);
        }
        
        document.body.classList.remove('hc-opened-search');
        
        if (searchRef.current) {
            searchRef.current.blur();
        }
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
            <div className="float-casino-input-search-ex">
                <i className="fa-solid fa-magnifying-glass i"></i>
                <input
                    className="form-control"
                    id="input-header-search"
                    type="text"
                    autoComplete="off"
                    placeholder="Juegos - Proveedores - Categorías"
                    ref={searchRef}
                    value={txtSearch}
                    onChange={handleChange}
                    onKeyUp={search}
                    onFocus={handleFocus}
                    disabled={isProviderSelected}
                    style={isProviderSelected ? { cursor: 'not-allowed', opacity: 0.7 } : {}}
                />
                <button 
                    className="btn hc-close-search"
                    onClick={handleCloseSearch}
                >
                    <i className="fa-solid fa-xmark"></i> Cerrar
                </button>
            </div>
        </>
    );
};

export default SearchInput;