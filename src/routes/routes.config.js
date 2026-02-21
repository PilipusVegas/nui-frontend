// src/routes/routes.config.jsx

import React from "react";
import SidebarLayout from "../layouts/SidebarLayout";

/* ===================== AUTH & HOME ===================== */
import Login from "../pages/login";
import HomeRedirect from "../pages/HomeRedirect";

/* ===================== MENU & PROFILE ===================== */
import Menu from "../pages/menu";
import Profile from "../pages/user-profile";
import EditProfile from "../pages/user-profile/edit";

/* ===================== ABSENSI / LEMBUR / CUTI ===================== */
import Absen from "../pages/absensi";
import AbsensiTim from "../pages/absensi-tim";
import Lembur from "../pages/lembur";
import Cuti from "../pages/cuti";
import PermohonanCuti from "../pages/cuti/formCuti";

/* ===================== DINAS ===================== */
import FormulirDinas from "../pages/dinas";
import FormulirDinasAplikasi from "../pages/dinas/formDinasAplikasi";
import PermohonanDinas from "../pages/permohonan-dinas/";
import DetailPermohonanDinas from "../pages/permohonan-dinas/show";
import RiwayatPermohonanDinas from "../pages/permohonan-dinas/riwayat";

/* ===================== TUGAS ===================== */
import Tugas from "../pages/tugas";
import DetailTugas from "../pages/tugas/show";

/* ===================== MOBILE ===================== */
import Notification from "../pages/notification";
import RiwayatPengguna from "../pages/riwayat-user/riwayat-pengguna";
import RiwayatFace from "../pages/riwayat-user/absen-face";

/* ===================== PENGAJUAN ABSENSI ===================== */
import PengajuanAbsensi from "../pages/pengajuan/absensi";
import DetailPengajuanAbsensi from "../pages/pengajuan/absensi/show";
import AbsensiTidakValid from "../pages/absensi-tidak-valid";
import RiwayatPersetujuanAbsensi from "../pages/riwayat-persetujuan-absensi";
import RiwayatPersetujuanAbsensiDetail from "../pages/riwayat-persetujuan-absensi/Show";

/* ===================== LEMBUR ===================== */
import PermohonanLembur from "../pages/permohonan-lembur";
import RiwayatPermohonanLembur from "../pages/permohonan-lembur/riwayat";

/* ===================== MASTER DATA ===================== */
import DataLokasi from "../pages/data-lokasi";
import TambahLokasi from "../pages/data-lokasi/tambah";
import EditLokasi from "../pages/data-lokasi/edit";
import Divisi from "../pages/data-divisi";
import Shift from "../pages/data-shift";
import TambahShift from "../pages/data-shift/tambah";
import EditShift from "../pages/data-shift/edit";

/* ===================== KARYAWAN ===================== */
import DataKaryawan from "../pages/karyawan";
import TambahKaryawan from "../pages/karyawan/tambah";
import EditKaryawan from "../pages/karyawan/edit";
import ShowKaryawan from "../pages/karyawan/show";

/* ===================== PERUSAHAAN ===================== */
import KelolaPerusahaan from "../pages/perusahaan";
import TambahPerusahaan from "../pages/perusahaan/tambah";
import EditPerusahaan from "../pages/perusahaan/edit";


/* ================ SHIFT PERUSAHAAN ==================== */
import KelolaShiftPerusahaan from "../pages/kelola-shift-perusahaan";
import EditShiftPerusahaan from "../pages/kelola-shift-perusahaan/Edit";


