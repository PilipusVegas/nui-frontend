import { useState, useEffect } from "react";
import { getUserFromToken } from "./utils/jwtHelper";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"
import React from "react";
import Swal from "sweetalert2";
import Menu from "./pages/menu";
import Login from "./pages/login";
import Absen from "./pages/absensi";
import Lembur from "./pages/lembur";
import Tugas from "./pages/tugas";
import DetailTugas from "./pages/tugas/show";
import Cuti from "./pages/cuti";
import PermohonanCuti from "./pages/cuti/formCuti";
import Profile from "./pages/user-profile";
import EditProfile from "./pages/user-profile/edit";
import HomeRedirect from "./pages/HomeRedirect";
import Notification from "./pages/notification";
import LokasiPresensi from "./pages/lokasi";
import TambahLokasi from "./pages/lokasi/tambah";
import EditLokasi from "./pages/lokasi/edit";
import DataKaryawan from "./pages/karyawan/";
import TambahKaryawan from "./pages/karyawan/tambah";
import EditKaryawan from "./pages/karyawan/edit";
import ShowKaryawan from "./pages/karyawan/show";
import Shift from "./pages/shift/";
import TambahShift from "./pages/shift/tambah";
import EditShift from "./pages/shift/edit";
import RiwayatLembur from "./pages/riwayat-lembur";
import DataPenggajian from "./pages/penggajian";
import RiwayatPenggajian from "./pages/penggajian/riwayat";
import RiwayatFace from "./pages/riwayat-user/absen-face";
import RiwayatSuratDinas from "./pages/riwayatSuratDinas";
import Divisi from "./pages/divisi";
import KelolaAbsensi from "./pages/kelola-absensi";
import DetailKelolaAbsensi from "./pages/kelola-absensi/show";
import KelolaPerusahaan from "./pages/perusahaan";
import TambahPerusahaan from "./pages/perusahaan/tambah";
import EditPerusahaan from "./pages/perusahaan/edit";
import MenuSidebar from "./layouts/menuSidebar";
import Header from "./layouts/header";
import ManajemenMenu from "./pages/menu-management";
import PerangkatAbsensi from "./pages/perangkat-absensi";
import ManajemenHariLibur from "./pages/manajemen-libur";
import FormulirDinas from "./pages/form/formDinas";
import RemarkAbsensi from "./pages/kelola-absensi/remarkAbsensi";
import PengajuanLembur from "./pages/pengajuan/lembur";
import PengajuanAbsensi from "./pages/pengajuan/absensi";
import DetailPengajuanAbsensi from "./pages/pengajuan/absensi/show";
import PengajuanDinas from "./pages/pengajuan/surat-dinas";
import DetailPengajuanDinas from "./pages/pengajuan/surat-dinas/show";
import HrdAccess from "./pages/hrd-akses";
import TambahHrdAccess from "./pages/hrd-akses/tambah";
import EditHrdAccess from "./pages/hrd-akses/edit";
import Penugasan from "./pages/penugasan";
import TambahPenugasan from "./pages/penugasan/tambah";
import EditPenugasan from "./pages/penugasan/edit";
import DetailPenugasan from "./pages/penugasan/show";
import RiwayatPenugasan from "./pages/penugasan/riwayat";
import RekapTunjangan from "./pages/tunjangan/";

import RoleApp from "./pages/role-app";


// ===================== MOBILE USERS ========================
// RIWAYAT
import RiwayatPengguna from "./pages/riwayat-user/riwayat-pengguna";


