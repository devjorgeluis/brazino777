import { useNavigate } from "react-router-dom";

const Footer = ({ isSlotsOnly }) => {
    const navigate = useNavigate();
    return (
        <footer>
            <div className="footer--container">
                <nav className="footer-content_nav">
                    <section>
                        <h2 className="footer-content_nav-title">Brazino 777</h2>
                        {isSlotsOnly === "false" ? (
                            <>
                                <a onClick={() => navigate("/casino")}>
                                    Casino
                                </a>
                                <a onClick={() => navigate("/live-casino")}>
                                    Casino en vivo
                                </a>
                                <a onClick={() => navigate("/sports")}>
                                    Deportes
                                </a>
                                <a onClick={() => navigate("/live-sports")}>
                                    Deportes en vivo
                                </a>
                            </>
                        ) : (
                            <a onClick={() => navigate("/casino")}>
                                Casino
                            </a>
                        )}
                    </section>
                </nav>
                <div className="footer-logos">
                    <p className="footer_license-text">
                        brazino777.com es propiedad y está operado por Astral Limited, número de registro: 15799, con domicilio
                        registrado en Hamchako, Mutsamudu, Isla Autónoma de Anjouan, Unión de Comoras. Contáctenos en
                        support@brazino777.com. brazino777.com está autorizado y regulado por el Gobierno de la Isla Autónoma de
                        Anjouan, Unión de Comoras, y opera bajo la Licencia N.º ALSI-202410045-F12. brazino777.com ha cumplido
                        con todas las normativas de conformidad y está legalmente autorizado para llevar a cabo operaciones de
                        juegos de azar y apuestas en cualquiera de sus modalidades.
                    </p>
                </div>
                <div className="footer-copyright"><p>© 2026 Todos los derechos reservados</p></div>
            </div>
        </footer>
    );
};

export default Footer;
