import DekstopLayout from "../layouts/dekstop/DekstopLayout";
import { getUserFromToken } from "../utils/jwtHelper";
import { Navigate } from "react-router-dom";
import HomeDesktop from "../layouts/homeDesktop";
import HomeMobile from "../layouts/homeMobile";


const HomeRedirect = () => {
  const user = getUserFromToken();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const desktopRoles = [1, 4, 5, 6, 18, 20, 27, 28];

  return desktopRoles.includes(user.id_role) ? (
    <DekstopLayout>
      <HomeDesktop />
    </DekstopLayout>
  ) : (
    <HomeMobile />
  );
};

export default HomeRedirect;
