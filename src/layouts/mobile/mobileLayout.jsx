import { Outlet, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";
import FooterMainBar from "./FooterMainBar";

const MobileLayout = ({
  title = "App",
  showBackButton = true,
  showFooter = false,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      {/* HEADER */}
      <header className="relative flex items-center justify-between px-4 py-4 bg-green-500 text-white shadow-sm">
        <div className="w-8">
          {showBackButton && (
            <button onClick={handleBack}>
              <FontAwesomeIcon icon={faArrowLeftLong} />
            </button>
          )}
        </div>

        <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-medium">
          {title}
        </h1>

        <div className="w-8" />
      </header>

      {/* CONTENT */}
      <main className="flex-grow px-3 py-2 overflow-auto bg-white pb-16">
        <Outlet />
      </main>

      {/* FOOTER */}
      {showFooter && <FooterMainBar />}
    </div>
  );
};

export default MobileLayout;