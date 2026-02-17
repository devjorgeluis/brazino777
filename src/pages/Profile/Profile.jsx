import { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../../AppContext";
import Footer from "../../components/Layout/Footer";
import ProfileHistory from "./ProfileHistory";
import ProfileTransaction from "./ProfileTransaction";

import ImgBalance from "/src/assets/svg/balance.svg";
import ImgCamera from "/src/assets/img/camera-white.png";
import ImgAvatar from "/src/assets/img/default-avatar.png";

const Profile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { contextData } = useContext(AppContext);

    const [activeMainTab, setActiveMainTab] = useState("profile");
    const [activeRecordTab, setActiveRecordTab] = useState("transactions");

    useEffect(() => {
        if (!contextData?.session) {
            navigate("/");
        }
    }, [contextData?.session, navigate]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    useEffect(() => {
        const hash = location.hash.replace('#', '');
        
        if (hash === 'transaction' || hash === 'transactions') {
            setActiveMainTab("record");
            setActiveRecordTab("transactions");
        } else if (hash === 'history') {
            setActiveMainTab("record");
            setActiveRecordTab("history");
        } else {
            setActiveMainTab("profile");
        }
    }, [location.hash]);

    const TabButton = ({ active, onClick, icon, label }) => {
        return (
            <button
                type="button"
                className={`nav-link ${active ? "active" : ""}`}
                onClick={onClick}
            >
                {icon ? <i className={icon}></i> : null}
                <span className="name">{label}</span>
            </button>
        );
    };

    const formatBalance = (value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return "0.00";
        return num.toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    return (
        <>
            <div className="jel-wallet">
                <div className="container">
                    <div className="jel-wallet-header">
                        <div className="jel-wallet-header-top">
                            <div className="jel-wallet-header-user">
                                <div className="figure avatar-wrapper-panel">
                                    <div className="personal-image">
                                        <label className="label">
                                            <input
                                                type="file"
                                                accept="image/jpg, image/jpeg, image/png, image/gif"
                                            />

                                            <figure className="personal-figure">
                                                <img
                                                    src={contextData?.session?.user?.profile_image || ImgAvatar}
                                                    className="personal-avatar"
                                                    alt="avatar"
                                                />
                                                <figcaption className="personal-figcaption">
                                                    <img
                                                        src={ImgCamera}
                                                        alt="camera"
                                                    />
                                                </figcaption>
                                            </figure>
                                        </label>
                                    </div>

                                    <div className="name">{contextData?.session?.user?.username}</div>
                                    <div className="mail">{contextData?.session?.user?.id}</div>
                                </div>
                            </div>

                            <div className="jel-wallet-header-amounts">
                                <div className="jel-wallet-header-amount">
                                    <div className="jel-wallet-header-amount-ex">
                                        <div className="icon">
                                            <img src={ImgBalance} width="40" />
                                        </div>
                                        <div className="name">Saldo</div>
                                        <div className="amount">${formatBalance(contextData?.session?.user?.balance || 0)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="jel-wallet-body">
                        <div className="jel-wallet-body-header">
                            <ul className="nav nav-tabs nav-tabs-primary" role="tablist">
                                <li className="nav-item">
                                    <TabButton
                                        active={activeMainTab === "profile"}
                                        onClick={() => setActiveMainTab("profile")}
                                        icon="fa-solid fa-user-shield"
                                        label="Perfil"
                                    />
                                </li>

                                <li className="nav-item">
                                    <TabButton
                                        active={activeMainTab === "record"}
                                        onClick={() => setActiveMainTab("record")}
                                        icon="fa-solid fa-money-bill-transfer"
                                        label="Historial"
                                    />
                                </li>
                            </ul>

                            <div className="tab-content tab-content-primary">
                                {activeMainTab === "profile" && (
                                    <div className="tab-pane fade show active">
                                        <div className="tap-pane-ex">
                                            <div className="nav-tabs-ex-mobile">
                                                <ul className="nav nav-tabs nav-tabs-ex" role="tablist">
                                                    <li className="nav-item">
                                                        <button
                                                            type="button"
                                                            className="nav-link active"
                                                        >
                                                            Mis datos
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>

                                            <div className="tab-content tab-content-ex">
                                                <div className="tab-pane fade show active">
                                                    <form className="row" noValidate>
                                                        <h6 className="mb-4">Información personal</h6>

                                                        <div className="col-md-6">
                                                            <div className="mb-3">
                                                                <label htmlFor="username" className="form-label">
                                                                    Usuario
                                                                </label>
                                                                <input
                                                                    id="username"
                                                                    type="text"
                                                                    className="form-control disabled"
                                                                    disabled
                                                                    readOnly
                                                                    value={contextData?.session?.user?.username}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="col-md-6">
                                                            <div className="mb-3">
                                                                <label htmlFor="email" className="form-label">
                                                                    Correo electrónico
                                                                </label>
                                                                <input
                                                                    id="email"
                                                                    type="email"
                                                                    className="form-control disabled"
                                                                    disabled
                                                                    readOnly
                                                                    value={contextData?.session?.user?.email || "-"}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="col-md-6">
                                                            <div className="mb-3">
                                                                <label htmlFor="firstname" className="form-label">
                                                                    Nombres
                                                                </label>
                                                                <input
                                                                    id="firstname"
                                                                    type="text"
                                                                    className="form-control disabled"
                                                                    disabled
                                                                    readOnly
                                                                    value={contextData?.session?.user?.first_name || "-"}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="col-md-6">
                                                            <div className="mb-3">
                                                                <label htmlFor="lastname" className="form-label">
                                                                    Apellidos
                                                                </label>
                                                                <input
                                                                    id="lastname"
                                                                    type="text"
                                                                    className="form-control disabled"
                                                                    disabled
                                                                    readOnly
                                                                    value={contextData?.session?.user?.last_name || "-"}
                                                                />
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ===================== RECORD ===================== */}
                                {activeMainTab === "record" && (
                                    <div className="tab-pane fade show active">
                                        <div className="tap-pane-ex">
                                            <div className="nav-tabs-ex-mobile">
                                                <ul className="nav nav-tabs nav-tabs-ex" role="tablist">
                                                    <li className="nav-item">
                                                        <button
                                                            type="button"
                                                            className={`nav-link ${activeRecordTab === "transactions" ? "active" : ""
                                                                }`}
                                                            onClick={() => setActiveRecordTab("transactions")}
                                                        >
                                                            Transacciones
                                                        </button>
                                                    </li>

                                                    <li className="nav-item">
                                                        <button
                                                            type="button"
                                                            className={`nav-link ${activeRecordTab === "history" ? "active" : ""
                                                                }`}
                                                            onClick={() => setActiveRecordTab("history")}
                                                        >
                                                            Historial del Juego
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>

                                            <div className="tab-content tab-content-ex">
                                                {activeRecordTab === "transactions" && (
                                                    <div className="tab-pane fade show active">
                                                        <ProfileTransaction />
                                                    </div>
                                                )}

                                                {activeRecordTab === "history" && (
                                                    <div className="tab-pane fade show active">
                                                        <ProfileHistory />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default Profile;