import { useContext, useState, useEffect, useRef } from "react";
import { useOutletContext, useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../AppContext";
import { NavigationContext } from "../components/Layout/NavigationContext";
import { LayoutContext } from "../components/Layout/LayoutContext";
import { callApi } from "../utils/Utils";
import Slideshow from "../components/Home/Slideshow";
import HotGameSlideshow from "../components/Home/HotGameSlideshow";
import CategoryContainer from "../components/CategoryContainer";
import ProviderContainer from "../components/ProviderContainer";
import ProviderSelect from "../components/ProviderSelect";
import GameModal from "../components/Modal/GameModal";
import SearchInput from "../components/SearchInput";
import GameCard from "../components/GameCard";

import ImgCategoryHome from "/src/assets/svg/carnival-mask.svg";
import ImgCategoryPopular from "/src/assets/svg/new.svg";
import ImgCategoryBlackjack from "/src/assets/svg/blackjack.svg";
import ImgCategoryRoulette from "/src/assets/svg/bingo.svg";
import ImgCategoryCrash from "/src/assets/svg/crash.svg";
import ImgCategoryMegaways from "/src/assets/svg/megaway.svg";
import LoadApi from "../components/Loading/LoadApi";

let selectedGameId = null;
let selectedGameType = null;
let selectedGameLauncher = null;
let selectedGameName = null;
let selectedGameImg = null;
let pageCurrent = 0;

const Home = () => {
  const { contextData } = useContext(AppContext);
  const { setShowFullDivLoading } = useContext(NavigationContext);
  const { searchGames, setSearchGames } = useContext(LayoutContext);
  const [txtSearch, setTxtSearch] = useState("");
  const [topGames, setTopGames] = useState([]);
  const [topArcade, setTopArcade] = useState([]);
  const [topCasino, setTopCasino] = useState([]);
  const [topLiveCasino, setTopLiveCasino] = useState([]);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [tags, setTags] = useState([]);
  const [games, setGames] = useState([]);
  const [firstFiveCategoriesGames, setFirstFiveCategoriesGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [activeCategory, setActiveCategory] = useState({});
  const [pageData, setPageData] = useState({});
  const [gameUrl, setGameUrl] = useState("");
  const [categoryType, setCategoryType] = useState("");
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [isSelectCategory, setIsSelectCategory] = useState(false);
  const [isSearchView, setIsSearchView] = useState(false);
  const [isSingleCategoryView, setIsSingleCategoryView] = useState(false);
  const [searchLabel, setSearchLabel] = useState("");
  const [shouldShowGameModal, setShouldShowGameModal] = useState(false);
  const refGameModal = useRef();
  const pendingPageRef = useRef(new Set());
  const pendingCategoryFetchesRef = useRef(0);
  const lastProcessedPageRef = useRef({ page: null, ts: 0 });
  const { isSlotsOnly, isLogin, isMobile } = useOutletContext();
  const location = useLocation();
  const searchRef = useRef(null);
  const [searchDelayTimer, setSearchDelayTimer] = useState();
  const navigate = useNavigate();

  const isLobbyView = !selectedProvider && !isSearchView && !isSingleCategoryView && 
  (!activeCategory?.code || activeCategory?.code === "home");

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const currentPath = window.location.pathname;
        if (currentPath === "/" || currentPath === "") {
          pendingPageRef.current.clear();
          lastProcessedPageRef.current = { page: null, ts: 0 };

          getPage("home");
          getStatus();

          selectedGameId = null;
          selectedGameType = null;
          selectedGameLauncher = null;
          setShouldShowGameModal(false);
          setGameUrl("");
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

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

  useEffect(() => {
    selectedGameId = null;
    selectedGameType = null;
    selectedGameLauncher = null;
    selectedGameName = null;
    selectedGameImg = null;
    setGameUrl("");
    setShouldShowGameModal(false);
    setActiveCategory({});
    getStatus();
    setIsSingleCategoryView(false);

    if (!location.hash) {
      getPage("home");
    }

  }, [location.pathname]);

  useEffect(() => {
    const hashCode = location.hash.replace("#", "");
    if (!hashCode || tags.length === 0) return;

    const tagIndex = tags.findIndex((t) => t.code === hashCode);
    if (tagIndex !== -1) {
      setSelectedCategoryIndex(tagIndex);
      getPage(hashCode);
    }
  }, [location.hash, tags]);

  const getStatus = () => {
    callApi(contextData, "GET", "/get-status", callbackGetStatus, null);
  };

  const callbackGetStatus = (result) => {
    if (result.status === 500 || result.status === 422) {
      // Handle error
    } else {
      setTopGames(result.top_hot);
      setTopArcade(result.top_arcade);
      setTopCasino(result.top_slot);
      setTopLiveCasino(result.top_livecasino);
      contextData.slots_only = result && result.slots_only;
    }
  };

  const getPage = (page) => {
    if (pendingPageRef.current.has(page)) return;
    pendingPageRef.current.add(page);

    setCategories([]);
    setGames([]);
    setFirstFiveCategoriesGames([]);
    setIsSingleCategoryView(false);

    callApi(
      contextData,
      "GET",
      "/get-page?page=" + page,
      (result) => callbackGetPage(result, page),
      null,
    );
  };

  const callbackGetPage = (result, page) => {
    if (result.status === 500 || result.status === 422) {
      setIsLoadingGames(false);
      setShowFullDivLoading(false);
    } else {
      setCategoryType(result.data.page_group_type);
      setSelectedProvider(null);
      setPageData(result.data);

      const hashCode = location.hash.replace("#", "");
      const tagIndex = tags.findIndex((t) => t.code === hashCode);
      setSelectedCategoryIndex(tagIndex !== -1 ? tagIndex : 0);

      if (
        result.data &&
        result.data.page_group_type === "categories" &&
        result.data.categories &&
        result.data.categories.length > 0
      ) {
        setCategories(result.data.categories);
        if (page === "casino" || page === "home") {
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
            fetchContentForCategory(
              item,
              item.id,
              item.table_name,
              index,
              true,
              result.data.page_group_code,
            );
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

  const handleLoginClick = () => {
    navigate("/login");
  };

  const loadMoreGames = () => {
    if (!activeCategory) return;
    fetchContent(
      activeCategory,
      activeCategory.id,
      activeCategory.table_name,
      selectedCategoryIndex,
      false,
    );
  };

  const fetchContent = (
    category,
    categoryId,
    tableName,
    categoryIndex,
    resetCurrentPage,
    pageGroupCode,
  ) => {
    let pageSize = 30;
    setIsLoadingGames(true);

    if (resetCurrentPage) {
      pageCurrent = 0;
      setGames([]);
    }

    setActiveCategory(category);
    setSelectedCategoryIndex(categoryIndex);

    const groupCode =
      categoryType === "categories"
        ? pageGroupCode || pageData.page_group_code
        : "default_pages_home";

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

      if (pageCurrent == 0) {
        setGames(result.content);
        setSearchGames(result.content);
      } else {
        setGames([...games, ...result.content]);
        setSearchGames([...searchGames, ...result.content]);
      }
      pageCurrent += 1;
    }
    setIsLoadingGames(false);
  };

  const fetchContentForCategory = (
    category,
    categoryId,
    tableName,
    categoryIndex,
    resetCurrentPage,
    pageGroupCode = null,
  ) => {
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
      (selectedProvider && selectedProvider.id
        ? "&provider=" + selectedProvider.id
        : "");

    callApi(
      contextData,
      "GET",
      apiUrl,
      (result) =>
        callbackFetchContentForCategory(result, category, categoryIndex),
      null,
    );
  };

  const callbackFetchContentForCategory = (result, category, categoryIndex) => {
    if (result.status === 500 || result.status === 422) {
    } else {
      configureImageSrc(result);
    }

    pendingCategoryFetchesRef.current = Math.max(
      0,
      pendingCategoryFetchesRef.current - 1,
    );
    if (pendingCategoryFetchesRef.current === 0) {
    }

    const content = result.content || [];
    const gamesWithImages = content.map((game) => ({
      ...game,
      imageDataSrc:
        game.image_local !== null
          ? contextData.cdnUrl + game.image_local
          : game.image_url,
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
  };

  const launchGame = (game, type, launcher) => {
    setShowFullDivLoading(true);
    if (!isMobile) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    }
    // Only show modal when explicitly using modal launcher
    if (launcher === "modal") {
      setShouldShowGameModal(true);
    } else {
      setShouldShowGameModal(false);
    }
    selectedGameId = game?.id != null ? game.id : selectedGameId;
    selectedGameType = type != null ? type : selectedGameType;
    selectedGameLauncher = launcher != null ? launcher : selectedGameLauncher;
    selectedGameName = game?.name || selectedGameName;
    selectedGameImg =
      game?.image_local != null
        ? contextData.cdnUrl + game.image_local
        : selectedGameImg;
    callApi(
      contextData,
      "GET",
      "/get-game-url?game_id=" + selectedGameId,
      callbackLaunchGame,
      null,
    );
  };

  const callbackLaunchGame = (result) => {
    setShowFullDivLoading(false);
    if (result.status == "0") {
      if (isMobile) {
        try {
          window.location.href = result.url;
        } catch (err) {
          try {
            window.open(result.url, "_blank", "noopener,noreferrer");
          } catch (err) { }
        }
        // Reset game active state for mobile
        selectedGameId = null;
        selectedGameType = null;
        selectedGameLauncher = null;
        selectedGameName = null;
        selectedGameImg = null;
        setGameUrl("");
        setShouldShowGameModal(false);
        return;
      }

      if (selectedGameLauncher === "tab") {
        try {
          window.open(result.url, "_blank", "noopener,noreferrer");
        } catch (err) {
          window.location.href = result.url;
        }
        // Don't reset game active state for tab - modal should stay open
        // But close modal since we're opening in new tab
        setShouldShowGameModal(false);
        selectedGameId = null;
        selectedGameType = null;
        selectedGameLauncher = null;
        selectedGameName = null;
        selectedGameImg = null;
        setGameUrl("");
      } else {
        setGameUrl(result.url);
        setShouldShowGameModal(true);
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

    try {
      const el = document.getElementsByClassName("game-view-container")[0];
      if (el) {
        el.classList.add("d-none");
        el.classList.remove("fullscreen");
        el.classList.remove("with-background");
      }
      const iframeWrapper = document.getElementById("game-window-iframe");
      if (iframeWrapper) iframeWrapper.classList.add("d-none");
    } catch (err) {
      // ignore DOM errors
    }
    try {
      getPage("casino");
    } catch (e) { }
  };

  const handleProviderSelect = (provider, index = 0) => {
    setIsSearchView(false);
    setSearchLabel("");
    setSelectedProvider(provider);
    setTxtSearch("");

    if (categories.length > 0 && provider) {
      setActiveCategory(provider);
      fetchContent(provider, provider.id, provider.table_name, index, true);
    } else if (!provider && categories.length > 0) {
      const firstCategory = categories[0];
      setActiveCategory(firstCategory);
      fetchContent(
        firstCategory,
        firstCategory.id,
        firstCategory.table_name,
        0,
        true,
      );
    }
  };

  const handleCategorySelect = (category) => {
    setIsSearchView(false);
    setSearchLabel("");
    setActiveCategory(category);
    setSelectedProvider(null);
    setTxtSearch("");

    if (category.code === "home") {
      setIsSingleCategoryView(false);
      setActiveCategory(category);
      setGames([]);
    }
  };

  const handleSearchClear = () => {
    setTxtSearch("");
    setSearchLabel("");
    setGames([]);
    setIsSearchView(false);
    setIsLoadingGames(false);
  };

  const search = (e) => {
    let keyword = e.target.value;
    setTxtSearch(keyword);

    if (
      navigator.userAgent.match(
        /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i,
      )
    ) {
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
      setIsSearchView(false);
      setSearchLabel("");
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

  const configureImageSrc = (result) => {
    (result.content || []).forEach((element) => {
      element.imageDataSrc =
        element.image_local !== null
          ? contextData.cdnUrl + element.image_local
          : element.image_url;
    });
  };

  const callbackSearch = (result) => {
    if (result.status === 500 || result.status === 422) {
      // Handle error if needed
    } else {
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
    setSearchLabel(gameName);
    setTxtSearch("");
    setIsSearchView(true);
    setSelectedProvider(null);
    setGames([game]);
  };

  return (
    <>
      {shouldShowGameModal && selectedGameId !== null ? (
        <GameModal
          gameUrl={gameUrl}
          gameName={selectedGameName}
          gameImg={selectedGameImg}
          reload={(gameData) => {
            if (gameData && gameData.id) {
              const game = {
                id: gameData.id,
                name: selectedGameName,
                image_local: selectedGameImg?.replace(contextData.cdnUrl, ""),
              };
              launchGame(game, selectedGameType, selectedGameLauncher);
            } else if (selectedGameId) {
              const game = {
                id: selectedGameId,
                name: selectedGameName,
                image_local: selectedGameImg?.replace(contextData.cdnUrl, ""),
              };
              launchGame(game, selectedGameType, selectedGameLauncher);
            }
          }}
          launchInNewTab={() => {
            if (selectedGameId) {
              const game = {
                id: selectedGameId,
                name: selectedGameName,
                image_local: selectedGameImg?.replace(contextData.cdnUrl, ""),
              };
              launchGame(game, selectedGameType, "modal");
            }
          }}
          ref={refGameModal}
          onClose={closeGameModal}
          isMobile={isMobile}
          gameId={selectedGameId}
          gameType={selectedGameType}
          gameLauncher={selectedGameLauncher}
        />
      ) : (
        <main className="index--page">
          {!selectedProvider && !isSearchView && <Slideshow />}

          <CategoryContainer
            categories={tags}
            selectedCategoryIndex={selectedCategoryIndex}
            onCategoryClick={(tag, _id, _table, index) => {
              if (window.location.hash !== `#${tag.code}`) {
                window.location.hash = `#${tag.code}`;
              } else {
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
              isSelectCategory={isSelectCategory}
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

          {isLobbyView && (
            <div className="index--container">
              {topGames.length > 0 && (
                <HotGameSlideshow
                  games={topGames}
                  name="games"
                  title="Juegos Populares"
                  onGameClick={(game) => {
                    if (isLogin) {
                      launchGame(game, "slot", "modal");
                    } else {
                      handleLoginClick();
                    }
                  }}
                />
              )}
              {topCasino.length > 0 && isSlotsOnly === "false" && (
                <HotGameSlideshow
                  games={topCasino}
                  name="casino"
                  title="Casino"
                  onGameClick={(game) => {
                    if (isLogin) {
                      launchGame(game, "slot", "modal");
                    } else {
                      handleLoginClick();
                    }
                  }}
                />
              )}
              {topLiveCasino.length > 0 && isSlotsOnly === "false" && (
                <HotGameSlideshow
                  games={topLiveCasino}
                  name="liveCasino"
                  title="Casino en Vivo"
                  onGameClick={(game) => {
                    if (isLogin) {
                      launchGame(game, "slot", "modal");
                    } else {
                      handleLoginClick();
                    }
                  }}
                />
              )}
              {topArcade.length > 0 && isSlotsOnly === "false" && (
                <HotGameSlideshow
                  games={topArcade}
                  name="arcade"
                  title="Crash Games"
                  onGameClick={(game) => {
                    if (isLogin) {
                      launchGame(game, "slot", "modal");
                    } else {
                      handleLoginClick();
                    }
                  }}
                />
              )}
            </div>
          )}

          {selectedProvider?.name || isSearchView || isSingleCategoryView ? (
            <div className="category--page">
              <div className="category--games">
                <div className="games-block-wrapper">
                  <h2 className="title title--aviatrix title--producers">
                    <a className="title__text">
                      {selectedProvider?.name || (isSearchView ? `Resultados: "${searchLabel}"` : activeCategory?.name)}
                    </a>
                    <a className="see-all" onClick={loadMoreGames}>
                      Ver más
                    </a>
                  </h2>

                  <div className="games-block">
                    {games.map((game) => (
                      <GameCard
                        key={"live-popular" + game.id}
                        id={game.id}
                        provider={activeCategory?.name || "Casino"}
                        title={game.name}
                        imageSrc={
                          game.image_local !== null
                            ? contextData.cdnUrl + game.image_local
                            : game.image_url
                        }
                        onGameClick={() =>
                          isLogin
                            ? launchGame(game, "slot", "modal")
                            : handleLoginClick()
                        }
                      />
                    ))}
                  </div>

                  {isLoadingGames && (
                    <div className="my-3">
                      <LoadApi />
                    </div>
                  )}

                  {!isSearchView && (
                    <button
                      onClick={loadMoreGames}
                      type="button"
                      className="button button--load-games"
                    >
                      <span className="button--load-games__text">
                        Mostrar más
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              {firstFiveCategoriesGames &&
                firstFiveCategoriesGames.map((entry, catIndex) => {
                  if (!entry || !entry.games) return null;

                  const categoryKey = entry.category?.id || `cat-${catIndex}`;
                  if (entry.games.length === 0) return null;

                  return (
                    <div className="index--container" key={categoryKey}>
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
            </>
          )}

          <ProviderContainer
            categories={categories}
            selectedProvider={selectedProvider}
            setSelectedProvider={setSelectedProvider}
            onProviderSelect={handleProviderSelect}
          />
        </main>
      )}
    </>
  );
};

export default Home;
