import { useNavigate } from "react-router-dom";

export const useAuth = () => {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
    };

    return { logout };
};
