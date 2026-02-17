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
    <></>
  );
};

export default FullDivLoading;