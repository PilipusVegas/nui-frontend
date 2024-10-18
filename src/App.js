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
import DetailDataLembur from "./pages/lembur/detailDataLembur";
import DataAbsensi from "./pages/absensi/dataAbsensi";
import DataKaryawan from "./pages/profile/dataKaryawan";
import DataApproval from "./pages/approval/dataApproval";
import DataPenggajian from "./pages/penggajian/dataPenggajian";
import DetailPenggajian from "./pages/penggajian/detailPenggajian"; 

function App() {
  const handleLoginSuccess = () => {setIsLoggedIn(true)};
  const handleLogout = () => {localStorage.clear(); setIsLoggedIn(false)};

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const checkRolePermission = (allowedRoles) => {
    const roleId = localStorage.getItem("roleId");
    return allowedRoles.includes(roleId);
  };

  const PrivateRoute = ({ children, allowedRoles }) => {
    if (!isLoggedIn) {
      return <Navigate to="/login" />;
    }
    
    if (!checkRolePermission(allowedRoles)) {
      return <Navigate to="/home" />; // Redirect to home if user doesn't have permission
    }

    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isLoggedIn ? <Navigate to="/home" /> : <Login onLoginSuccess={handleLoginSuccess} />}/>
        {/* Tampilan Mobile & Deskstop */}
        <Route path="/home" element={<PrivateRoute allowedRoles={["1","2", "3","4","5","6"]}><Dashboard onLogout={handleLogout} /></PrivateRoute>} />
        <Route path="/notification" element={<PrivateRoute allowedRoles={["1","2","3","4","5","6"]}><Notification /></PrivateRoute>}/>
        <Route path="/profile" element={<PrivateRoute allowedRoles={["1","2","3","4","5","6"]}><Profile /></PrivateRoute>} />
        <Route path="/menu" element={<PrivateRoute allowedRoles={["1","2","3","4","5","6"]}><Menu /></PrivateRoute>}/>
        <Route path="/absensi" element={<PrivateRoute allowedRoles={["1","2","3","4","5","6"]}><Absen/></PrivateRoute>}/>
        <Route path="/lembur" element={<PrivateRoute allowedRoles={["1","2","3","4","5","6"]}><Lembur /></PrivateRoute>} />


        {/* TAMPILAN DEKSTOP */}

        {/* ROLE 5 = PA */}
        <Route path="/data-approval" element={
          <PrivateRoute allowedRoles={["5"]}>
            <div className="flex">
              <MenuSidebar handleLogout={handleLogout} roleId={localStorage.getItem("roleId")} />
              <div className="flex-grow p-6">
                <DataApproval />
              </div>
            </div>
          </PrivateRoute>
        }/>

        {/* ROLE 4 = Manajer HRD */}
        <Route path="/data-absensi" element={
          <PrivateRoute allowedRoles={["4"]}>
            <div className="flex">
              <MenuSidebar handleLogout={handleLogout} roleId={localStorage.getItem("roleId")} />
              <div className="flex-grow p-6">
                <DataAbsensi />
              </div>
            </div>
          </PrivateRoute>
        }/>

        {/* <Route path="/data-lembur" element={
          <PrivateRoute allowedRoles={["1","2", "3","4","5","6"]}>
            <div className="flex">
              <MenuSidebar handleLogout={handleLogout} roleId={localStorage.getItem("roleId")}   />
              <div className="flex-grow p-6">
                <DataLembur />
              </div>
            </div>
          </PrivateRoute>
        }/> */}

        {/* <Route path="/detail-data-lembur/:id_user" element={
          <PrivateRoute allowedRoles={["1","2", "3","4","5","6"]}>
            <div className="flex">
              <MenuSidebar handleLogout={handleLogout} roleId={localStorage.getItem("roleId")} />
              <div className="flex-grow p-6">
                <DetailDataLembur />
              </div>
            </div>
          </PrivateRoute>
        }/> */}

          {/* ROLE 6 = Staff HRD */}
        <Route path="/data-karyawan" element={<PrivateRoute allowedRoles={["4","6"]}><div className="flex">
              <MenuSidebar handleLogout={handleLogout} roleId={localStorage.getItem("roleId")} />
              <div className="flex-grow p-6">
                <DataKaryawan />
              </div>
            </div>
          </PrivateRoute>
        }/>

        <Route path="/data-penggajian" element={
          <PrivateRoute allowedRoles={["4","6"]}>
            <div className="flex">
              <MenuSidebar handleLogout={handleLogout} roleId={localStorage.getItem("roleId")}   />
              <div className="flex-grow p-6">
                <DataPenggajian />
              </div>
            </div>
          </PrivateRoute>
        }/>

        <Route path="/data-penggajian/:id_user" element={
          <PrivateRoute allowedRoles={["4","6"]}>
            <div className="flex">
              <MenuSidebar handleLogout={handleLogout} roleId={localStorage.getItem("roleId")}   />
              <div className="flex-grow p-6">
                <DetailPenggajian/>
              </div>
            </div>
          </PrivateRoute>
        }/>


        <Route path="*" element={isLoggedIn ? <Navigate to="/home"/> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
