import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong, faHeadset } from "@fortawesome/free-solid-svg-icons";

import FooterMainBar from "./FooterMainBar";

const HeaderMobile = ({
  title = "App",
  showBackButton = true,
  showFooter = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/home");
    }
  };

  const handleWhatsApp = () => {
    const currentPath = location.pathname || "/home";
    const featureName =
      currentPath
        .replace(/^\/+/, "") // hapus slash di depan
        .replace(/-/g, " ") // ubah dash jadi spasi
        .replace(/\b\w/g, (c) => c.toUpperCase()) // capitalize
        .trim() || "Home";
    const message = encodeURIComponent(
      `Halo Admin

Saya sedang berada di halaman:
${featureName}.

Saya ingin meminta bantuan terkait fitur ini.

Mohon arahan atau informasinya. Terima kasih.`,
    );

    window.open(`https://wa.me/6287788377420?text=${message}`, "_blank");
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* HEADER */}
      <header
        className="
          sticky top-0 z-50
          bg-white/95
          backdrop-blur-xl
          border-b border-[#e7ece9]
        "
      >
        <div className="flex items-center justify-between h-[48px] px-2.5">
          {/* LEFT */}
          <div className="w-[52px] flex items-center">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="
                  group
                  flex items-center justify-center
                  w-8 h-8
                  rounded-full
                  transition-all duration-200
                  hover:bg-green-600
                  active:scale-95
                "
              >
                <FontAwesomeIcon
                  icon={faArrowLeftLong}
                  className="
                    text-[16px]
                    text-green-600
                    group-hover:text-white
                    transition-all duration-200
                  "
                />
              </button>
            )}
          </div>

          {/* CENTER */}
          <div className="flex-1 min-w-0 flex justify-center px-2">
            <div className="relative w-full flex justify-center overflow-hidden">
              <h1
                className="
                  max-w-full
                  text-center
                  text-[15px]
                  font-semibold
                  tracking-tight
                  text-[#1e293b]
                  whitespace-nowrap
                  overflow-hidden
                  text-ellipsis
                "
                title={title}
              >
                {title}
              </h1>
            </div>
          </div>

          {/* RIGHT */}
          <div className="w-[52px] flex justify-end">
            <button
              onClick={handleWhatsApp}
              className="
                group
                flex items-center justify-center
                w-8 h-8
                rounded-full
                transition-all duration-200
                hover:bg-green-600
                active:scale-95
              "
            >
              <FontAwesomeIcon
                icon={faHeadset}
                className="
                  text-[16px]
                  text-green-600
                  group-hover:text-white
                  transition-all duration-200
                "
              />
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="min-h-full p-3">
          <Outlet />
        </div>
      </main>

      {/* FOOTER */}
      {showFooter && <FooterMainBar />}
    </div>
  );
};

export default HeaderMobile;
