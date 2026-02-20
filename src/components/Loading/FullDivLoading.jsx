import { useEffect } from "react";

const FullDivLoading = (props) => {
  useEffect(() => {
    const loadPage = document.getElementById("vue-loader");
    if (!loadPage) return;

    if (props.show === true) {
      loadPage.classList.remove("d-none");
    } else {
      loadPage.classList.add("d-none");
    }
  }, [props.show]);

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
  );
};

export default FullDivLoading;