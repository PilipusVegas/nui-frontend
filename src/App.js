import { useState } from "react";
import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import Menu from "./pages/menu";
import Login from "./pages/login";
import Absen from "./pages/absensi";
import Lembur from "./pages/lembur";
import Profile from "./pages/profile";
import Dashboard from "./pages/dashboard";
import Notification from "./pages/notification";
import DataLokasi from "./pages/lokasi/dataLokasi";
import DataAbsensi from "./pages/absensi/dataAbsensi";
import DetailAbsensi from "./pages/absensi/DetailAbsensi";
import DataKaryawan from "./pages/profile/dataKaryawan";
import DataApproval from "./pages/approval/dataApproval";
import DataPenggajian from "./pages/penggajian/dataPenggajian";
import DetailPenggajian from "./pages/penggajian/detailPenggajian";
import RiwayatAbsensi from "./pages/riwayat/riwayatAbsensi";
import MenuSidebar from "./layouts/menuSidebar";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem("isLoggedIn") === "true");

  const handleLoginSuccess = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
  };

  const checkRolePermission = (allowedRoles) => allowedRoles.includes(localStorage.getItem("roleId"));

  const PrivateRoute = ({ children, allowedRoles }) => {
    if (!isLoggedIn) return <Navigate to="/login" />;
    if (!checkRolePermission(allowedRoles)) return <Navigate to="/home" />;
    return children;
  };

  const SidebarLayout = ({ children }) => (
    <div className="flex">
      <MenuSidebar handleLogout={handleLogout} roleId={localStorage.getItem("roleId")} />
      <div className="flex-grow">{children}</div>
    </div>
  );

  const routes = [
    { path: "/notification", component: <Notification />, roles: [ "2", "3", "4", "5", "6"] },
    { path: "/riwayat-absensi", component: <RiwayatAbsensi />, roles: [ "2", "3", "4", "5", "6"] },
    { path: "/profile", component: <Profile />, roles: ["1", "2", "3", "4", "5", "6"] },
    { path: "/menu", component: <Menu />, roles: ["1", "2", "3", "4", "5", "6"] },
    { path: "/absensi", component: <Absen />, roles: ["1", "2", "3", "4", "5", "6"] },
    { path: "/lembur", component: <Lembur />, roles: ["1", "2", "3", "4", "5", "6"] },
    
    { path: "/data-approval", component: <DataApproval />, roles: ["1","5"], layout: SidebarLayout },
    { path: "/data-lokasi", component: <DataLokasi />, roles: ["1","5"], layout: SidebarLayout },
    { path: "/data-absensi", component: <DataAbsensi />, roles: ["1","4","6"], layout: SidebarLayout },
    { path: "/data-absensi/:id_user", component: <DetailAbsensi />, roles: ["1","4","6"], layout: SidebarLayout },
    { path: "/data-karyawan", component: <DataKaryawan />, roles: ["1","4", "6"], layout: SidebarLayout },
    { path: "/data-penggajian", component: <DataPenggajian />, roles: ["1","4", "6"], layout: SidebarLayout },
    { path: "/data-penggajian/:id_user", component: <DetailPenggajian />, roles: ["1","4", "6"], layout: SidebarLayout },
  ];

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isLoggedIn ? <Navigate to="/home" /> : <Login onLoginSuccess={handleLoginSuccess} />} />
        <Route
          path="/home"
          element={
            <PrivateRoute allowedRoles={["1", "2", "3", "4", "5", "6"]}>
              <Dashboard onLogout={handleLogout} />
            </PrivateRoute>
          }
        />
        {routes.map(({ path, component, roles, layout: Layout = React.Fragment }) => (
          <Route
            key={path}
            path={path}
            element={
              <PrivateRoute allowedRoles={roles}>
                <Layout>{component}</Layout>
              </PrivateRoute>
            }
          />
        ))}
        <Route path="*" element={isLoggedIn ? <Navigate to="/home" /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
