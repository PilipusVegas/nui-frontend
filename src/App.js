import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import Menu from "./pages/menu";
import Login from "./pages/login";
import Salary from "./pages/salary";
import Absen from "./pages/absensi";
import Lembur from "./pages/lembur";
import Profile from "./pages/profile";
import MenuSidebar from "./layouts/menuSidebar";
import Notification from "./pages/notification";
import DataLembur from "./pages/lembur/dataLembur";
import DataAbsensi from "./pages/absensi/dataAbsensi";
import DataKaryawan from "./pages/profile/dataKaryawan";
import FormNicoUrbanIndonesia from "./pages/dashboard";
import DataApproval from "./pages/approval/dataApproval";
import DataRequest from "./pages/approval/dataRequest";

function App() {
  const handleLoginSuccess = () => {setIsLoggedIn(true)};
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const PrivateRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/login" />;
  };
  
  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isLoggedIn ? <Navigate to="/home" /> : <Login onLoginSuccess={handleLoginSuccess} />}/>
        <Route path="/home" element={<PrivateRoute><FormNicoUrbanIndonesia onLogout={handleLogout} /></PrivateRoute>} />
        <Route path="/notification" element={<PrivateRoute><Notification /></PrivateRoute>}/>
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/menu" element={<PrivateRoute><Menu /></PrivateRoute>}/>
        <Route path="/absensi" element={<PrivateRoute><Absen/></PrivateRoute>}/>
        <Route path="/lembur" element={<PrivateRoute><Lembur /></PrivateRoute>} />

        <Route path="/data-karyawan" element={
            <PrivateRoute>
              <div className="flex">
                <MenuSidebar handleLogout={handleLogout} roleId={localStorage.getItem("roleId")} />
                <div className="flex-grow p-6">
                  <DataKaryawan />
                </div>
              </div>
            </PrivateRoute>
          }
        />
          <Route path="/data-approval" element={
            <PrivateRoute>
              <div className="flex">
                <MenuSidebar handleLogout={handleLogout} roleId={localStorage.getItem("roleId")} />
                <div className="flex-grow p-6">
                  <DataApproval />
                </div>
              </div>
            </PrivateRoute>
          }
        />
        <Route path="/data-request" element={
            <PrivateRoute>
              <div className="flex">
                <MenuSidebar handleLogout={handleLogout} roleId={localStorage.getItem("roleId")} />
                <div className="flex-grow p-6">
                  <DataRequest />
                </div>
              </div>
            </PrivateRoute>
          }
        />
        <Route path="/data-absensi" element={
            <PrivateRoute>
              <div className="flex">
                <MenuSidebar handleLogout={handleLogout} roleId={localStorage.getItem("roleId")} />
                <div className="flex-grow p-6">
                  <DataAbsensi />
                </div>
              </div>
            </PrivateRoute>
          }
        />
        <Route path="/data-lembur" element={
            <PrivateRoute>
              <div className="flex">
                <MenuSidebar handleLogout={handleLogout} roleId={localStorage.getItem("roleId")}   />
                <div className="flex-grow p-6">
                  <DataLembur />
                </div>
              </div>
            </PrivateRoute>
          }
        />
        <Route path="/salary" element={
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