const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getUserFromToken());
  const user = isAuthenticated ? getUserFromToken() : null;
  const isLoggedIn = !!user;
  const roleId = String(user?.id_role || "");

  useEffect(() => {
    const interval = setInterval(() => {
      const user = getUserFromToken();
      setIsAuthenticated(!!user);
    }, 1000); // Cek setiap detik

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false); // Update state
    window.location.href = "/login";
  };

  const checkRolePermission = (allowedRoles) => allowedRoles.includes(roleId);
  const PrivateRoute = ({ children, allowedRoles, allowedCompanies }) => {
    if (!isLoggedIn) {
      Swal.fire({
        title: "Sesi Anda telah berakhir",
        text: "Mohon untuk login kembali.",
        icon: "warning",
        confirmButtonText: "OK",
        timer: 3000,
        timerProgressBar: true,
      }).then(() => {
        window.location.href = "/login";
      });
      return null;
    }

    if (!checkRolePermission(allowedRoles)) {
      Swal.fire({
        icon: "error",
        title: "Akses Ditolak",
        text: "Anda tidak memiliki izin untuk mengakses halaman ini.",
        confirmButtonText: "Kembali",
      }).then(() => {
        window.location.href = "/home";
      });
      return null;
    }

    if (allowedCompanies && !allowedCompanies.includes(String(user?.id_perusahaan))) {
      Swal.fire({
        icon: "error",
        title: "Akses Ditolak",
        text: "Anda tidak diizinkan mengakses halaman ini karena tidak sesuai dengan perusahaan.",
        confirmButtonText: "Kembali",
      }).then(() => {
        window.location.href = "/home";
      });
      return null;
    }
    return children;
  };

  const SidebarLayout = ({ children, handleLogout, user }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
    const [isSidebarDesktopOpen, setIsSidebarDesktopOpen] = useState(true);

    const toggleSidebar = () => {
      if (isMobile) {
        setIsSidebarMobileOpen((prev) => !prev);
      } else {
        setIsSidebarDesktopOpen((prev) => !prev);
      }
    };

    useEffect(() => {
      const handleResize = () => {
        const mobile = window.innerWidth <= 1024;
        setIsMobile(mobile);

        if (!mobile) {
          setIsSidebarDesktopOpen(true);
          setIsSidebarMobileOpen(false);
        } else {
          setIsSidebarMobileOpen(false);
        }
      };

      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
      <div className="min-h-screen bg-green-900 p-1 gap-2 overflow-x-clip">
        <div className="bg-transparent rounded-2xl flex flex-col h-[calc(100vh-0.7rem)] overflow-hidden">
          {/* Header */}
          <div className="h-14 bg-green-900 z-50">
            <Header toggleSidebar={toggleSidebar} isSidebarOpen={isMobile ? isSidebarMobileOpen : isSidebarDesktopOpen} />
          </div>

          {/* Body */}
          <div className="flex flex-1 overflow-hidden bg-green-900 gap-3 pt-2">
            {/* Sidebar - Desktop */}
            {!isMobile && isSidebarDesktopOpen && (
              <div className="min-w-64 bg-white rounded-2xl shadow-lg border border-green-400 overflow-hidden">
                <div className="h-full overflow-y-auto scrollbar-green">
                  <MenuSidebar handleLogout={handleLogout} perusahaanId={user?.id_perusahaan || ""} roleId={user?.id_role || ""} isOpen={isSidebarDesktopOpen} toggleSidebar={toggleSidebar} isMobile={false} />
                </div>
              </div>
            )}

            {/* Sidebar - Mobile Overlay */}
            {isMobile && isSidebarMobileOpen && (
              <div className="fixed inset-0 z-50 flex">
                <div className="fixed inset-0 bg-black opacity-50" onClick={() => setIsSidebarMobileOpen(false)} />
                <div className="h-full overflow-y-auto scrollbar-green">
                  <MenuSidebar handleLogout={handleLogout} perusahaanId={user?.id_perusahaan || ""} roleId={user?.id_role || ""} isOpen={isSidebarMobileOpen} toggleSidebar={toggleSidebar} isMobile={true} />
                </div>
              </div>
            )}

            {/* Main Content */}
            <main className="flex-grow h-full overflow-hidden">
              <div className="h-full overflow-y-auto scrollbar-none">
                {Array.isArray(children) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
                    {children.map((child, i) => (
                      <div key={i} className="bg-white rounded-2xl shadow-md h-full overflow-y-auto scrollbar-none">
                        {child}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-md h-full overflow-y-auto p-3 sm:p-5 scrollbar-none">
                    {children}
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  };

  const routes = [
    // ALL ROUNDER
    { path: "/riwayat-face", component: <RiwayatFace />, roles: [] },
    { path: "/formulir-dinas", component: <FormulirDinas />, roles: [] },

    // MOBILE
    { path: "/notification", component: <Notification />, roles: ["2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50"] },
    { path: "/riwayat-pengguna", component: <RiwayatPengguna />, roles: ["2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50"] },
    { path: "/profile", component: <Profile />, roles: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50"] },
    { path: "profile/edit/:id", component: <EditProfile />, roles: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50"] },
    { path: "/menu", component: <Menu />, roles: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50"] },
    { path: "/absensi", component: <Absen />, roles: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50"] },
    { path: "/lembur", component: <Lembur />, roles: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50"] },
    { path: "/cuti", component: <Cuti />, roles: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50"] },
    { path: "/formulir-cuti", component: <PermohonanCuti   />, roles: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50"] },
    { path: "/tugas", component: <Tugas   />, roles: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50"] },
    { path: "/tugas/:id", component: <DetailTugas   />, roles: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50"] },

    // DESKTOP
    { path: "/pengajuan-absensi", component: <PengajuanAbsensi />, roles: ["1", "4", "5", "6", "18", "20"], allowedCompanies: ["1", "4"], layout: SidebarLayout },
    { path: "/pengajuan-absensi/:id_user", component: <DetailPengajuanAbsensi />, roles: ["1", "4", "5", "6", "18", "20"], allowedCompanies: ["1", "4"], layout: SidebarLayout },
    { path: "/pengajuan-lembur", component: <PengajuanLembur />, roles: ["1", "4", "5", "6", "20"], allowedCompanies: ["1", "4", "5", "6"], layout: SidebarLayout },
    { path: "/pengajuan-dinas", component: <PengajuanDinas />, roles: ["1", "4", "5", "6", "20"], layout: SidebarLayout },
    { path: "/pengajuan-dinas/:id", component: <DetailPengajuanDinas />, roles: ["1", "4", "5", "6","20"], layout: SidebarLayout },
    { path: "/riwayat-lembur", component: <RiwayatLembur />, roles: ["1", "4", "5", "6", "20"], allowedCompanies: ["1", "4", "5", "6"], layout: SidebarLayout },
    { path: "/lokasi-presensi", component: <LokasiPresensi />, roles: ["1", "5"], layout: SidebarLayout },
    { path: "/lokasi-presensi/edit/:id", component: <EditLokasi />, roles: ["1", "5"], layout: SidebarLayout },
    { path: "/lokasi-presensi/tambah", component: <TambahLokasi />, roles: ["1", "5"], layout: SidebarLayout },
    { path: "/kelola-absensi", component: <KelolaAbsensi />, roles: ["1", "4", "6"]},
    { path: "/kelola-absensi/:id", component: <DetailKelolaAbsensi />, roles: ["1", "4", "6"], layout: SidebarLayout },
    { path: "/remark-absensi", component: <RemarkAbsensi />, roles: ["1", "4", "5", "6"], layout: SidebarLayout },
    { path: "/karyawan", component: <DataKaryawan />, roles: ["1", "4", "6"], layout: SidebarLayout },
    { path: "/karyawan/tambah", component: <TambahKaryawan />, roles: ["1", "4", "6"], layout: SidebarLayout },
    { path: "/karyawan/edit/:id", component: <EditKaryawan />, roles: ["1", "4", "6"], layout: SidebarLayout },
    { path: "/karyawan/show/:id", component: <ShowKaryawan />, roles: ["1", "4", "6"], layout: SidebarLayout },
    { path: "/penggajian", component: <DataPenggajian />, roles: ["1", "4", "6"], layout: SidebarLayout },
    { path: "/penggajian/riwayat", component: <RiwayatPenggajian />, roles: ["1", "4", "6"], layout: SidebarLayout },
    { path: "/riwayat-surat-dinas", component: <RiwayatSuratDinas />, roles: ["1", "4", "5", "6","20"], layout: SidebarLayout },
    { path: "/divisi/", component: <Divisi />, roles: ["1", "4", "6"], layout: SidebarLayout },
    { path: "/shift/", component: <Shift />, roles: ["1", "4", "6"], layout: SidebarLayout },
    { path: "/shift/tambah", component: <TambahShift />, roles: ["1", "4", "6"], layout: SidebarLayout },
    { path: "/shift/edit/:id", component: <EditShift />, roles: ["1", "4", "6"], layout: SidebarLayout },
    { path: "/perusahaan/", component: <KelolaPerusahaan />, roles: ["1", "4", "6"], layout: SidebarLayout },
    { path: "/perusahaan/tambah", component: <TambahPerusahaan />, roles: ["1", "4", "6"], layout: SidebarLayout },
    { path: "/perusahaan/edit/:id", component: <EditPerusahaan />, roles: ["1", "4", "6"], layout: SidebarLayout },
    { path: "/manajemen-hari-libur", component: <ManajemenHariLibur />, roles: ["1", "4", "6"], layout: SidebarLayout },
    { path: "/manajemen-menu", component: <ManajemenMenu />, roles: ["1"], layout: SidebarLayout },
    { path: "/perangkat-absensi", component: <PerangkatAbsensi />, roles: ["1"], layout: SidebarLayout },
    { path: "/akses-hrd", component: <HrdAccess />, roles: ["1"], layout: SidebarLayout },
    { path: "/akses-hrd/tambah", component: <TambahHrdAccess />, roles: ["1"], layout: SidebarLayout },
    { path: "/akses-hrd/edit/:id_user", component: <EditHrdAccess />, roles: ["1"], layout: SidebarLayout },
    { path: "/role-app", component: <RoleApp />, roles: ["1"], layout: SidebarLayout },
    { path: "/penugasan", component: <Penugasan />, roles: ["1", "4", "5", "6", "20"], layout: SidebarLayout },
    { path: "/penugasan/tambah", component: <TambahPenugasan />, roles: ["1", "4", "5", "6", "20"], layout: SidebarLayout },
    { path: "/penugasan/edit/:id", component: <EditPenugasan />, roles: ["1", "4", "5", "6", "20"], layout: SidebarLayout },
    { path: "/penugasan/show/:id", component: <DetailPenugasan />, roles: ["1", "4", "5", "6", "20"], layout: SidebarLayout },
    { path: "/penugasan/riwayat", component: <RiwayatPenugasan />, roles: ["1", "4", "5", "6", "20"], layout: SidebarLayout },
    { path: "/rekap-tunjangan", component: <RekapTunjangan />, roles: ["1", "4", "6"] },    
  ];

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isLoggedIn ? <Navigate to="/home" /> : <Login onLoginSuccess={() => setIsAuthenticated(true)} />} />
        <Route path="/home" element={
          <PrivateRoute allowedRoles={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50"]}>
            {[1, 4, 5, 6, 18, 20].includes(user?.id_role) ? (
              <SidebarLayout user={user} handleLogout={handleLogout}>
                <HomeRedirect onLogout={handleLogout} />
              </SidebarLayout>
            ) : (
              <HomeRedirect onLogout={handleLogout} />
            )}
          </PrivateRoute>
        } />

        {routes.map(({ path, component, roles, layout: Layout = React.Fragment, allowedCompanies }) => (
          <Route key={path} path={path} element={
            roles.length > 0 ? (
              <PrivateRoute allowedRoles={roles} allowedCompanies={allowedCompanies}>
                {Layout === React.Fragment ? (
                  <Layout>{component}</Layout>
                ) : (
                  <Layout user={user} handleLogout={handleLogout}>
                    {component}
                  </Layout>
                )}
              </PrivateRoute>
            ) : (
              Layout === React.Fragment ? (
                <Layout>{component}</Layout>
              ) : (
                <Layout user={user} handleLogout={handleLogout}>
                  {component}
                </Layout>
              )
            )
          } />
        ))}
        <Route path="*" element={isLoggedIn ? <Navigate to="/home" /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