/* ===================== LAINNYA ===================== */
import KelolaAbsensi from "../pages/kelola-absensi";
import DetailKelolaAbsensi from "../pages/kelola-absensi/show";
import RemarkAbsensi from "../pages/remark-absensi";
import ManajemenMenu from "../pages/menu-management";
import PerangkatAbsensi from "../pages/data-perangkat-absensi";
import HrdAccess from "../pages/hrd-akses";
import TambahHrdAccess from "../pages/hrd-akses/tambah";
import EditHrdAccess from "../pages/hrd-akses/edit";
import KadivMember from "../pages/kadiv-member";
import DetailKadivMember from "../pages/kadiv-member/show";
import Penugasan from "../pages/penugasan";
import TambahPenugasan from "../pages/penugasan/tambah";
import EditPenugasan from "../pages/penugasan/edit";
import DetailPenugasan from "../pages/penugasan/show";
import RiwayatPenugasan from "../pages/penugasan/riwayat";
import RekapTunjangan from "../pages/tunjangan";
import TunjanganKaryawan from "../pages/tunjangan-karyawan";
import LogSistem from "../pages/log-sistem/LogPage";
import RoleApp from "../pages/role-app";
import DataPenggajian from "../pages/penggajian";
import RiwayatPenggajian from "../pages/penggajian/riwayat";
import PenjadwalanKaryawan from "../pages/penjadwalan-karyawan";
import TambahPenjadwalanKaryawan from "../pages/penjadwalan-karyawan/tambah";
import EditPenjadwalanKaryawan from "../pages/penjadwalan-karyawan/edit";
import DetailPenjadwalanKaryawan from "../pages/penjadwalan-karyawan/show";
import TambahPenjadwalan from "../pages/penjadwalan-karyawan/TambahJadwal";
import PengajuanKunjungan from "../pages/permohonan-kunjungan";
import RiwayatKunjungan from "../pages/permohonan-kunjungan/riwayat";
import DetailKunjungan from "../pages/permohonan-kunjungan/show";
import Kunjungan from "../pages/kunjungan";
import PermohonanAbsensiTim from "../pages/permohonan-absensi-tim";
import KelolaAnggotaTim from "../pages/kelola-anggota-tim";

