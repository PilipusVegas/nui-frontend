import { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import Menu from "./pages/menu";
import Login from "./pages/login";
import Absen from "./pages/absensi";
import Lembur from "./pages/lembur";
import Profile from "./pages/profile";
import Dashboard from "./pages/dashboard";
import MenuSidebar from "./layouts/menuSidebar";
import Notification from "./pages/notification";
import DataLembur from "./pages/lembur/dataLembur";
import DataAbsensi from "./pages/absensi/dataAbsensi";
import DataRequest from "./pages/approval/dataRequest";
import DataKaryawan from "./pages/profile/dataKaryawan";
import DataApproval from "./pages/approval/dataApproval";
import DataPenggajian from "./pages/penggajian/dataPenggajian";
import DetailDataLembur from "./pages/lembur/detailDataLembur";

function App() {
  const handleLoginSuccess = () => {setIsLoggedIn(true)};
  const handleLogout = () => {localStorage.clear(); setIsLoggedIn(false)};

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const PrivateRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isLoggedIn ? <Navigate to="/home" /> : <Login onLoginSuccess={handleLoginSuccess} />}/>
        <Route path="/home" element={<PrivateRoute><Dashboard onLogout={handleLogout} /></PrivateRoute>} />
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
        }/>
        <Route path="/data-approval" element={
          <PrivateRoute>
            <div className="flex">
              <MenuSidebar handleLogout={handleLogout} roleId={localStorage.getItem("roleId")} />
              <div className="flex-grow p-6">
                <DataApproval />
              </div>
            </div>
          </PrivateRoute>
        }/>
        <Route path="/data-request" element={
          <PrivateRoute>
            <div className="flex">
              <MenuSidebar handleLogout={handleLogout} roleId={localStorage.getItem("roleId")} />
              <div className="flex-grow p-6">
                <DataRequest />
              </div>
            </div>
          </PrivateRoute>
        }/>
        <Route path="/data-absensi" element={
          <PrivateRoute>
            <div className="flex">
              <MenuSidebar handleLogout={handleLogout} roleId={localStorage.getItem("roleId")} />
              <div className="flex-grow p-6">
                <DataAbsensi />
              </div>
            </div>
          </PrivateRoute>
        }/>
        <Route path="/data-lembur" element={
          <PrivateRoute>
            <div className="flex">
              <MenuSidebar handleLogout={handleLogout} roleId={localStorage.getItem("roleId")}   />
              <div className="flex-grow p-6">
                <DataLembur />
              </div>
            </div>
          </PrivateRoute>
        }/>
        <Route path="/detail-data-lembur/:id_user" element={
          <PrivateRoute>
            <div className="flex">
              <MenuSidebar handleLogout={handleLogout} roleId={localStorage.getItem("roleId")} />
              <div className="flex-grow p-6">
                <DetailDataLembur />
              </div>
            </div>
          </PrivateRoute>
        }/>
        <Route path="/data-penggajian" element={
          <PrivateRoute>
            <div className="flex">
              <MenuSidebar handleLogout={handleLogout} roleId={localStorage.getItem("roleId")}   />
              <div className="flex-grow p-6">
                <DataPenggajian />
              </div>
            </div>
          </PrivateRoute>
        }/>
        <Route path="*" element={isLoggedIn ? <Navigate to="/home" /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;