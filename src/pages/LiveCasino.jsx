import { useContext, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { AppContext } from "../AppContext";
import { LayoutContext } from "../components/Layout/LayoutContext";
import { NavigationContext } from "../components/Layout/NavigationContext";
import { callApi } from "../utils/Utils";
import LiveCasinoGameCard from "../components/LiveCasinoGameCard.jsx";
import GameModal from "../components/Modal/GameModal";
import HotGameSlideshow from "../components/Home/HotGameSlideshow";
import ProviderContainer from "../components/ProviderContainer";
import ProviderSelect from "../components/ProviderSelect";
import SearchInput from "../components/SearchInput";
import LoadApi from "../components/Loading/LoadApi";

let selectedGameId = null;
let selectedGameType = null;
let selectedGameLauncher = null;
let selectedGameName = null;
let selectedGameImg = null;
let pageCurrent = 0;

const LiveCasino = () => {
  const { contextData } = useContext(AppContext);
  const { isLogin } = useContext(LayoutContext);
  const { setShowFullDivLoading } = useContext(NavigationContext);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [games, setGames] = useState([]);
  const [firstFiveCategoriesGames, setFirstFiveCategoriesGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const originalCategoriesRef = useRef([]);
  const [activeCategory, setActiveCategory] = useState({});
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [pageData, setPageData] = useState({});
  const [gameUrl, setGameUrl] = useState("");
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [shouldShowGameModal, setShouldShowGameModal] = useState(false);
  const [isSingleCategoryView, setIsSingleCategoryView] = useState(false);

  // Search state
  const [txtSearch, setTxtSearch] = useState("");
  const [searchLabel, setSearchLabel] = useState("");
  const [isSearchView, setIsSearchView] = useState(false);
  const [searchDelayTimer, setSearchDelayTimer] = useState();
  const searchRef = useRef(null);

  const refGameModal = useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile } = useOutletContext();
  const hasFetchedContentRef = useRef(false);
  const prevHashRef = useRef("");
  const pendingCategoryFetchesRef = useRef(0);
  const lastLoadedCategoryRef = useRef(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isMobile) {
        if (categories.length > 0 && !isLoadingGames) {
          const hash = location.hash;
          if (!hash || hash === "#home") {
            const firstFiveCategories = categories.slice(1, 6);
            if (firstFiveCategories.length > 0) {
              setFirstFiveCategoriesGames([]);
              pendingCategoryFetchesRef.current = firstFiveCategories.length;
              setIsLoadingGames(true);
              firstFiveCategories.forEach((item, index) => {
                fetchContentForCategory(item, item.id, item.table_name, index, true, pageData.page_group_code);
              });
            }
          } else {
            const categoryCode = hash.substring(1);
            const category = categories.find(cat => cat.code === categoryCode);
            if (category) {
              const categoryIndex = categories.indexOf(category);
              fetchContent(category, category.id, category.table_name, categoryIndex, true);
            }
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [categories, location.hash, isMobile, isLoadingGames, pageData]);

  useEffect(() => {
    selectedGameId = null;
    selectedGameType = null;
    selectedGameLauncher = null;
    selectedGameName = null;
    selectedGameImg = null;
    setGameUrl("");
    setShouldShowGameModal(false);
    setActiveCategory({});
    setIsSingleCategoryView(false);
    setIsSearchView(false);
    setSearchLabel("");
    setTxtSearch("");
    hasFetchedContentRef.current = false;
    lastLoadedCategoryRef.current = null;
    getPage("livecasino");
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const getPage = (page) => {
    setIsLoadingGames(true);
    setCategories([]);
    setGames([]);
    setFirstFiveCategoriesGames([]);
    callApi(contextData, "GET", "/get-page?page=" + page, callbackGetPage, null);
  };

  const callbackGetPage = (result) => {
    if (result.status === 500 || result.status === 422) {
      setIsLoadingGames(false);
    } else {
      const homeCategory = {
        name: "Lobby",
        code: "home",
        id: 0,
        table_name: "apigames_categories"
      };
      const updatedCategories = [homeCategory, ...(result.data.categories || [])];
      setCategories(updatedCategories);
      if (!originalCategoriesRef.current || originalCategoriesRef.current.length === 0) {
        originalCategoriesRef.current = updatedCategories;
      }
      setSelectedProvider(null);
      setIsSearchView(false);
      setSearchLabel("");
      setPageData(result.data);

      const firstFiveCategories = updatedCategories.slice(1, 6);
      if (firstFiveCategories.length > 0) {
        setFirstFiveCategoriesGames([]);
        pendingCategoryFetchesRef.current = firstFiveCategories.length;
        setIsLoadingGames(true);
        firstFiveCategories.forEach((item, index) => {
          fetchContentForCategory(item, item.id, item.table_name, index, true, result.data.page_group_code);
        });
      } else {
        setIsLoadingGames(false);
      }
      setActiveCategory(homeCategory);
      setSelectedCategoryIndex(0);
    }
  };

  const fetchContentForCategory = (category, categoryId, tableName, categoryIndex, resetCurrentPage, pageGroupCode = null) => {
    if (!categoryId || !tableName) {
      pendingCategoryFetchesRef.current = Math.max(0, pendingCategoryFetchesRef.current - 1);
      if (pendingCategoryFetchesRef.current === 0) setIsLoadingGames(false);
      return;
    }
    const pageSize = 100;
    const groupCode = pageGroupCode || pageData.page_group_code;
    const apiUrl =
      "/get-content?page_group_type=categories&page_group_code=" +
      groupCode +
      "&table_name=" + tableName +
      "&apigames_category_id=" + categoryId +
      "&page=0&length=" + pageSize +
      (selectedProvider && selectedProvider.id ? "&provider=" + selectedProvider.id : "");

    callApi(contextData, "GET", apiUrl, (result) => callbackFetchContentForCategory(result, category, categoryIndex), null);
  };

  const callbackFetchContentForCategory = (result, category, categoryIndex) => {
    if (result.status === 500 || result.status === 422) {
      pendingCategoryFetchesRef.current = Math.max(0, pendingCategoryFetchesRef.current - 1);
      if (pendingCategoryFetchesRef.current === 0) setIsLoadingGames(false);
    } else {
      const content = result.content || [];
      configureImageSrc(result);

      const gamesWithImages = content.map((game) => ({
        ...game,
        imageDataSrc: game.image_local != null ? contextData.cdnUrl + game.image_local : game.image_url,
      }));

      setFirstFiveCategoriesGames((prev) => {
        const updated = [...prev];
        updated[categoryIndex] = { category, games: gamesWithImages };
        return updated;
      });

      pendingCategoryFetchesRef.current = Math.max(0, pendingCategoryFetchesRef.current - 1);
      if (pendingCategoryFetchesRef.current === 0) setIsLoadingGames(false);
    }
  };

  useEffect(() => {
    if (categories.length === 0) return;

    const hash = location.hash;

    const handleHashNavigation = () => {
      setSelectedProvider(null);

      if (!hash || hash === "#home") {
        setActiveCategory(categories[0]);
        setSelectedCategoryIndex(0);
        setIsSingleCategoryView(false);
        setGames([]);
        setFirstFiveCategoriesGames([]);

        const firstFiveCategories = categories.slice(1, 6);
        if (firstFiveCategories.length > 0) {
          pendingCategoryFetchesRef.current = firstFiveCategories.length;
          setIsLoadingGames(true);
          firstFiveCategories.forEach((item, index) => {
            fetchContentForCategory(item, item.id, item.table_name, index, true, pageData.page_group_code);
          });
        } else {
          setIsLoadingGames(false);
        }

        lastLoadedCategoryRef.current = null;
        return;
      }

      const categoryCode = hash.substring(1);
      const category = categories.find(cat => cat.code === categoryCode);

      if (category) {
        const categoryIndex = categories.indexOf(category);
        setActiveCategory(category);
        setSelectedCategoryIndex(categoryIndex);
        setIsSingleCategoryView(true);
        setSelectedProvider(category);
        setGames([]);
        setFirstFiveCategoriesGames([]);
        fetchContent(category, category.id, category.table_name, categoryIndex, true);
        lastLoadedCategoryRef.current = category.code;
      }
    };

    if (prevHashRef.current !== hash || !hasFetchedContentRef.current) {
      handleHashNavigation();
      prevHashRef.current = hash;
      hasFetchedContentRef.current = true;
    }
  }, [categories, location.hash, location.search]);

  const fetchContent = (category, categoryId, tableName, categoryIndex, resetCurrentPage) => {
    if (!categoryId || !tableName) {
      if (category.code === "home") {
        const pageSize = 30;
        setIsLoadingGames(true);
        if (resetCurrentPage) { pageCurrent = 0; setGames([]); }
        const apiUrl =
          "/get-content?page_group_type=categories&page_group_code=" +
          pageData.page_group_code + "&page=" + pageCurrent + "&length=" + pageSize;
        callApi(contextData, "GET", apiUrl, callbackFetchContent, null);
        return;
      }
      setIsLoadingGames(false);
      return;
    }

    const pageSize = 30;
    setIsLoadingGames(true);
    if (resetCurrentPage) { pageCurrent = 0; setGames([]); }

    setActiveCategory(category);
    setSelectedCategoryIndex(categoryIndex);

    let apiUrl =
      "/get-content?page_group_type=categories&page_group_code=" +
      pageData.page_group_code +
      "&table_name=" + tableName +
      "&apigames_category_id=" + categoryId +
      "&page=" + pageCurrent +
      "&length=" + pageSize;

    if (selectedProvider && selectedProvider.id) {
      apiUrl += "&provider=" + selectedProvider.id;
    }

    callApi(contextData, "GET", apiUrl, callbackFetchContent, null);
  };

  const loadMoreGames = () => {
    if (!activeCategory) return;
    fetchContent(activeCategory, activeCategory.id, activeCategory.table_name, selectedCategoryIndex, false);
  };

  const callbackFetchContent = (result) => {
    if (result.status === 500 || result.status === 422) {
      setIsLoadingGames(false);
    } else {
      configureImageSrc(result);
      if (pageCurrent === 0) {
        setGames(result.content);
      } else {
        setGames((prev) => [...prev, ...result.content]);
      }
      pageCurrent += 1;
    }
    setIsLoadingGames(false);
  };

  const configureImageSrc = (result) => {
    (result.content || []).forEach((element) => {
      element.imageDataSrc = element.image_local != null
        ? contextData.cdnUrl + element.image_local
        : element.image_url;
    });
  };

  // ── Search handlers ──────────────────────────────────────────────────────────

  const search = (e) => {
    const keyword = e.target.value;
    setTxtSearch(keyword);

    if (navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i)) {
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

    if (e.key === "Enter" || e.keyCode === 13 || e.key === "Escape" || e.keyCode === 27) {
      searchRef.current?.blur();
    }
  };

  const do_search = (keyword) => {
    clearTimeout(searchDelayTimer);

    if (keyword === "") {
      setGames([]);
      setIsLoadingGames(false);
      setIsSearchView(false);
      setSearchLabel("");
      return;
    }

    setGames([]);
    setIsLoadingGames(true);

    const pageSize = 500;
    const timer = setTimeout(() => {
      callApi(
        contextData,
        "GET",
        "/search-content?keyword=" + keyword + "&page_group_code=default_pages_home&length=" + pageSize,
        callbackSearch,
        null
      );
    }, 1000);

    setSearchDelayTimer(timer);
  };

  const callbackSearch = (result) => {
    if (result.status !== 500 && result.status !== 422) {
      configureImageSrc(result);
      setGames(result.content);
    }
    setIsLoadingGames(false);
  };

  const handleSearchSubmit = () => {
    if (!txtSearch.trim()) return;
    setSearchLabel(txtSearch);
    setIsSearchView(true);
    setSelectedProvider(null);
    setIsSingleCategoryView(false);
  };

  const handleGameSelect = (game) => {
    const gameName = game.name || game.title || "Juego";
    setSearchLabel(gameName);
    setTxtSearch("");
    setIsSearchView(true);
    setSelectedProvider(null);
    setIsSingleCategoryView(false);
    setGames([game]);
  };

  const handleSearchClear = () => {
    setTxtSearch("");
    setSearchLabel("");
    setGames([]);
    setIsSearchView(false);
    setIsLoadingGames(false);
  };

  // ── Game launch ──────────────────────────────────────────────────────────────

  const launchGame = (game, type, launcher) => {
    if (isMobile) {
      setShowFullDivLoading(true);
      selectedGameId = game.id;
      selectedGameType = type;
      selectedGameLauncher = launcher;
      selectedGameName = game?.name;
      selectedGameImg = game?.image_local != null ? contextData.cdnUrl + game?.image_local : null;
      callApi(contextData, "GET", "/get-game-url?game_id=" + selectedGameId, callbackLaunchGame, null);
    } else {
      setShouldShowGameModal(true);
      setShowFullDivLoading(true);
      selectedGameId = game.id != null ? game.id : selectedGameId;
      selectedGameType = type != null ? type : selectedGameType;
      selectedGameLauncher = launcher != null ? launcher : selectedGameLauncher;
      selectedGameName = game?.name;
      selectedGameImg = game?.image_local != null ? contextData.cdnUrl + game?.image_local : null;
      callApi(contextData, "GET", "/get-game-url?game_id=" + selectedGameId, callbackLaunchGame, null);
    }
  };

  const callbackLaunchGame = (result) => {
    setShowFullDivLoading(false);
    if (result.status == "0") {
      if (isMobile) {
        window.location.href = result.url;
      } else {
        switch (selectedGameLauncher) {
          case "modal":
          case "tab":
            setGameUrl(result.url);
            break;
        }
      }
    }
  };

  const closeGameModal = () => {
    selectedGameId = null;
    selectedGameType = null;
    selectedGameLauncher = null;
    selectedGameName = null;
    selectedGameImg = null;
    setGameUrl("");
    setShouldShowGameModal(false);
  };

  const handleLoginClick = () => {
    navigate("/");
  };

  const handleProviderSelect = (provider, index = 0) => {
    setIsSearchView(false);
    setSearchLabel("");
    setTxtSearch("");
    setSelectedProvider(provider);
    window.scrollTo(0, 0);

    if (provider) {
      setActiveCategory(null);
      setSelectedCategoryIndex(-1);
      fetchContent(provider, provider.id, provider.table_name, index, true);
    } else {
      const firstCategory = categories[0];
      if (firstCategory) {
        setActiveCategory(firstCategory);
        setSelectedCategoryIndex(0);
        fetchContent(firstCategory, firstCategory.id, firstCategory.table_name, 0, true);
      }
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  const showGrid = selectedProvider?.name || isSearchView || isSingleCategoryView;

  return (
    <main className="index--page live-casino-page">
      {shouldShowGameModal && selectedGameId !== null && !isMobile && (
        <GameModal
          gameUrl={gameUrl}
          gameName={selectedGameName}
          gameImg={selectedGameImg}
          reload={launchGame}
          launchInNewTab={() => launchGame(null, null, "tab")}
          ref={refGameModal}
          onClose={closeGameModal}
          isMobile={isMobile}
          provider={selectedProvider?.name || "Casino"}
        />
      )}

      {(!shouldShowGameModal || isMobile) && (
        <div className="casino">
          <section className="search-and-producers">
            <ProviderSelect
              categories={categories}
              selectedProvider={selectedProvider}
              setSelectedProvider={setSelectedProvider}
              onProviderSelect={handleProviderSelect}
            />
            <SearchInput
              txtSearch={txtSearch}
              setTxtSearch={setTxtSearch}
              searchRef={searchRef}
              search={search}
              isMobile={isMobile}
              games={games}
              isLoadingGames={isLoadingGames}
              onSearchSubmit={handleSearchSubmit}
              onGameSelect={handleGameSelect}
              onClear={handleSearchClear}
            />
          </section>

          {showGrid ? (
            <div className="category--page">
              <div className="category--games">
                <div className="games-block-wrapper">
                  <h2 className="title title--aviatrix title--producers">
                    <a className="title__text">
                      {selectedProvider?.name || (isSearchView ? `Resultados: "${searchLabel}"` : activeCategory?.name)}
                    </a>
                    {!isSearchView && (
                      <a className="see-all" onClick={loadMoreGames}>Ver más</a>
                    )}
                  </h2>

                  <div className="body-games-lc">
                    {games.map((game) => (
                      <LiveCasinoGameCard
                        key={"lc-game-" + game.id}
                        id={game.id}
                        provider={activeCategory?.name || "Casino en Vivo"}
                        title={game.name}
                        imageSrc={game.image_local !== null ? contextData.cdnUrl + game.image_local : game.image_url}
                        onGameClick={() => (isLogin ? launchGame(game, "slot", "tab") : handleLoginClick())}
                      />
                    ))}
                  </div>

                  {isLoadingGames && <div className="my-3"><LoadApi width={60} /></div>}

                  {!isSearchView && (
                    <div className="text-center mb-4">
                      <a className="btn btn-theme btn-h-custom" onClick={loadMoreGames}>
                        Mostrar todo
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="index--container">
              {firstFiveCategoriesGames && firstFiveCategoriesGames.map((entry, catIndex) => {
                if (!entry || !entry.games || entry.games.length === 0) return null;
                const categoryKey = entry.category?.id || `cat-${catIndex}`;
                return (
                  <div key={categoryKey} className="casino-games-container">
                    <div className="casino-games-container__list">
                      <HotGameSlideshow
                        games={entry.games.slice(0, 30)}
                        name={entry.category.name}
                        title={entry.category.name}
                        onGameClick={(game) => {
                          if (isLogin) {
                            launchGame(game, "slot", "modal");
                          } else {
                            handleLoginClick();
                          }
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <ProviderContainer
            categories={categories}
            selectedProvider={selectedProvider}
            setSelectedProvider={setSelectedProvider}
            onProviderSelect={handleProviderSelect}
          />
        </div>
      )}
    </main>
  );
};

export default LiveCasino;