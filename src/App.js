import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/login";
import FormNicoUrbanIndonesia from "./pages/formNicoUrbanIndonesia";
import Notification from "./pages/notification";
import Absensi from "./pages/absensi";
import MenuSidebar from "./pages/menuSidebar";
import Profile from "./pages/profile";
import DataKaryawan from "./pages/profile/dataKaryawan"; // Import DataKaryawan component
import Menu from "./pages/menu";
import Salary from "./pages/salary";
import { useEffect, useState } from "react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedInStatus = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedInStatus);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const PrivateRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/home" /> : <Login onLoginSuccess={handleLoginSuccess} />}
        />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <FormNicoUrbanIndonesia onLogout={handleLogout} />
            </PrivateRoute>
          }
        />
        <Route
          path="/notification"
          element={
            <PrivateRoute>
              <Notification />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/data-karyawan"
          element={
            <PrivateRoute>
              <DataKaryawan />
            </PrivateRoute>
          }
        />
        <Route
          path="/menu"
          element={
            <PrivateRoute>
              <Menu />
            </PrivateRoute>
          }
        />
        <Route
          path="/absensi"
          element={
            <PrivateRoute>
              <Absensi />
            </PrivateRoute>
          }
        />
        <Route
          path="/salary"
          element={
            <PrivateRoute>
              <div className="flex">
                <MenuSidebar handleLogout={handleLogout} />
                <div className="flex-grow p-6">
                  <Salary />
                </div>
              </div>
            </PrivateRoute>
          }
        />
        {/* Redirect to home or login based on login status */}
        <Route path="*" element={isLoggedIn ? <Navigate to="/home" /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
