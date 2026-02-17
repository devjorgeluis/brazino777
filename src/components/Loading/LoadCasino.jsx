const LoadApi = () => {
    return (
        <div className="modal-overlay">
            <div className="iframe-content">
                <div className="button-container">
                    <button className="icon-button">
                        <i className="fas fa-expand"></i>
                    </button>
                    <button className="icon-button">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div className="el-loading-mask" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <div className="el-loading-spinner">
                    <svg className="circular" viewBox="0 0 50 50"><circle className="path" cx="25" cy="25" r="20" fill="none"></circle></svg>
                </div>
            </div>
        </div>
    )
}

export default LoadApi;