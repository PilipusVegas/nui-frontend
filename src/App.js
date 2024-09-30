import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import Menu from "./pages/menu";
import Login from "./pages/login";
import Salary from "./pages/salary";
import Absen from "./pages/absensi";
import Lembur from "./pages/lembur";
import Profile from "./pages/profile";
import MenuSidebar from "./pages/menuSidebar";
import Notification from "./pages/notification";
import DataKaryawan from "./pages/profile/dataKaryawan";
import FormNicoUrbanIndonesia from "./pages/formNicoUrbanIndonesia";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const handleLoginSuccess = () => {setIsLoggedIn(true)};

  const PrivateRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/login" />;
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
  };

  useEffect(() => {
    const loggedInStatus = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedInStatus);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isLoggedIn ? <Navigate to="/home" /> : <Login onLoginSuccess={handleLoginSuccess} />}/>
        <Route
          path="/home"
          element={<PrivateRoute><FormNicoUrbanIndonesia onLogout={handleLogout} /></PrivateRoute>}
        />
        <Route
          path="/notification"
          element={<PrivateRoute><Notification /></PrivateRoute>}
        />
        <Route
          path="/profile"
          element={<PrivateRoute><Profile /></PrivateRoute>}
        />
        <Route
          path="/data-karyawan"
          element={<PrivateRoute><DataKaryawan /></PrivateRoute>}
        />
        <Route
          path="/menu"
          element={<PrivateRoute><Menu /></PrivateRoute>}
        />
        <Route
          path="/absensi"
          element={<PrivateRoute><Absen /></PrivateRoute>}
        />
        <Route
          path="/lembur"
          element={<PrivateRoute><Lembur /></PrivateRoute>}
        />
        <Route
          path="/salary"
          element={
            <PrivateRoute>
              <div className="flex">
                <MenuSidebar handleLogout={handleLogout} />
                <div className="flex-grow p-6"><Salary /></div>
              </div>
            </PrivateRoute>
          }
        />
        <Route path="*" element={isLoggedIn ? <Navigate to="/home" /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
