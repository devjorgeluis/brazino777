import { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { AppContext } from "../../AppContext";
import { LayoutContext } from "../../components/Layout/LayoutContext";
import ImgDefaultUser from "/src/assets/svg/general-avatar.svg";

const HASH_SECTION_MAP = {
    "#info": 1,
};

const Profile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { contextData } = useContext(AppContext);
    const { handleLogoutClick } = useContext(LayoutContext);
    const { isMobile } = useOutletContext();
    const [activeSection, setActiveSection] = useState(0);

    useEffect(() => {
        if (!contextData?.session) {
            navigate("/");
        }
    }, [contextData?.session, navigate]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    useEffect(() => {
        const section = HASH_SECTION_MAP[location.hash] ?? 0;
        setActiveSection(section);
    }, [location.hash]);

    const handleNavClick = (e, hash, sectionId) => {
        e.preventDefault();
        navigate(`/profile${hash}`);
        setActiveSection(sectionId);
    };

    const handleGoBack = () => {
        navigate("/profile");
    };

    const formatBalance = (value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return "0.00";
        return num.toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return "";
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return "";
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    };

    // On mobile: show nav only when no section is active, show content only when a section is active
    // On desktop: always show both
    const showNav = !isMobile || activeSection === 0;
    const showContent = !isMobile || activeSection !== 0;

    return (
        <>
            <main className="profile--page">
                <div className="profile--outer_wrapper">

                    {showNav && (
                        <section className="profile-page__navigation-menu">
                            <div className="navigation-menu__image">
                                <div className="user-image">
                                    <img
                                        id="user-image"
                                        className="user__avatar"
                                        src={contextData?.session?.user?.profile_image || ImgDefaultUser}
                                        alt="avatar image"
                                    />
                                </div>
                                <div className="register-date">
                                    <p className="username">{contextData?.session?.user?.username}</p>
                                    <p className="date">
                                        Fecha de registro : &nbsp;<span>{formatDate(contextData?.session?.user?.created_at)}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="navigation-menu__deposit">
                                <div className="vue-balances" id="vue-balances-profile">
                                    <div className="balance">
                                        <span>Saldo de juego</span>
                                        <div className="balance_wrapper">
                                            <span className="user_main_currency">$</span>
                                            <span className="user_main_balance">{formatBalance(contextData?.session?.user?.balance)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="navigation-menu__links">
                                <a
                                    href="/profile#info"
                                    className={`menu-avatars ${activeSection === 1 ? "active" : ""}`}
                                    onClick={(e) => handleNavClick(e, "#info", 1)}
                                >
                                    <span>Mis datos</span>
                                </a>
                                <a
                                    className="logout"
                                    onClick={handleLogoutClick}
                                >
                                    <span>Salir</span>
                                </a>
                            </div>
                        </section>
                    )}

                    {showContent && (
                        <section className="profile-page__content-wrapper">
                            {activeSection === 1 && (
                                <article className="profile-page__content verification profile-page__content--active">
                                    <span className="go-back" onClick={handleGoBack}>Atrás</span>
                                    <div id="vue-confirm-email-form-block">
                                        <div className="verification__wrapper">
                                            <section className="main__contact_wrapper">
                                                <div className="verification__block verification__block--email verification__block--verified">
                                                    <div className="header_wrapper">
                                                        <h2 className="profile__section_heading">Email</h2>
                                                        <div className="main_contact_message">Contacto general</div>
                                                    </div>
                                                    <div id="vue-confirm-email-form-block">
                                                        <div className="verification-wrapper">
                                                            <form method="post" className="form" noValidate>
                                                                <div className="form__inputs">
                                                                    <div className="input-wrapper">
                                                                        <div className="input input--email input--active input--disabled">
                                                                            <label htmlFor="email">
                                                                                <span className="label-text">Correo electrónico</span>
                                                                                <input
                                                                                    type="email"
                                                                                    name="email"
                                                                                    autoComplete="false"
                                                                                    placeholder=""
                                                                                    value={contextData?.session?.user?.email}
                                                                                    disabled
                                                                                />
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </form>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="verification__block verification__block--username verification__block--email verification__block--verified">
                                                    <div className="header_wrapper">
                                                        <h2 className="profile__section_heading">Usuario</h2>
                                                        <div className="main_contact_message">Usuario</div>
                                                    </div>
                                                    <div id="vue-confirm-email-form-block">
                                                        <div className="verification-wrapper">
                                                            <form method="post" className="form" noValidate>
                                                                <div className="form__inputs">
                                                                    <div className="input-wrapper">
                                                                        <div className="input input--email input--active input--disabled">
                                                                            <label htmlFor="email">
                                                                                <span className="label-text">Usuario</span>
                                                                                <input
                                                                                    type="email"
                                                                                    name="email"
                                                                                    autoComplete="false"
                                                                                    placeholder=""
                                                                                    value={contextData?.session?.user?.username}
                                                                                    disabled
                                                                                />
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </form>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Phone Block */}
                                                <div className="verification__block verification__block--phone">
                                                    <div className="confirm-mobile-container">
                                                        <div className="profile__section_heading">Celular</div>
                                                        <p className="confirm-mobile-text"></p>
                                                        <form method="post" className="form" noValidate>
                                                            <div className="form__inputs">
                                                                <div className="input input--mobile input--active">
                                                                    <label htmlFor="mobile">
                                                                        <span className="label-text">Celular </span>
                                                                        <div className="vue-tel-input">
                                                                            <div className="vti__dropdown">
                                                                                <span className="vti__selection">
                                                                                    <span className="vti__flag ar"></span>
                                                                                    <span className="vti__dropdown-arrow">▼</span>
                                                                                </span>
                                                                            </div>
                                                                            <input
                                                                                type="tel"
                                                                                autoComplete="mobile"
                                                                                className="vti__input"
                                                                                name="mobile"
                                                                                placeholder="+54"
                                                                                value={contextData?.session?.user?.phone}
                                                                                disabled
                                                                            />
                                                                        </div>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                    </div>
                                </article>
                            )}
                        </section>
                    )}

                </div>
            </main>
        </>
    );
};

export default Profile;