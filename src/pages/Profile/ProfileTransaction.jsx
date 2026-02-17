import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { AppContext } from "../../AppContext";
import { callApi } from "../../utils/Utils";
import LoadApi from "../../components/Loading/LoadApi";
import ImgArrowLeft from "/src/assets/svg/arrow-left.svg";
import ImgDoubleArrowLeft from "/src/assets/svg/double-arrow-left.svg";
import ImgArrowRight from "/src/assets/svg/arrow-right.svg";
import ImgDoubleArrowRight from "/src/assets/svg/double-arrow-right.svg";

const ProfileTransaction = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { contextData } = useContext(AppContext);
    const { isMobile } = useOutletContext();

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        start: 0,
        length: 5,
        totalRecords: 0,
        currentPage: 1,
    });

    const formatDateDisplay = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "-";

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        return `${day}.${month}.${year}`;
    };

    const formatBalance = (value) => {
        const num = parseFloat(value);
        return num.toLocaleString('de-DE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const handlePageChange = (page) => {
        setPagination((prev) => ({
            ...prev,
            start: (page - 1) * prev.length,
            currentPage: page,
        }));
    };

    const fetchHistory = () => {
        setLoading(true);

        let queryParams = new URLSearchParams({
            start: pagination.start,
            length: pagination.length
        }).toString();

        let apiEndpoint = `/get-transactions?${queryParams}`;

        callApi(
            contextData,
            "GET",
            apiEndpoint,
            (response) => {
                if (response.status === "0" || response.status === 0) {
                    setTransactions(response.data || []);
                    setPagination((prev) => ({
                        ...prev,
                        totalRecords: response.recordsTotal || 0,
                    }));
                } else {
                    setTransactions([]);
                    console.error("API error:", response);
                }
                setLoading(false);
            },
            null
        );
    };

    useEffect(() => {
        if (!contextData?.session) {
            navigate("/");
        }
    }, [contextData?.session, navigate]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    useEffect(() => {
        fetchHistory();
    }, [pagination.start, pagination.length]);

    useEffect(() => {
        setPagination(prev => ({
            ...prev,
            start: 0,
            currentPage: 1
        }));
    }, []);

    const totalPages = Math.ceil(pagination.totalRecords / pagination.length);

    const getVisiblePages = () => {
        const delta = 1;
        const visiblePages = [];
        let startPage = Math.max(1, pagination.currentPage - delta);
        let endPage = Math.min(totalPages, pagination.currentPage + delta);

        if (endPage - startPage + 1 < 2 * delta + 1) {
            if (startPage === 1) {
                endPage = Math.min(totalPages, startPage + 2 * delta);
            } else {
                startPage = Math.max(1, endPage - 2 * delta);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            visiblePages.push(i);
        }

        return { visiblePages, startPage, endPage };
    };

    const { visiblePages } = getVisiblePages();

    const handleFirstPage = () => handlePageChange(1);
    const handlePrevPage = () => handlePageChange(Math.max(1, pagination.currentPage - 1));
    const handleNextPage = () => handlePageChange(Math.min(totalPages, pagination.currentPage + 1));
    const handleLastPage = () => handlePageChange(totalPages);

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const isFirstPage = pagination.currentPage === 1;
        const isLastPage = pagination.currentPage === totalPages;

        return (
            <nav className="p-paginator-bottom">
                <div className="p-paginator p-component">

                    {/* First */}
                    <button
                        className={`p-paginator-first p-paginator-element p-link ${isFirstPage ? "p-disabled" : ""}`}
                        onClick={handleFirstPage}
                        disabled={isFirstPage}
                    >
                        <img src={ImgDoubleArrowLeft} alt="First" />
                    </button>

                    {/* Prev */}
                    <button
                        className={`p-paginator-prev p-paginator-element p-link ${isFirstPage ? "p-disabled" : ""}`}
                        onClick={handlePrevPage}
                        disabled={isFirstPage}
                    >
                        <img src={ImgArrowLeft} alt="Previous" />
                    </button>

                    {/* Page numbers */}
                    <span className="p-paginator-pages">
                        {visiblePages.map((page) => (
                            <button
                                key={page}
                                className={`p-paginator-page p-paginator-element p-link ${pagination.currentPage === page ? "p-highlight" : ""
                                    }`}
                                onClick={() => handlePageChange(page)}
                            >
                                {page}
                            </button>
                        ))}
                    </span>

                    {/* Next */}
                    <button
                        className={`p-paginator-next p-paginator-element p-link ${isLastPage ? "p-disabled" : ""}`}
                        onClick={handleNextPage}
                        disabled={isLastPage}
                    >
                        <img src={ImgArrowRight} alt="Next" />
                    </button>

                    {/* Last */}
                    <button
                        className={`p-paginator-last p-paginator-element p-link ${isLastPage ? "p-disabled" : ""}`}
                        onClick={handleLastPage}
                        disabled={isLastPage}
                    >
                        <img src={ImgDoubleArrowRight} alt="Last" />
                    </button>
                </div>
            </nav>
        );
    };

    return (
        <>
            <h6 className="mb-4">Transacciones</h6>

            <div className="p-datatable p-component p-datatable-responsive-scroll p-datatable-sm table-art">

                <div className="p-datatable-wrapper">
                    {loading ? (
                        <div className="flex justify-center items-center mt-3">
                            <LoadApi />
                        </div>
                    ) : (
                        <>
                            {
                                transactions.length > 0 ?
                                    <table className="p-datatable-table">
                                        <thead className="p-datatable-thead" style={{ position: "sticky" }}>
                                            <tr>
                                                <th>
                                                    <div className="p-column-header-content">
                                                        <span className="p-column-title">Fecha</span>
                                                    </div>
                                                </th>
                                                <th>
                                                    <div className="p-column-header-content">
                                                        <span className="p-column-title">Monto</span>
                                                    </div>
                                                </th>
                                                <th>
                                                    <div className="p-column-header-content">
                                                        <span className="p-column-title">Balance Previo</span>
                                                    </div>
                                                </th>
                                                <th>
                                                    <div className="p-column-header-content">
                                                        <span className="p-column-title">Balance Posterior</span>
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="p-datatable-tbody">
                                            {
                                                transactions.map((transaction, index) => (
                                                    <tr key={index} className="p-row-even">
                                                        <td className={`${isMobile ? "td-mobile-mid" : ""}`}>
                                                            { isMobile && <span className="td-mobile-show td-text-opacity">Fecha <br/></span> }
                                                            {formatDateDisplay(transaction.created_at)}
                                                        </td>
                                                        <td className={`${isMobile ? "td-mobile-mid" : ""}`}>
                                                            { isMobile && <span className="td-mobile-show td-text-opacity">Monto <br/></span> }
                                                            {formatBalance(transaction.value || transaction.amount || 0)}
                                                        </td>
                                                        <td className={`${isMobile ? "td-mobile-mid" : ""}`}>
                                                            { isMobile && <span className="td-mobile-show td-text-opacity">Balance Previo <br/></span> }
                                                            {formatBalance(transaction.to_current_balance) || 0}
                                                        </td>
                                                        <td className={`${isMobile ? "td-mobile-mid" : ""}`}>
                                                            { isMobile && <span className="td-mobile-show td-text-opacity">Balance Posterior <br/></span> }
                                                            {formatBalance(transaction.to_new_balance) || 0}
                                                        </td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table> :
                                    <div className="void-message">
                                        Nada aquí, nada allá
                                        <div className="void-mini">
                                            Actualmente no tienes datos para mostrar
                                        </div>
                                    </div>
                            }

                            {transactions.length > 0 && totalPages > 1 && renderPagination()}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default ProfileTransaction;