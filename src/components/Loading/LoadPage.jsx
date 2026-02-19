const LoadPage = () => {
    return (
        <div id="vue-loader">
            <div className="loader-background loader loader-background--show">
                <div className="loader-ring">
                    <div className="loader-ring__light"></div>
                    <div className="loader-ring__track"></div>
                </div>
                <div className="loader-image"></div>
            </div>
        </div>
    )
}

export default LoadPage;