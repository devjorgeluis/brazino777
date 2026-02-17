import { useOutletContext, useNavigate } from "react-router-dom";
import ImgLogo from "/src/assets/img/logo.png";
import ImgJelguru from "/src/assets/svg/jelguru.svg";
import ImgGcbgreen from "/src/assets/img/gcb-green.png";
import Img18 from "/src/assets/img/age-more-18.png";

const Footer = () => {
    const navigate = useNavigate();
    const { isSlotsOnly } = useOutletContext();

    return (
        <footer>
            <div className="container">
                <div className="footer-head">
                    <div className="footer-head-item">
                        <div className="footer-head-item-body">
                            {isSlotsOnly === "false" ? (
                                <>
                                    <a onClick={() => navigate("/home")} className="a-link">
                                        Inicio
                                    </a>
                                    <a onClick={() => navigate("/casino")} className="a-link">
                                        Casino
                                    </a>
                                    <a onClick={() => navigate("/live-casino")} className="a-link">
                                        Casino en vivo
                                    </a>
                                    <a onClick={() => navigate("/sports")} className="a-link">
                                        Deportes
                                    </a>
                                    <a onClick={() => navigate("/live-sports")} className="a-link">
                                        Deportes en vivo
                                    </a>
                                </>
                            ) : (
                                <a onClick={() => navigate("/casino")} className="a-link">
                                    Casino
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <div className="footer-finish">
                    <div className="footer-finish-top">
                        <div className="footer-finish-top-left">
                            <img src={ImgLogo} className="footer-logo" alt="Logo" />
                        </div>

                        <div className="footer-finish-top-right">
                            <a
                                href="https://es.casino.guru/juega-en-linea-casino-resena"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <img src={ImgJelguru} alt="Casino Guru" className="svg" />
                            </a>

                            <a
                                href="https://cert.gcb.cw/certificate?id=ZXlKcGRpSTZJbkpXWjJNeUx6QmxNbTVrU1dZeGVrMVZVbmQxY0hjOVBTSXNJblpoYkhWbElqb2laamR2V1Vwak5scGplREkwTjJZd1ZFRktUa0ozWjBsc1VqVmtXVmRzZGpKSFIzQnBUMHRVU1RGSGF6MGlMQ0p0WVdNaU9pSTJNVFprTnpWbFl6YzRORE5qWVdVNU1qTXdaVEEzTjJWalpqTTNaR0ZtTkRFd1ltWTJOR1prTUdVMU56ZzFZelF6TlRNeE1HRTRPV1JoTlRreU5HSTVJaXdpZEdGbklqb2lJbjA9"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <img src={ImgGcbgreen} alt="GCB Certificate" />
                            </a>

                            <img src={Img18} alt="18+" className="contrast-none" />
                        </div>
                    </div>

                    <div className="footer-finish-body">
                        <div className="footer-finish-body-left">
                            <p>Juego solo para mayores de 18 años.</p>
                            <p>
                                Los juegos y las apuestas deportivas a distancia, si se realizan
                                en exceso, pueden causar ludopatía.
                            </p>
                        </div>

                        <div className="footer-finish-body-left">
                            <p>
                                Para registrarse en este sitio web, el usuario debe aceptar los
                                Términos y Condiciones Generales. En caso de que sean
                                actualizados, los usuarios existentes pueden optar por dejar de
                                utilizar los productos y servicios antes de que dicha
                                actualización entre en vigor, lo cual será como mínimo dos
                                semanas después de haber sido anunciada.
                            </p>
                        </div>

                        <div className="footer-finish-body-right">
                            <p>
                                Juegaenlinea.com is operated by Games &amp; More B.V., registered
                                under No. 149948 at Hanchi Snoa 19, Trias Building, Curaçao. This
                                website is licensed and regulated by GCB (Curacao Gaming Control
                                Board) under license No. OGL/2023/121/0086.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
