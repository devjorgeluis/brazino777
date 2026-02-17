import { useContext, useState, useEffect, useRef } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import { AppContext } from "../AppContext";
import { LayoutContext } from "../components/Layout/LayoutContext";
import { NavigationContext } from "../components/Layout/NavigationContext";
import { callApi } from "../utils/Utils";
import Footer from "../components/Layout/Footer";
import GameCard from "/src/components/GameCard";
import Slideshow from "../components/Casino/Slideshow";
import HotGameSlideshow from "../components/Home/HotGameSlideshow";
import GameModal from "../components/Modal/GameModal";
import LoadApi from "../components/Loading/LoadApi";
import LoginModal from "../components/Modal/LoginModal";
import ProviderContainer from "../components/Casino/ProviderContainer";
import CategoryContainer from "../components/CategoryContainer";

import ImgCategoryHome from "/src/assets/svg/all.svg";
import ImgCategoryPopular from "/src/assets/svg/new.svg";
import ImgCategoryBlackjack from "/src/assets/svg/blackjack.svg";
import ImgCategoryRoulette from "/src/assets/svg/roulette.svg";
import ImgCategoryCrash from "/src/assets/svg/speed.svg";
import ImgCategoryMegaways from "/src/assets/svg/gameshow.svg";

let selectedGameId = null;
let selectedGameType = null;
let selectedGameLauncher = null;
let selectedGameName = null;
let selectedGameImg = null;
let pageCurrent = 0;

