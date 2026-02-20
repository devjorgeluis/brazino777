import { useContext, useState, useEffect, useRef, useMemo } from "react";
import { AppContext } from "../AppContext";
import LoadApi from "./Loading/LoadApi";

const ProviderSelect = ({
    categories,
    onProviderSelect,
    selectedProvider,
    isSelectCategory
}) => {
    const { contextData } = useContext(AppContext);
    
    const providers = useMemo(() => 
        categories.filter((cat) => cat.code && cat.code !== "home"),
        [categories]
    );
    
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredProviders, setFilteredProviders] = useState([]);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredProviders(providers);
        } else {
            const filtered = providers.filter(provider =>
                provider.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredProviders(filtered);
        }
    }, [searchTerm, providers]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setSearchTerm("");
        }
    };

    const handleClick = (e, provider) => {
        e.preventDefault();
        onProviderSelect(provider);
        setIsOpen(false);
        setSearchTerm("");
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleClearSearch = () => {
        setSearchTerm("");
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            setSearchTerm("");
        }
    };

    return (
        <div id="vue-producer-block" ref={dropdownRef}>
            <div className={`producer-block ${isOpen ? 'active' : ''}`}>
                <div className="producer-block__selected" onClick={handleToggle}>
                    <button 
                        className="producer-block__dropdown-btn"
                        aria-expanded={isOpen}
                        aria-haspopup="listbox"
                    >
                        {selectedProvider ? selectedProvider?.name : "Proveedores"}
                        {isSelectCategory && <LoadApi />}
                    </button>
                </div>
                <div className={`producer-block__wrapper ${isOpen ? 'show' : ''}`}>
                    <form className="producer-block__search" onSubmit={(e) => e.preventDefault()}>
                        <input
                            className="producer-block__search-input"
                            type="text"
                            placeholder="Buscar proveedor"
                            autoComplete="off"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyDown={handleKeyDown}
                        />
                        {searchTerm && (
                            <span 
                                className="producer-block__search-close show"
                                onClick={handleClearSearch}
                                role="button"
                                tabIndex={0}
                                aria-label="Clear search"
                            ></span>
                        )}
                        <button 
                            className="producer-block__search-button"
                            type="submit"
                            aria-label="Search"
                        ></button>
                    </form>
                    <ul className="producer-block__list" role="listbox">
                        {filteredProviders.length > 0 ? (
                            filteredProviders.map((provider, idx) => {
                                const imageUrl = provider.image_local
                                    ? `${contextData.cdnUrl}${provider.image_local}`
                                    : provider.image_url;

                                return (
                                    <li 
                                        key={idx} 
                                        onClick={(e) => handleClick(e, provider)}
                                        role="option"
                                        aria-selected={selectedProvider?.id === provider.id}
                                        className={selectedProvider?.id === provider.id ? 'selected' : ''}
                                    >
                                        <a>
                                            {
                                                imageUrl && <img src={imageUrl} alt={provider?.name} />
                                            }
                                            <span>{provider?.name}</span>
                                        </a>
                                    </li>
                                )
                            })
                        ) : (
                            <></>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ProviderSelect;