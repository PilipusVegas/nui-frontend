import { Outlet, useLocation, matchRoutes } from "react-router-dom";
import DekstopLayout from "../layouts/dekstop/DekstopLayout";
import HeaderMobile from "../layouts/mobile/HeaderMobile";
import { getUserFromToken } from "../utils/jwtHelper";
import { routes } from "../routes/routes.config";

const desktopRoles = [1, 4, 5, 6, 18, 20, 27, 28];

const RouteLayout = ({ layout = "none" }) => {
  const user = getUserFromToken();
  const isDesktopRole = desktopRoles.includes(Number(user?.id_role));
  const location = useLocation();

  const matches = matchRoutes(
    routes.map((r) => ({ path: r.path })),
    location
  );

  const currentPath = matches?.[matches.length - 1]?.route?.path;
  const currentRoute = routes.find((r) => r.path === currentPath);

  const mobileTitle = currentRoute?.mobileTitle || "App";
  const showMobileFooter = currentRoute?.showMobileFooter || false;
  const showBackButton = currentRoute?.showBackButton ?? true;

  const content = <Outlet />;

  if (layout === "desktop") {
    return (
      <DekstopLayout>
        {content}
      </DekstopLayout>
    );
  }

  if (layout === "mobile") {
    return (
      <HeaderMobile
        title={mobileTitle}
        showFooter={showMobileFooter}
        showBackButton={showBackButton}
      >
        {content}
      </HeaderMobile>
    );
  }

  if (layout === "auto") {
    return isDesktopRole ? (
      <DekstopLayout>
        {content}
      </DekstopLayout>
    ) : (
      <HeaderMobile
        title={mobileTitle}
        showFooter={showMobileFooter}
        showBackButton={showBackButton}
      >
        {content}
      </HeaderMobile>
    );
  }

  return content;
};

export default RouteLayout;