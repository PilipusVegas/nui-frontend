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
import LokasiPresensi from "./pages/lokasi/index";
import TambahLokasi from "./pages/lokasi/tambah";
import EditLokasi from "./pages/lokasi/edit";
import PersetujuanPresensi from "./pages/persetujuanPresensi/index";
import DetailPersetujuanPresensi from "./pages/persetujuanPresensi/show";
import DataKaryawan from "./pages/karyawan/dataKaryawan";
import TambahKaryawan from "./pages/karyawan/tambah";
import EditKaryawan from "./pages/karyawan/edit";
import Shift from "./pages/shift/shift";
import TambahShift from "./pages/shift/tambah";
import EditShift from "./pages/shift/edit";
import PersetujuanLembur from "./pages/persetujuanLembur/index";
import DataPenggajian from "./pages/penggajian/dataPenggajian";
import DetailPenggajian from "./pages/penggajian/detailPenggajian";
import RiwayatPenggajian from "./pages/riwayatPenggajian/index";
import RiwayatAbsensi from "./pages/riwayat/riwayatAbsensi";
import MenuSidebar from "./layouts/menuSidebar";
import Header from "./layouts/header";
import SuratDinas from "./pages/form/dataSuratDinas";
import FormDinas from "./pages/form/formDinas";
import DetailSuratDinas from "./pages/form/detailSuratDinas";
import Divisi from "./pages/divisi/dataDivisi";
import AbsenKantor from "./pages/kelolaPresensi/index";
import KelolaPerusahaan from "./pages/perusahaan";
import TambahPerusahaan from "./pages/perusahaan/tambah";
import EditPerusahaan from "./pages/perusahaan/edit";

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
        <MenuSidebar handleLogout={handleLogout} roleId={localStorage.getItem("roleId")} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
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
    { path: "/persetujuan-presensi", component: <PersetujuanPresensi />, roles: ["1", "4", "5", "6"], layout: SidebarLayout },
    { path: "/persetujuan-presensi/:id_user", component: <DetailPersetujuanPresensi />, roles: ["1", "4", "5", "6"], layout: SidebarLayout },
    { path: "/persetujuan-lembur", component: <PersetujuanLembur />, roles: ["1", "4", "5", "6"], layout: SidebarLayout },
    { path: "/lokasi-presensi", component: <LokasiPresensi />, roles: ["1", "5"], layout: SidebarLayout },
    { path: "/lokasi-presensi/edit/:id", component: <EditLokasi />, roles: ["1", "5"], layout: SidebarLayout },
    { path: "/lokasi-presensi/tambah", component: <TambahLokasi />, roles: ["1", "5"], layout: SidebarLayout },
    { path: "/kelola-presensi", component: <AbsenKantor />, roles: ["1", "4", "5", "6"], layout: SidebarLayout },
    { path: "/karyawan", component: <DataKaryawan />, roles: ["1", "4", "6", "13"], layout: SidebarLayout },
    { path: "/karyawan/tambah", component: <TambahKaryawan />, roles: ["1", "4", "6", "13"], layout: SidebarLayout },
    { path: "/karyawan/edit/:id", component: <EditKaryawan />, roles: ["1", "4", "6", "13"], layout: SidebarLayout },
    { path: "/data-penggajian", component: <DataPenggajian />, roles: ["1", "4", "6", "13"], layout: SidebarLayout },
    { path: "/data-penggajian/:id_user", component: <DetailPenggajian />, roles: ["1", "4", "6", "13"], layout: SidebarLayout },
    { path: "/riwayat-penggajian", component: <RiwayatPenggajian />, roles: ["1", "4", "6", "13"], layout: SidebarLayout },
    { path: "/surat-dinas", component: <SuratDinas />, roles: ["1","4","5","6","13"],layout: SidebarLayout  },
    { path: "/surat-dinas/:id", component: <DetailSuratDinas />, roles: ["1","4","5","6","13"],layout: SidebarLayout  },
    { path: "/divisi/", component: <Divisi />, roles: ["1","4","6"],layout: SidebarLayout  },
    { path: "/shift/", component: <Shift />, roles: ["1","4","6"],layout: SidebarLayout  },
    { path: "/shift/tambah", component: <TambahShift />, roles: ["1","4","6"],layout: SidebarLayout  },
    { path: "/shift/edit/:id", component: <EditShift />, roles: ["1","4","6"],layout: SidebarLayout  },
    { path: "/perusahaan/", component: <KelolaPerusahaan />, roles: ["1","4","6"],layout: SidebarLayout  },
    { path: "/perusahaan/tambah", component: <TambahPerusahaan />, roles: ["1","4","6"],layout: SidebarLayout  },
    { path: "/perusahaan/edit/:id", component: <EditPerusahaan />, roles: ["1","4","6"],layout: SidebarLayout  },
    { path: "/form", component: <Form />, roles: [] },
    { path: "/form-dinas", component: <FormDinas />, roles: [] },
  ];

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isLoggedIn ? <Navigate to="/home" /> : <Login onLoginSuccess={handleLoginSuccess} />}/>
        <Route path="/home" element={
            <PrivateRoute allowedRoles={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22"]}>
              <Dashboard onLogout={handleLogout} />
            </PrivateRoute>
          }
        />
        {routes.map(({ path, component, roles, layout: Layout = React.Fragment }) => (
          <Route key={path} path={path} element={roles.length > 0 ? (
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
