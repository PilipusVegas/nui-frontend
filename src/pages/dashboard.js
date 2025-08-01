import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HomeMobile from "../layouts/homeMobile";
import HomeDesktop from "../layouts/homeDesktop";
import { getUserFromToken } from "../utils/jwtHelper";

const Home = ({ onLogout }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  useEffect(() => {
    const userData = getUserFromToken();
    if (!userData) {
      onLogout();
      navigate("/logout");
    } else {
      setUser({
        id: userData.id_user,
        username: userData.nama_user,
        roleId: userData.id_role,
        role: userData.role,
      });
    }
  }, [navigate, onLogout]);

  if (!user) return <div>Memuat...</div>;

  return [1, 4, 5, 6, 13, 20].includes(user.roleId) ? (
    <HomeDesktop username={user.username} roleId={user.roleId} handleLogout={onLogout}/>
  ) : (
    <HomeMobile username={user.username} roleId={user.roleId} handleLogout={onLogout}/>
  );
};

export default Home;
