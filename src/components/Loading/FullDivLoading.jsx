import { useEffect } from "react";

const FullDivLoading = (props) => {
  useEffect(() => {
    const splashPage = document.getElementById("splash-page");
    if (!splashPage) return;

    if (props.show === true) {
      splashPage.classList.remove("d-none");
    } else {
      splashPage.classList.add("d-none");
    }
  }, [props.show]);

  return (
    <div id="splash-page" className="d-none">
      <div className="el-loading-mask" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
        <div className="el-loading-spinner">
          <svg className="circular" viewBox="-10, -10, 50, 50">
            <path className="path" d="
              M 30 15
              L 28 17
              M 25.61 25.61
              A 15 15, 0, 0, 1, 15 30
              A 15 15, 0, 1, 1, 27.99 7.5
              L 15 15
            " style={{ strokeWidth: 4, fill: "rgba(0, 0, 0, 0)" }}></path>
          </svg>
          <p className="el-loading-text">Por favor espera...</p>
        </div>
      </div>
    </div>
  );
};

export default FullDivLoading;