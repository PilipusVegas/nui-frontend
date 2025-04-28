import { useState } from "react";
import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import Menu from "./pages/menu";
import Login from "./pages/login";
import Absen from "./pages/absensi";
import Lembur from "./pages/lembur";
import Form from "./pages/form";
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
import Header from "./layouts/header";
import SuratDinas from "./pages/form/dataSuratDinas";
import FormDinas from "./pages/form/formDinas";
import DetailSuratDinas from "./pages/form/detailSuratDinas";
import Divisi from "./pages/divisi/dataDivisi";


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

  const SidebarLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  
    const toggleSidebar = () => {
      setIsSidebarOpen(prevState => !prevState);
    };
  
    return (
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <MenuSidebar 
          handleLogout={handleLogout} 
          roleId={localStorage.getItem("roleId")} 
          isOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
        />
        <div className="flex-grow flex flex-col sticky z-10">
          {/* Header */}
          <Header toggleSidebar={toggleSidebar} />
          {/* Main Content */}
          <main className="flex-grow bg-gray-100">{children}</main>
        </div>
      </div>
    );
  };
  

  const routes = [

    // MOBILE
    { path: "/notification", component: <Notification />, roles: ["2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "14", "15", "16", "17", "18", "19", "20", "21", "22"] },
    { path: "/riwayat-absensi", component: <RiwayatAbsensi />, roles: ["2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "14", "15", "16", "17", "18", "19", "20", "21", "22"] },
    { path: "/profile", component: <Profile />, roles: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22"] },
    { path: "/menu", component: <Menu />, roles: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22"] },
    { path: "/absensi", component: <Absen />, roles: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22"] },
    { path: "/lembur", component: <Lembur />, roles: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22"] },

    // DESKTOP
    { path: "/data-approval", component: <DataApproval />, roles: ["1", "5"], layout: SidebarLayout },
    { path: "/data-lokasi", component: <DataLokasi />, roles: ["1", "5"], layout: SidebarLayout },
    { path: "/data-absensi", component: <DataAbsensi />, roles: ["1", "4", "6"], layout: SidebarLayout },
    { path: "/data-absensi/:id_user", component: <DetailAbsensi />, roles: ["1", "4", "6"], layout: SidebarLayout },
    { path: "/data-karyawan", component: <DataKaryawan />, roles: ["1", "4", "6", "13"], layout: SidebarLayout },
    { path: "/data-penggajian", component: <DataPenggajian />, roles: ["1", "4", "6", "13"], layout: SidebarLayout },
    { path: "/data-penggajian/:id_user", component: <DetailPenggajian />, roles: ["1", "4", "6"], layout: SidebarLayout },
    { path: "/surat-dinas", component: <SuratDinas />, roles: ["1","4","6"],layout: SidebarLayout  },
    { path: "/surat-dinas/:id", component: <DetailSuratDinas />, roles: ["1","4","6"],layout: SidebarLayout  },
    { path: "/divisi/", component: <Divisi />, roles: ["1","4","6"],layout: SidebarLayout  },
    { path: "/form", component: <Form />, roles: [] }, 
    { path: "/form-dinas", component: <FormDinas />, roles: [] }, 
  ];

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
            <PrivateRoute allowedRoles={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22"]}>
              <Dashboard onLogout={handleLogout} />
            </PrivateRoute>
          }
        />
        {routes.map(({ path, component, roles, layout: Layout = React.Fragment }) => (
          <Route
            key={path}
            path={path}
            element={
              roles.length > 0 ? (
                <PrivateRoute allowedRoles={roles}>
                  <Layout>{component}</Layout>
                </PrivateRoute>
              ) : (
                <Layout>{component}</Layout>  
              )
            }
          />
        ))}
        <Route path="*" element={isLoggedIn ? <Navigate to="/home" /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