const Casino = () => {
  const pageTitle = "Casino";
  const { contextData } = useContext(AppContext);
  const { isLogin } = useContext(LayoutContext);
  const { setShowFullDivLoading } = useContext(NavigationContext);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [tags, setTags] = useState([]);
  const [games, setGames] = useState([]);
  const [firstFiveCategoriesGames, setFirstFiveCategoriesGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState({});
  const [categoryType, setCategoryType] = useState("");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [pageData, setPageData] = useState({});
  const [gameUrl, setGameUrl] = useState("");
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [shouldShowGameModal, setShouldShowGameModal] = useState(false);
  const [isSingleCategoryView, setIsSingleCategoryView] = useState(false);
  const refGameModal = useRef();
  const location = useLocation();
  const { isSlotsOnly, isMobile } = useOutletContext();

  const pendingCategoryFetchesRef = useRef(0);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isMobile) {
        if (categories.length > 0 && !isLoadingGames) {
          const hashCode = location.hash.replace('#', '');
          
          if (!hashCode || hashCode === 'home') {
            const firstFiveCategories = categories.slice(0, 5);
            if (firstFiveCategories.length > 0) {
              setFirstFiveCategoriesGames([]);
              pendingCategoryFetchesRef.current = firstFiveCategories.length;
              setIsLoadingGames(true);
              firstFiveCategories.forEach((item, index) => {
                fetchContentForCategory(item, item.id, item.table_name, index, true, pageData.page_group_code);
              });
            }
          } else {
            const tagIndex = tags.findIndex(t => t.code === hashCode);
            if (tagIndex !== -1) {
              getPage(hashCode);
            }
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [categories, location.hash, isMobile, isLoadingGames, pageData, tags]);

  useEffect(() => {
    if (!location.hash || tags.length === 0) return;
    const hashCode = location.hash.replace('#', '');
    const tagIndex = tags.findIndex(t => t.code === hashCode);

    if (tagIndex !== -1 && selectedCategoryIndex !== tagIndex) {
      setSelectedCategoryIndex(tagIndex);
      setIsSingleCategoryView(false);
      getPage(hashCode);
    }
  }, [location.hash, tags]);

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
    getPage("casino");

    // window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const isSlotsOnlyFalse = isSlotsOnly === false || isSlotsOnly === "false";
    let tmpTags = isSlotsOnlyFalse
      ? [
        { name: "Lobby", code: "home", image: ImgCategoryHome },
        { name: "Hot", code: "hot", image: ImgCategoryPopular },
        { name: "Jokers", code: "joker", image: ImgCategoryBlackjack },
        { name: "Ruletas", code: "roulette", image: ImgCategoryRoulette },
        { name: "Crash", code: "arcade", image: ImgCategoryCrash },
        { name: "Megaways", code: "megaways", image: ImgCategoryMegaways },
      ]
      : [
        { name: "Lobby", code: "home", image: ImgCategoryHome },
        { name: "Hot", code: "hot", image: ImgCategoryPopular },
        { name: "Jokers", code: "joker", image: ImgCategoryBlackjack },
        { name: "Megaways", code: "megaways", image: ImgCategoryMegaways },
      ];

    setTags(tmpTags);
  }, [isSlotsOnly]);

  const getPage = (page) => {
    setIsLoadingGames(true);
    setGames([]);
    setFirstFiveCategoriesGames([]);
    setIsSingleCategoryView(false);
    callApi(contextData, "GET", "/get-page?page=" + page, (result) => callbackGetPage(result, page), null);
  };

  const callbackGetPage = (result, page) => {
    if (result.status === 500 || result.status === 422) {
      setIsLoadingGames(false);
      setShowFullDivLoading(false);
    } else {
      setCategoryType(result.data.page_group_type);
      setSelectedProvider(null);
      setPageData(result.data);

      const hashCode = location.hash.replace('#', '');
      const tagIndex = tags.findIndex(t => t.code === hashCode);
      setSelectedCategoryIndex(tagIndex !== -1 ? tagIndex : 0);

      if (result.data && result.data.page_group_type === "categories" && result.data.categories && result.data.categories.length > 0) {
        setCategories(result.data.categories);
        if (page === "casino") {
          setMainCategories(result.data.categories);
        }
        const firstCategory = result.data.categories[0];
        setActiveCategory(firstCategory);

        const firstFiveCategories = result.data.categories.slice(0, 5);
        if (firstFiveCategories.length > 0) {
          setFirstFiveCategoriesGames([]);
          pendingCategoryFetchesRef.current = firstFiveCategories.length;
          setShowFullDivLoading(true);
          firstFiveCategories.forEach((item, index) => {
            fetchContentForCategory(item, item.id, item.table_name, index, true, result.data.page_group_code);
          });
        }
      } else if (result.data && result.data.page_group_type === "games") {
        setIsSingleCategoryView(true);
        setCategories(mainCategories.length > 0 ? mainCategories : []);
        configureImageSrc(result);
        setGames(result.data.categories || []);
        setActiveCategory(tags[tagIndex] || { name: page });
        pageCurrent = 1;
      }

      setShowFullDivLoading(false);
      setIsLoadingGames(false);
    }
  };

  const fetchContentForCategory = (category, categoryId, tableName, categoryIndex, resetCurrentPage, pageGroupCode = null) => {
    const pageSize = 12;
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

    } else {
      const content = result.content || [];
      configureImageSrc(result);

      const gamesWithImages = content.map((game) => ({
        ...game,
        imageDataSrc: game.image_local !== null ? contextData.cdnUrl + game.image_local : game.image_url,
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
    }

    pendingCategoryFetchesRef.current = Math.max(0, pendingCategoryFetchesRef.current - 1);
    if (pendingCategoryFetchesRef.current === 0) {
      setIsLoadingGames(false);
    }
  };

  const loadMoreGames = () => {
    if (!activeCategory) return;
    fetchContent(activeCategory, activeCategory.id, activeCategory.table_name, selectedCategoryIndex, false);
  };

  const fetchContent = (category, categoryId, tableName, categoryIndex, resetCurrentPage, pageGroupCode) => {
    let pageSize = 500;
    setIsLoadingGames(true);

    if (resetCurrentPage) {
      pageCurrent = 0;
      setGames([]);
    }

    setActiveCategory(category);
    setSelectedCategoryIndex(categoryIndex);

    const groupCode = categoryType === "categories" ? pageGroupCode || pageData.page_group_code : "default_pages_home"

    let apiUrl =
      "/get-content?page_group_type=categories&page_group_code=" +
      groupCode +
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

  const callbackFetchContent = (result) => {
    if (result.status === 500 || result.status === 422) {
      setIsLoadingGames(false);
    } else {
      configureImageSrc(result);
      const newGames = result.content || [];

      if (pageCurrent === 0) {
        setGames(newGames);
      } else {
        setGames((prevGames) => [...prevGames, ...newGames]);
      }

      if (newGames.length > 0) {
        pageCurrent += 1;
      }
    }
    setIsLoadingGames(false);
  };

  const configureImageSrc = (result) => {
    (result.content || []).forEach((element) => {
      element.imageDataSrc = element.image_local !== null ? contextData.cdnUrl + element.image_local : element.image_url;
    });
  };

  const launchGame = (game, type, launcher) => {
    if (isMobile) {
      setShowFullDivLoading(true);
      setActiveCategory(null);
      selectedGameId = game.id;
      selectedGameType = type;
      selectedGameLauncher = launcher;
      selectedGameName = game?.name;
      selectedGameImg = game?.image_local != null ? contextData.cdnUrl + game?.image_local : game.image_url;
      callApi(contextData, "GET", "/get-game-url?game_id=" + selectedGameId, callbackLaunchGame, null);
    } else {
      setShouldShowGameModal(true);
      setShowFullDivLoading(true);
      setActiveCategory(null);
      selectedGameId = game.id != null ? game.id : selectedGameId;
      selectedGameType = type != null ? type : selectedGameType;
      selectedGameLauncher = launcher != null ? launcher : selectedGameLauncher;
      selectedGameName = game?.name;
      selectedGameImg = game?.image_local != null ? contextData.cdnUrl + game?.image_local : game.image_url;
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

  const handleCategorySelect = (category) => {
    setActiveCategory(category);
    setSelectedProvider(null);
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
      {shouldShowGameModal && selectedGameId !== null && !isMobile ? (
        <GameModal
          gameUrl={gameUrl}
          gameName={selectedGameName}
          gameImg={selectedGameImg}
          reload={launchGame}
          launchInNewTab={() => launchGame(null, null, "tab")}
          ref={refGameModal}
          onClose={closeGameModal}
          isMobile={isMobile}
          categories={categories}
          selectedProvider={selectedProvider}
          setSelectedProvider={setSelectedProvider}
          tags={tags}
          getPage={getPage}
        />
      ) : (
        <>
          <>
            <Slideshow />

            <CategoryContainer
              categories={tags}
              selectedCategoryIndex={selectedCategoryIndex}
              onCategoryClick={(tag, _id, _table, index) => {
                if (window.location.hash !== `#${tag.code}`) {
                  window.location.hash = `#${tag.code}`;
                } else {
                  setSelectedCategoryIndex(index);
                  getPage(tag.code);
                }
              }}
              onCategorySelect={handleCategorySelect}
              isMobile={isMobile}
              pageType="casino"
            />

            <ProviderContainer
              categories={categories}
              selectedProvider={selectedProvider}
              setSelectedProvider={setSelectedProvider}
              onProviderSelect={handleProviderSelect}
            />

            {selectedProvider || isSingleCategoryView ? (
              <div className="casino">
                <div className="container">
                  <div className="float-casino-wrapper">
                    <div className="float-casino-search-body">
                      <div className="jel-games-module">
                        <div className="jel-games-module-ex">
                          <div className="jel-games-module-title">
                            <div className="jel-games-module-title-icon color-04">
                              <i className="fa-regular fa-snowflake"></i>
                            </div>
                            <div className="jel-games-module-title-text">{activeCategory?.name}</div>
                          </div>
                        </div>
                      </div>
                      <div className="float-casino-search-body-ex">
                        {games.map((game) => (
                          <GameCard
                            key={game.id}
                            id={game.id}
                            title={game.name}
                            text={isLogin ? "Jugar" : "Ingresar"}
                            imageSrc={
                              game.image_local !== null
                                ? contextData.cdnUrl + game.image_local
                                : game.image_url
                            }
                            onGameClick={() =>
                              isLogin ? launchGame(game, "slot", "modal") : handleLoginClick()
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {isLoadingGames && <div className="my-3"><LoadApi /></div>}
              </div>
            ) : (
              <>
                {firstFiveCategoriesGames &&
                  firstFiveCategoriesGames.map((entry, catIndex) => {
                    if (!entry || !entry.games) return null;

                    const categoryKey = entry.category?.id || `cat-${catIndex}`;
                    if (entry.games.length === 0) return null;

                    return (
                      <div key={categoryKey}>
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
                    );
                  })
                }
              </>
            )}
          </>

          {/* <div className="my-4">
            {(isSingleCategoryView || selectedProvider) && !isLoadingGames && (
              <div className="text-center">
                <a className="btn btn-theme btn-h-custom" onClick={loadMoreGames}>
                  Mostrar todo
                </a>
              </div>
            )}
          </div> */}

          <Footer />
        </>
      )}
    </>
  );
};

export default Casino;