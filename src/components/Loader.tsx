import logo from "../assets/svg/Gomisteria_LOADER_1.gif";
import "./Loader.scss";

const Loader = ({ isLoading }: any) => {
  return (
    <div className={`loader-overlay ${!isLoading ? "slide-up" : ""}`}>
      <img src={logo} alt="Loading..." className="loader-logo" />
    </div>
  );
};

export default Loader;
