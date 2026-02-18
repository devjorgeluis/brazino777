import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../AppContext";
import { callApi } from "../utils/Utils";

const Login = () => {
    const { contextData, updateSession } = useContext(AppContext);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = () => {
        setIsLoading(true);
        setErrorMsg("");

        let body = {
            username: username,
            password: password,
            site_label: "main",
        };

        callApi(
            contextData,
            "POST",
            "/login/",
            callbackSubmitLogin,
            JSON.stringify(body)
        );
    };

    const callbackSubmitLogin = (result) => {
        setIsLoading(false);
        if (result.status === "success") {
            localStorage.setItem("session", JSON.stringify(result));
            updateSession(result);

            setTimeout(() => {
                navigate("/");
            }, 1000);
        } else if (result.status === "country") {
            setErrorMsg(result.message);
        } else {
            setErrorMsg("Nombre de usuario y contraseña no válidos");
        }
    };

    useEffect(() => {
        const passwordInput = document.getElementById("password");
        if (passwordInput) {
            passwordInput.setAttribute("type", showPassword ? "text" : "password");
        }
    }, [showPassword]);

    return (
        <main className="login--page">
            <div id="vue-login-form-block">
                <h1>Entrar y jugar</h1>
                <form className="form form--login">
                    <section className="form__inputs">
                        <div className="input input--username">
                            <label htmlFor="username">
                                <span className="label-text">Nombre de usuario</span>
                                <input
                                    placeholder="Nombre de usuario"
                                    autoComplete="username"
                                    type="text"
                                    name="username"
                                    id="username"
                                    aria-required="true"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={isLoading}
                                />
                            </label>
                        </div>
                        <div className="input input--password">
                            <label htmlFor="password">
                                <span className="label-text">Contraseña</span>
                                <input
                                    placeholder="Contraseña"
                                    autoComplete="current-password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    id="password"
                                    aria-required="true"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                                <span
                                    className={`show-hide-password ${showPassword ? "show-hide-password--show" : ""}`}
                                    onClick={() => setShowPassword(!showPassword)}
                                ></span>
                            </label>
                        </div>
                        <span></span>
                        <section className={`form__submit ${errorMsg ? "form__submit--error" : ""}`}>
                            {errorMsg && <span className="error-message">{errorMsg}</span>}
                            <button type="button" className="button button--submit-form" onClick={() => handleSubmit()}>Entrar</button>
                        </section>
                    </section>
                </form>
            </div>
        </main>
    );
};

export default Login;