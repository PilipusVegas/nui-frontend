import { Navigate } from "react-router-dom";
import { getUserFromToken } from "../utils/jwtHelper";

const PrivateRoute = ({ children, allowedRoles, allowedCompanies }) => {
    const user = getUserFromToken();

    // Belum login / token habis
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Role tidak sesuai
    if (allowedRoles?.length > 0 && !allowedRoles.includes(String(user.id_role))) {
        return <Navigate to="/home" replace />;
    }


    // Perusahaan tidak sesuai
    if (
        allowedCompanies &&
        !allowedCompanies.includes(String(user.id_perusahaan))
    ) {
        return <Navigate to="/home" replace />;
    }

    return children;
};

export default PrivateRoute;
