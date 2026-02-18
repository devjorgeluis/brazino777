import { useContext, useState, useEffect, useRef } from "react";
import { useOutletContext, useLocation } from "react-router-dom";
import { AppContext } from "../AppContext";
import { NavigationContext } from "../components/Layout/NavigationContext";
import { LayoutContext } from "../components/Layout/LayoutContext";
import { callApi } from "../utils/Utils";
import Footer from "../components/Layout/Footer";
import Slideshow from "../components/Home/Slideshow";
import HotGameSlideshow from "../components/Home/HotGameSlideshow";
import CategoryContainer from "../components/CategoryContainer";
import ProviderContainer from "../components/ProviderContainer";
import ProviderSelect from "../components/ProviderSelect";
import GameModal from "../components/Modal/GameModal";
import LoginModal from "../components/Modal/LoginModal";
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

const Home = () => {
  const { contextData } = useContext(AppContext);
  const { setShowFullDivLoading } = useContext(NavigationContext);
  const [txtSearch, setTxtSearch] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [topGames, setTopGames] = useState([]);
  const [topArcade, setTopArcade] = useState([]);
  const [topCasino, setTopCasino] = useState([]);
  const [topLiveCasino, setTopLiveCasino] = useState([]);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [tags, setTags] = useState([]);
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [activeCategory, setActiveCategory] = useState({});
  const [pageData, setPageData] = useState({});
  const [gameUrl, setGameUrl] = useState("");
  const [categoryType, setCategoryType] = useState("");
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [shouldShowGameModal, setShouldShowGameModal] = useState(false);
  const refGameModal = useRef();
  const pendingPageRef = useRef(new Set());
  const pendingCategoryFetchesRef = useRef(0);
  const lastProcessedPageRef = useRef({ page: null, ts: 0 });
  const { isSlotsOnly, isLogin, isMobile } = useOutletContext();
  const location = useLocation();
  const searchRef = useRef(null);
  const [searchDelayTimer, setSearchDelayTimer] = useState();

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const currentPath = window.location.pathname;
        if (currentPath === "/" || currentPath === "") {
          setShowFullDivLoading(true);
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

    getPage("home");
    getStatus();

    window.scrollTo(0, 0);
  }, [location.pathname]);

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

    setShowFullDivLoading(true);
    setCategories([]);
    setGames([]);

    callApi(
      contextData,
      "GET",
      "/get-page?page=" + page,
      (result) => callbackGetPage(result, page),
      null,
    );
  };

  const callbackGetPage = (result, page) => {
    pendingPageRef.current.delete(page);

    if (result.status === 500 || result.status === 422) {
      setShowFullDivLoading(false);
      return;
    }

    const now = Date.now();
    if (
      lastProcessedPageRef.current.page === page &&
      now - lastProcessedPageRef.current.ts < 3000
    ) {
      setShowFullDivLoading(false);
      return;
    }
    lastProcessedPageRef.current = { page, ts: now };

    setCategoryType(result.data?.page_group_type);
    setSelectedProvider(null);
    setPageData(result.data);

    if (
      result.data &&
      result.data.page_group_type === "categories" &&
      result.data.categories &&
      result.data.categories.length > 0
    ) {
      setCategories(result.data.categories);
      if (page === "home") {
        setMainCategories(result.data.categories);
      }

      const firstFiveCategories = result.data.categories.slice(0, 5);
      if (firstFiveCategories.length > 0) {
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
      setCategories(mainCategories.length > 0 ? mainCategories : []);
      configureImageSrc(result);
      pageCurrent = 1;
      setShowFullDivLoading(false);
    }

    setShowFullDivLoading(false);
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleLoginConfirm = () => {
    setShowLoginModal(false);
  };

  const fetchContent = (
    category,
    categoryId,
    tableName,
    categoryIndex,
    resetCurrentPage,
    pageGroupCode,
  ) => {
    let pageSize = 500;
    setIsLoadingGames(true);

    if (resetCurrentPage) {
      pageCurrent = 0;
      setGames([]);
    }

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
      setShowFullDivLoading(false);
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
    setShowFullDivLoading(false);
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
      setShowFullDivLoading(false);
    }
  };

  const launchGame = (game, type, launcher) => {
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
    setSelectedProvider(provider);
    setTxtSearch("");

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

    const search = (e) => {
        let keyword = e.target.value;
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

        if (keyword == "") {
            setGames([]);
            setIsLoadingGames(false);
            return;
        }

        setGames([]);
        setIsLoadingGames(true);

        let pageSize = 50;

        let searchDelayTimerTmp = setTimeout(function () {
            callApi(
                contextData,
                "GET",
                "/search-content?keyword=" + txtSearch + "&page_group_code=" + "default_pages_home" + "&length=" + pageSize,
                callbackSearch,
                null
            );
        }, 1000);

        setSearchDelayTimer(searchDelayTimerTmp);
    };

    const configureImageSrc = (result) => {
        (result.content || []).forEach((element) => {
            element.imageDataSrc = element.image_local !== null ? contextData.cdnUrl + element.image_local : element.image_url;
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


  return (
    <main className="index--page">
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onConfirm={handleLoginConfirm}
        />
      )}
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
              launchGame(game, selectedGameType, "tab");
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
        <>
          {!selectedProvider && (
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
                />
              </section>
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
            </>
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

export default Home;
