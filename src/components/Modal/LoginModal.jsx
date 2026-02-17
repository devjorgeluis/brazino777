import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../AppContext";
import { callApi } from "../../utils/Utils";

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
    const { contextData, updateSession } = useContext(AppContext);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!username.trim() || !password.trim()) {
            setErrorMsg("Por favor completa ambos campos");
            return;
        }

        setIsLoading(true);
        setErrorMsg("");

        const body = {
            username,
            password,
            site_label: "main",
        };

        callApi(contextData, "POST", "/login/", callbackSubmitLogin, JSON.stringify(body));
    };

    const callbackSubmitLogin = (result) => {
        setIsLoading(false);

        if (result?.status === "success") {
            localStorage.setItem("session", JSON.stringify(result));
            updateSession(result);
            onLoginSuccess?.(result.user?.balance);
            setTimeout(() => {
                onClose();
            }, 800);
        }
        else if (result?.status === "country") {
            const message = result.message || "Restricción por país";
            setErrorMsg(message);
            showErrorNotification(message);
        }
        else {
            const message = "Credenciales inválidas";
            setErrorMsg(message);
            showErrorNotification(message);
        }
    };

    const showErrorNotification = (message) => {
        setNotificationMessage(message);
        setShowNotification(true);

        setTimeout(() => {
            setShowNotification(false);
        }, 3000);
    };

    const hideNotification = () => {
        setShowNotification(false);
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    useEffect(() => {
        const passwordInput = document.getElementById("password-input");
        if (passwordInput) {
            passwordInput.type = showPassword ? "text" : "password";
        }
    }, [showPassword]);

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-backdrop fade show"></div>

            <div
                className="modal fade show"
                id="modalLogin"
                tabIndex="-1"
                aria-labelledby="modalLoginLabel"
                aria-modal="true"
                role="dialog"
                style={{ display: "block" }}
            >
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-body">
                            <div className="modal-auth">
                                <div className="modal-auth-content">
                                    <button
                                        type="button"
                                        className="btn-close"
                                        aria-label="Close"
                                        onClick={onClose}
                                    >
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>

                                    <div className="modal-auth-form mt-4">
                                        <ul className="nav nav-tabs" role="tablist">
                                            <li className="nav-item" role="presentation">
                                                <button
                                                    className="btn nav-link active"
                                                    id="login-tab"
                                                    data-bs-toggle="tab"
                                                    data-bs-target="#login-tab-pane"
                                                    type="button"
                                                    role="tab"
                                                    aria-selected="true"
                                                >
                                                    <span>Ingresar</span>
                                                </button>
                                            </li>
                                        </ul>

                                        <div className="tab-content" id="tabAuth">
                                            <form
                                                className="tab-pane active show"
                                                id="login-tab-pane"
                                                role="tabpanel"
                                                onSubmit={handleSubmit}
                                            >
                                                <div className="modal-auth-form-title mb-2">Usuario</div>
                                                <div className="input-group mb-3">
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        placeholder="Usuario"
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        autoFocus
                                                        disabled={isLoading}
                                                    />
                                                </div>

                                                <div className="modal-auth-form-title mb-2">Contraseña</div>
                                                <div className="input-group input-group-password mb-4">
                                                    <input
                                                        id="password-input"
                                                        className="form-control"
                                                        type="password"
                                                        placeholder="Contraseña"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        disabled={isLoading}
                                                    />
                                                    <span
                                                        className="input-toggle-password"
                                                        onClick={togglePasswordVisibility}
                                                        style={{ cursor: "pointer" }}
                                                    >
                                                        <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                                    </span>
                                                </div>

                                                <div className="d-grid gap-2">
                                                    <button
                                                        className="btn btn-theme"
                                                        type="submit"
                                                        disabled={isLoading}
                                                    >
                                                        {isLoading ? (
                                                            <>
                                                                <i className="pi pi-spin pi-spinner me-2"></i>
                                                                Ingresando...
                                                            </>
                                                        ) : (
                                                            "Ingresar"
                                                        )}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showNotification && (
                <div id="notification_2" className="el-notification right" role="alert">
                    <i className="el-icon el-notification__icon el-notification--error">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                            <path fill="currentColor" d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m0 393.664L407.936 353.6a38.4 38.4 0 1 0-54.336 54.336L457.664 512 353.6 616.064a38.4 38.4 0 1 0 54.336 54.336L512 566.336 616.064 670.4a38.4 38.4 0 1 0 54.336-54.336L566.336 512 670.4 407.936a38.4 38.4 0 1 0-54.336-54.336z"></path>
                        </svg>
                    </i>
                    <div className="el-notification__group">
                        <h2 className="el-notification__title">Error</h2>
                        <div className="el-notification__content">
                            <p>{notificationMessage}</p>
                        </div>
                        <i className="el-icon el-notification__closeBtn" onClick={hideNotification} style={{ cursor: "pointer" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                                <path fill="currentColor" d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z"></path>
                            </svg>
                        </i>
                    </div>
                </div>
            )}
        </>
    );
};

export default LoginModal;