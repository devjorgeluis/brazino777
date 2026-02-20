import { useContext, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { AppContext } from "../AppContext";
import { LayoutContext } from "../components/Layout/LayoutContext";
import { NavigationContext } from "../components/Layout/NavigationContext";
import { callApi } from "../utils/Utils";
import GameCard from "/src/components/GameCard";
import HotGameSlideshow from "../components/Home/HotGameSlideshow";
import GameModal from "../components/Modal/GameModal";
import LoadApi from "../components/Loading/LoadApi";
import ProviderContainer from "../components/ProviderContainer";
import CategoryContainer from "../components/CategoryContainer";
import ProviderSelect from "../components/ProviderSelect";
import SearchInput from "../components/SearchInput";

import ImgCategoryHome from "/src/assets/svg/carnival-mask.svg";
import ImgCategoryPopular from "/src/assets/svg/new.svg";
import ImgCategoryBlackjack from "/src/assets/svg/blackjack.svg";
import ImgCategoryRoulette from "/src/assets/svg/bingo.svg";
import ImgCategoryCrash from "/src/assets/svg/crash.svg";
import ImgCategoryMegaways from "/src/assets/svg/megaway.svg";

let selectedGameId = null;
let selectedGameType = null;
let selectedGameLauncher = null;
let selectedGameName = null;
let selectedGameImg = null;
let pageCurrent = 0;

const Casino = () => {
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
  const [shouldShowGameModal, setShouldShowGameModal] = useState(false);
  const [isSingleCategoryView, setIsSingleCategoryView] = useState(false);
  const [searchLabel, setSearchLabel] = useState("");

  // Search state
  const [txtSearch, setTxtSearch] = useState("");
  const [isSearchView, setIsSearchView] = useState(false);
  const [searchDelayTimer, setSearchDelayTimer] = useState();
  const searchRef = useRef(null);

  const refGameModal = useRef();
  const location = useLocation();
  const navigate = useNavigate();
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
      setIsSearchView(false);
      setSearchLabel("");
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
    if (result.status !== 500 && result.status !== 422) {
      const content = result.content || [];
      configureImageSrc(result);

      const gamesWithImages = content.map((game) => ({
        ...game,
        imageDataSrc: game.image_local !== null ? contextData.cdnUrl + game.image_local : game.image_url,
      }));

      setFirstFiveCategoriesGames((prev) => {
        const updated = [...prev];
        updated[categoryIndex] = { category, games: gamesWithImages };
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
    let pageSize = 30;
    setIsLoadingGames(true);

    if (resetCurrentPage) {
      pageCurrent = 0;
      setGames([]);
    }

    setActiveCategory(category);
    setSelectedCategoryIndex(categoryIndex);

    const groupCode = categoryType === "categories" ? pageGroupCode || pageData.page_group_code : "default_pages_home";

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
  };

  const handleGameSelect = (game) => {
    const gameName = game.name || game.title || "Juego";
    setTxtSearch(gameName);
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
    navigate("/login");
  };

  const handleProviderSelect = (provider, index = 0) => {
    setIsSearchView(false);
    setSearchLabel("");
    setSelectedProvider(provider);
    setTxtSearch("");
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

  const handleCategorySelect = (category) => {
    setIsSearchView(false);
    setSearchLabel("");
    setActiveCategory(category);
    setSelectedProvider(null);
    setTxtSearch("");
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  const showProviderOrSearchGrid = selectedProvider?.name || isSearchView || isSingleCategoryView;

  return (
    <main className="index--page">
      {shouldShowGameModal && selectedGameId !== null ? (
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

          {showProviderOrSearchGrid ? (
            <div className="category--page">
              <div className="category--games">
                <div className="games-block-wrapper">
                  <h2 className="title title--aviatrix title--producers">
                    <a className="title__text">
                      {selectedProvider?.name || (isSearchView ? `Resultados: "${txtSearch}"` : activeCategory?.name)}
                    </a>
                    {!isSearchView && (
                      <a className="see-all" onClick={loadMoreGames}>Ver más</a>
                    )}
                  </h2>

                  <div className="games-block">
                    {games.map((game) => (
                      <GameCard
                        key={"casino-game-" + game.id}
                        id={game.id}
                        provider={activeCategory?.name || "Casino"}
                        title={game.name}
                        imageSrc={game.image_local !== null ? contextData.cdnUrl + game.image_local : game.image_url}
                        onClick={() => (isLogin ? launchGame(game, "slot", "modal") : handleLoginClick())}
                      />
                    ))}
                  </div>

                  {isLoadingGames && <div className="my-3"><LoadApi /></div>}

                  {!isSearchView && (
                    <button onClick={loadMoreGames} type="button" className="button button--load-games">
                      <span className="button--load-games__text">Mostrar más</span>
                    </button>
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
              })}
            </div>
          )}

          <ProviderContainer
            categories={categories}
            selectedProvider={selectedProvider}
            setSelectedProvider={setSelectedProvider}
            onProviderSelect={handleProviderSelect}
          />
        </>
      )}
    </main>
  );
};

export default Casino;