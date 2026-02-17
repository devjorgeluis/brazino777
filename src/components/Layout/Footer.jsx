import { useOutletContext, useNavigate } from "react-router-dom";
import ImgLogo from "/src/assets/img/logo.png";

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
            </div>
        </footer>
    );
};

export default Footer;