/* ===================== ROUTES CONFIG ===================== */
export const routes = [
  /* ===== AUTH ===== */
  { path: "/login", element: <Login /> },

  /* ===== HOME ===== */
  // { path: "/home", element: <HomeRedirect />},
  { path: "/home", element: <HomeRedirect />, roles: [] },


  /* ===== MOBILE ===== */
  { path: "/notification", element: <Notification />, roles: [] },
  { path: "/riwayat-pengguna", element: <RiwayatPengguna />, roles: [] },
  { path: "/riwayat-face", element: <RiwayatFace /> },

  /* ===== MENU & PROFILE ===== */
  { path: "/menu", element: <Menu />, roles: [] },
  { path: "/profile", element: <Profile />, roles: [] },
  { path: "/profile/edit/:id", element: <EditProfile />, roles: [] },

  /* ===== ABSENSI / LEMBUR / CUTI ===== */
  { path: "/absensi", element: <Absen />, roles: [] },
  { path: "/absensi-tim", element: <AbsensiTim />, roles: [] },
  { path: "/lembur", element: <Lembur />, roles: [] },
  { path: "/cuti", element: <Cuti />, roles: [] },
  { path: "/formulir-cuti", element: <PermohonanCuti />, roles: [] },

  /* ===== DINAS ===== */
  { path: "/formulir-dinas", element: <FormulirDinas /> },
  { path: "/formulir-dinas-aplikasi", element: <FormulirDinasAplikasi />, roles: [] },

  /* ===== KUNJUNGAN ===== */
  { path: "/pengajuan-kunjungan", element: <PengajuanKunjungan />, roles: [], layout: SidebarLayout },
  { path: "/pengajuan/kunjungan/detail/:id", element: <DetailKunjungan />, roles: [], layout: SidebarLayout },
  { path: "/pengajuan/riwayat-kunjungan", element: <RiwayatKunjungan />, roles: [], layout: SidebarLayout },

  { path: "/kunjungan", element: <Kunjungan />, roles: [] },

  /* ===== TUGAS ===== */
  { path: "/tugas", element: <Tugas />, roles: [] },
  { path: "/tugas/:id", element: <DetailTugas />, roles: [] },

  /* ===== DESKTOP (SIDEBAR LAYOUT) ===== */
  { path: "/pengajuan-absensi", element: <PengajuanAbsensi />, roles: ["1", "4", "5", "6", "18", "20"], layout: SidebarLayout },
  { path: "/pengajuan-absensi/:id_user", element: <DetailPengajuanAbsensi />, roles: ["1", "4", "5", "6", "18", "20"], layout: SidebarLayout },
  { path: "/absensi-tidak-valid", element: <AbsensiTidakValid />, roles: ["1", "4", "5", "6", "18", "20"], layout: SidebarLayout },
  { path: "/riwayat-persetujuan-absensi", element: <RiwayatPersetujuanAbsensi />, roles: ["1", "4", "5", "6", "20"], layout: SidebarLayout },
  { path: "/riwayat-persetujuan-absensi/:id_user", element: <RiwayatPersetujuanAbsensiDetail />, roles: ["1", "4", "5", "6", "20"], layout: SidebarLayout },

  { path: "/permohonan-absensi-tim", element: <PermohonanAbsensiTim />, roles: ["1", "4", "5", "6", "20"], layout: SidebarLayout },

  { path: "/permohonan-lembur", element: <PermohonanLembur />, roles: ["1", "4", "5", "6", "20"], layout: SidebarLayout },
  { path: "/riwayat-lembur", element: <RiwayatPermohonanLembur />, roles: ["1", "4", "5", "6", "20"], layout: SidebarLayout },

  { path: "/permohonan-dinas", element: <PermohonanDinas />, roles: ["1", "4", "5", "6", "20"], layout: SidebarLayout },
  { path: "/permohonan-dinas/:id", element: <DetailPermohonanDinas />, roles: ["1", "4", "5", "6", "20"], layout: SidebarLayout },
  { path: "/riwayat-surat-dinas", element: <RiwayatPermohonanDinas />, roles: ["1", "4", "5", "6", "20"], layout: SidebarLayout },

  { path: "/data-lokasi", element: <DataLokasi />, roles: ["1", "5"], layout: SidebarLayout },
  { path: "/data-lokasi/tambah", element: <TambahLokasi />, roles: ["1", "5"], layout: SidebarLayout },
  { path: "/data-lokasi/edit/:id", element: <EditLokasi />, roles: ["1", "5"], layout: SidebarLayout },

  { path: "/kelola-absensi", element: <KelolaAbsensi />, roles: ["1", "4", "6"] },
  { path: "/kelola-absensi/:id", element: <DetailKelolaAbsensi />, roles: ["1", "4", "6"], layout: SidebarLayout },
  { path: "/remark-absensi", element: <RemarkAbsensi />, roles: ["1", "4", "5", "6", "20"], layout: SidebarLayout },
  
  { path: "/karyawan", element: <DataKaryawan />, roles: ["1", "4", "6"], layout: SidebarLayout },
  { path: "/karyawan/tambah", element: <TambahKaryawan />, roles: ["1", "4", "6"], layout: SidebarLayout },
  { path: "/karyawan/edit/:id", element: <EditKaryawan />, roles: ["1", "4", "6"], layout: SidebarLayout },
  { path: "/karyawan/show/:id", element: <ShowKaryawan />, roles: ["1", "4", "6"], layout: SidebarLayout },

  { path: "/penggajian", element: <DataPenggajian />, roles: ["1", "4", "6"], layout: SidebarLayout },
  { path: "/penggajian/riwayat", element: <RiwayatPenggajian />, roles: ["1", "4", "6"], layout: SidebarLayout },

  { path: "/divisi", element: <Divisi />, roles: ["1", "4", "6"], layout: SidebarLayout },
  { path: "/shift", element: <Shift />, roles: ["1", "4", "6"], layout: SidebarLayout },
  { path: "/shift/tambah", element: <TambahShift />, roles: ["1", "4", "6"], layout: SidebarLayout },
  { path: "/shift/edit/:id", element: <EditShift />, roles: ["1", "4", "6"], layout: SidebarLayout },

  { path: "/perusahaan", element: <KelolaPerusahaan />, roles: ["1", "4", "6"], layout: SidebarLayout },
  { path: "/perusahaan/tambah", element: <TambahPerusahaan />, roles: ["1", "4", "6"], layout: SidebarLayout },
  { path: "/perusahaan/edit/:id", element: <EditPerusahaan />, roles: ["1", "4", "6"], layout: SidebarLayout },

  { path: "/shift-perusahaan", element: <KelolaShiftPerusahaan />, roles: ["1", "4", "6"], layout: SidebarLayout },
  { path: "/shift-perusahaan/edit/:id", element: <EditShiftPerusahaan />, roles: ["1", "4", "6"], layout: SidebarLayout },

  { path: "/manajemen-menu", element: <ManajemenMenu />, roles: ["1"], layout: SidebarLayout },
  { path: "/perangkat-absensi", element: <PerangkatAbsensi />, roles: ["1"], layout: SidebarLayout },

  { path: "/akses-hrd", element: <HrdAccess />, roles: ["1"], layout: SidebarLayout },
  { path: "/akses-hrd/tambah", element: <TambahHrdAccess />, roles: ["1"], layout: SidebarLayout },
  { path: "/akses-hrd/edit/:id_user", element: <EditHrdAccess />, roles: ["1"], layout: SidebarLayout },

  { path: "/kadiv-member", element: <KadivMember />, roles: ["1", "4", "6"], layout: SidebarLayout },
  { path: "/kadiv-member/show/:id_user", element: <DetailKadivMember />, roles: ["1", "4", "6"], layout: SidebarLayout },

  { path: "/role-app", element: <RoleApp />, roles: ["1"], layout: SidebarLayout },

  { path: "/penugasan", element: <Penugasan />, roles: ["1", "4", "5", "6", "20"], layout: SidebarLayout },
  { path: "/penugasan/tambah", element: <TambahPenugasan />, roles: ["1", "4", "5", "6", "20"], layout: SidebarLayout },
  { path: "/penugasan/edit/:id", element: <EditPenugasan />, roles: ["1", "4", "5", "6", "20"], layout: SidebarLayout },
  { path: "/penugasan/show/:id", element: <DetailPenugasan />, roles: ["1", "4", "5", "6", "20"], layout: SidebarLayout },
  { path: "/penugasan/riwayat", element: <RiwayatPenugasan />, roles: ["1", "4", "5", "6", "20"], layout: SidebarLayout },

  { path: "/tunjangan-karyawan", element: <TunjanganKaryawan />, roles: ["1", "4", "6"], layout: SidebarLayout },
  { path: "/rekap-tunjangan", element: <RekapTunjangan />, roles: ["1", "4", "6"] },

  { path: "/log-sistem", element: <LogSistem />, roles: ["1", "4", "6"], layout: SidebarLayout },

  { path: "kelola-anggota-tim", element: <KelolaAnggotaTim />, roles: ["1", "5", "20"], layout: SidebarLayout },

  { path: "/penjadwalan", element: <PenjadwalanKaryawan />, roles: ["1", "4", "5", "6", "20"], layout: SidebarLayout },
  { path: "/penjadwalan/tambah", element: <TambahPenjadwalanKaryawan />, roles: ["1", "4", "5", "6", "20"], layout: SidebarLayout },
  { path: "/penjadwalan/edit/:id_user", element: <EditPenjadwalanKaryawan />, roles: ["1", "4", "5", "6", "20"], layout: SidebarLayout },
  { path: "/penjadwalan/detail/:id_user", element: <DetailPenjadwalanKaryawan />, roles: ["1", "4", "5", "6", "20"], layout: SidebarLayout },
  { path: "/penjadwalan/tambah-jadwal/:id_user", element: <TambahPenjadwalan />, roles: ["1", "4", "5", "6", "20"], layout: SidebarLayout },
];