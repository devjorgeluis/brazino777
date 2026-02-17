import { useContext, useState, useEffect, useRef } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import { AppContext } from "../AppContext";
import { LayoutContext } from "../components/Layout/LayoutContext";
import { NavigationContext } from "../components/Layout/NavigationContext";
import { callApi } from "../utils/Utils";
import LiveCasinoGameCard from "../components/LiveCasinoGameCard.jsx";
import GameModal from "../components/Modal/GameModal";
import ProviderModal from "../components/Modal/ProviderModal";
import Slideshow from "../components/LiveCasino/Slideshow.jsx";
import HotGameSlideshow from "../components/Home/HotGameSlideshow";
import ProviderContainer from "../components/ProviderContainer";
import Footer from "../components/Layout/Footer";
import LoadApi from "../components/Loading/LoadApi";
import LoginModal from "../components/Modal/LoginModal";

let selectedGameId = null;
let selectedGameType = null;
let selectedGameLauncher = null;
let selectedGameName = null;
let selectedGameImg = null;
let pageCurrent = 0;

const LiveCasino = () => {
  const pageTitle = "Casino en Vivo";
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
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [shouldShowGameModal, setShouldShowGameModal] = useState(false);
  const [isSingleCategoryView, setIsSingleCategoryView] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const refGameModal = useRef();
  const location = useLocation();
  const { isMobile } = useOutletContext();
  const hasFetchedContentRef = useRef(false);
  const prevHashRef = useRef("");
  const pendingCategoryFetchesRef = useRef(0);
  const lastLoadedCategoryRef = useRef(null);

  // Handle page visibility changes (for mobile back navigation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isMobile) {
        // Page became visible again (user returned from game)
        // Reload content if we have categories
        if (categories.length > 0 && !isLoadingGames) {
          const hash = location.hash;
          if (!hash || hash === "#home") {
            // Reload home content
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
            // Reload category content
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
      if (pendingCategoryFetchesRef.current === 0) {
        setIsLoadingGames(false);
      }
      return;
    }
    const pageSize = 100;
    const groupCode = pageGroupCode || pageData.page_group_code;
    const apiUrl =
      "/get-content?page_group_type=categories&page_group_code=" +
      groupCode +
      "&table_name=" +
      tableName +
      "&apigames_category_id=" +
      categoryId +
      "&page=0&length=" +
      pageSize +
      (selectedProvider && selectedProvider.id ? "&provider=" + selectedProvider.id : "");

    callApi(contextData, "GET", apiUrl, (result) => callbackFetchContentForCategory(result, category, categoryIndex), null);
  };

  const callbackFetchContentForCategory = (result, category, categoryIndex) => {
    if (result.status === 500 || result.status === 422) {
      pendingCategoryFetchesRef.current = Math.max(0, pendingCategoryFetchesRef.current - 1);
      if (pendingCategoryFetchesRef.current === 0) {
        setIsLoadingGames(false);
      }
    } else {
      const content = result.content || [];
      configureImageSrc(result);

      const gamesWithImages = content.map((game) => ({
        ...game,
        imageDataSrc: game.image_local != null ? contextData.cdnUrl + game.image_local : game.image_url,
      }));

      const categoryGames = {
        category: category,
        games: gamesWithImages,
      };

      setFirstFiveCategoriesGames((prev) => {
        const updated = [...prev];
        updated[categoryIndex] = categoryGames;
        return updated;
      });

      pendingCategoryFetchesRef.current = Math.max(0, pendingCategoryFetchesRef.current - 1);
      if (pendingCategoryFetchesRef.current === 0) {
        setIsLoadingGames(false);
      }
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
        setSelectedProvider(category)

        setGames([]);
        setFirstFiveCategoriesGames([]);

        fetchContent(category, category.id, category.table_name, categoryIndex, true);
        lastLoadedCategoryRef.current = category.code;
      }
    };

    // Only execute if hash has changed
    if (prevHashRef.current !== hash || !hasFetchedContentRef.current) {
      handleHashNavigation();
      prevHashRef.current = hash;
      hasFetchedContentRef.current = true;
    }
  }, [categories, location.hash, location.search]);

  const fetchContent = (category, categoryId, tableName, categoryIndex, resetCurrentPage) => {
    if (!categoryId || !tableName) {
      if (category.code === "home") {
        const pageSize = 500;
        setIsLoadingGames(true);
        if (resetCurrentPage) {
          pageCurrent = 0;
          setGames([]);
        }
        const apiUrl =
          "/get-content?page_group_type=categories&page_group_code=" +
          pageData.page_group_code +
          "&page=" +
          pageCurrent +
          "&length=" +
          pageSize;
        callApi(contextData, "GET", apiUrl, callbackFetchContent, null);
        return;
      }
      setIsLoadingGames(false);
      return;
    }
    let pageSize = 500;
    setIsLoadingGames(true);

    if (resetCurrentPage) {
      pageCurrent = 0;
      setGames([]);
    }

    setActiveCategory(category);
    setSelectedCategoryIndex(categoryIndex);

    let apiUrl =
      "/get-content?page_group_type=categories&page_group_code=" +
      pageData.page_group_code +
      "&table_name=" +
      tableName +
      "&apigames_category_id=" +
      categoryId +
      "&page=" +
      pageCurrent +
      "&length=" +
      pageSize;

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
      
      if (pageCurrent == 0) {
        setGames(result.content);
      } else {
        setGames([...games, ...result.content]);
      }
      pageCurrent += 1;
    }
    setIsLoadingGames(false);
  };

  const configureImageSrc = (result) => {
    (result.content || []).forEach((element) => {
      let imageDataSrc = element.image_url;
      if (element.image_local != null) {
        imageDataSrc = contextData.cdnUrl + element.image_local;
      }
      element.imageDataSrc = imageDataSrc;
    });
  };

  const launchGame = (game, type, launcher) => {
    if (isMobile) {
      // For mobile, directly navigate without setting modal state
      setShowFullDivLoading(true);
      selectedGameId = game.id;
      selectedGameType = type;
      selectedGameLauncher = launcher;
      selectedGameName = game?.name;
      selectedGameImg = game?.image_local != null ? contextData.cdnUrl + game?.image_local : null;
      callApi(contextData, "GET", "/get-game-url?game_id=" + selectedGameId, callbackLaunchGame, null);
    } else {
      // For desktop, show modal
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
        // For mobile, directly navigate
        window.location.href = result.url;
      } else {
        // For desktop, set URL for modal
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
    setShowLoginModal(true);
  };

  const handleLoginConfirm = () => {
    setShowLoginModal(false);
  };

  const handleProviderSelect = (provider, index = 0) => {
    setSelectedProvider(provider);

    if (provider) {
      setActiveCategory(null);
      setSelectedCategoryIndex(-1);

      fetchContent(
        provider,
        provider.id,
        provider.table_name,
        index,
        true
      );
    } else {
      const firstCategory = categories[0];
      if (firstCategory) {
        setActiveCategory(firstCategory);
        setSelectedCategoryIndex(0);
        fetchContent(firstCategory, firstCategory.id, firstCategory.table_name, 0, true);
      }
    }
  };

  return (
    <>
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onConfirm={handleLoginConfirm}
          isMobile={isMobile}
        />
      )}

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

      {/* Only show LiveCasino content when game modal is NOT shown OR on mobile */}
      {(!shouldShowGameModal || isMobile) && (
        <div className="casino">
          <Slideshow />
          
          <ProviderContainer
            categories={categories}
            selectedProvider={selectedProvider}
            setSelectedProvider={setSelectedProvider}
            onProviderSelect={handleProviderSelect}
            onOpenProviders={() => setShowFilterModal(true)}
          />

          {
            selectedProvider && selectedProvider.name ?
            <div className="container">
              <div className="body-games-lc">
                {games.map((game) => (
                  <LiveCasinoGameCard
                    key={"popular" + game.id}
                    id={game.id}
                    provider={activeCategory?.name || 'Casino'}
                    title={game.name}
                    imageSrc={game.image_local !== null ? contextData.cdnUrl + game.image_local : game.image_url}
                    onGameClick={() => (isLogin ? launchGame(game, "slot", "tab") : handleLoginClick())}
                  />
                ))}
              </div>
              <div className="mb-4">
                {isLoadingGames && <LoadApi width={60} />}
                {(isSingleCategoryView || selectedProvider) && !isLoadingGames && (
                  <div className="text-center">
                    <a className="btn btn-theme btn-h-custom" onClick={loadMoreGames}>
                      Mostrar todo
                    </a>
                  </div>
                )}
              </div>
            </div> :
            <>
              {firstFiveCategoriesGames && firstFiveCategoriesGames.map((entry, catIndex) => {
                if (!entry || !entry.games) return null;
                const categoryKey = entry.category?.id || `cat-${catIndex}`;

                if (entry.games.length === 0) return null;

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
            </>
          }

          <Footer />
        </div>
      )}

      <ProviderModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onCategorySelect={(category) => {
          handleCategorySelect(category);
        }}
        onCategoryClick={(tag, _id, _table, index) => {
          setShowFullDivLoading(true);
          if (window.location.hash !== `#${tag.code}`) {
            window.location.hash = `#${tag.code}`;
          } else {
            setSelectedCategoryIndex(index);
            setIsExplicitSingleCategoryView(false);
            getPage(tag.code);
          }
        }}
        onSelectProvider={(provider) => {
          handleProviderSelect(provider);
          setShowFilterModal(false);
        }}
        contextData={contextData}
        categories={categories}
        selectedCategoryIndex={selectedCategoryIndex}
      />
    </>
  );
};

export default LiveCasino;