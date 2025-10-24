// src/data/menuConfig.js
import {
    faHome,
    faPeopleGroup,
    faUsersCog,
    faBuilding,
    faCalendarDays,
    faUserEdit,
    faUserCheck,
    faCheckSquare,
    faClockRotateLeft,
    faMoneyBillWave,
    faClipboardList,
    faPlaneDeparture,
    faFileSignature,
    faBusinessTime,
    faTasks,
    faMapMarkerAlt,
    faTabletScreenButton,
    faKey,
    faUserShield,
    faListCheck,
    faHistory,
    faBriefcase,
    faClock,
    faTimeline,
    faFolderOpen,
    faEdit
} from "@fortawesome/free-solid-svg-icons";
import { faPenFancy } from "@fortawesome/free-solid-svg-icons/faPenFancy";

export const menuConfig = [
    // 1. BERANDA
    {
        sectionTitle: "Beranda",
        items: [
            {
                label: "Dashboard",
                icon: faHome,
                path: "/home",
                roles: [1, 2, 3, 4, 5, 6, 13, 20],
            },
        ],
    },

    // 2. MANAJEMEN ORGANISASI
    {
        sectionTitle: "Manajemen Organisasi",
        items: [
            { label: "Data Karyawan", icon: faPeopleGroup, path: "/karyawan", roles: [1, 4, 6] },
            { label: "Divisi", icon: faUsersCog, path: "/divisi", roles: [1, 4, 6] },
            {
                label: "Perusahaan",
                icon: faBuilding,
                roles: [1, 4, 6],
                submenu: [
                    { label: "Data Perusahaan", icon: faBuilding, path: "/perusahaan", roles: [1, 4, 6] },
                    { label: "Manajemen Hari Libur", icon: faCalendarDays, path: "/manajemen-hari-libur", roles: [1] },
                ],
            },
        ],
    },

    // 3. ABSENSI & PENGGAJIAN
    {
        sectionTitle: "Absensi & Penggajian",
        items: [
            {
                label: "Kelola Absensi",
                icon: faUserEdit,
                roles: [1, 4, 5, 6],
                submenu: [
                    { label: "Persetujuan Absensi", icon: faCheckSquare, path: "/pengajuan-absensi", roles: [1, 4, 5, 6, 13, 20], perusahaan: [1, 4] },
                    { label: "Data Absensi Harian", icon: faUserCheck, path: "/kelola-absensi", roles: [1, 4, 6], target: "_blank" },
                    { label: "Remark Absensi", icon: faEdit, path: "/remark-absensi", roles: [1, 4, 6] },
                ],
            },
            { label: "Jam Kerja / Shift", icon: faClock, path: "/shift", roles: [1, 4, 6] },
            { label: "Penggajian", icon: faMoneyBillWave, path: "/penggajian", roles: [1, 4, 6] },
        ],
    },

    // 4. PENGAJUAN & RIWAYAT
    {
        sectionTitle: "Pengajuan & Riwayat",
        items: [
            {
                label: "Dinas Luar Kantor",
                icon: faPlaneDeparture,
                roles: [1, 4, 5, 6, 20],
                submenu: [
                    { label: "Pengajuan Dinas", icon: faFileSignature, path: "/pengajuan-dinas", roles: [1, 4, 5, 6, 20] },
                    { label: "Riwayat Dinas", icon: faBriefcase, path: "/riwayat-surat-dinas", roles: [1, 4, 5, 6, 20] },
                ],
            },
            {
                label: "Lembur",
                icon: faBusinessTime,
                roles: [1, 4, 5, 6, 20],
                submenu: [
                    { label: "Pengajuan Lembur", icon: faPenFancy, path: "/pengajuan-lembur", roles: [1, 5, 20] },
                    { label: "Riwayat Lembur", icon: faHistory, path: "/riwayat-lembur", roles: [1, 4, 5, 6, 20] },
                ],
            },
            {
                label: "Penugasan",
                icon: faTasks,
                roles: [1],
                submenu: [
                    { label: "Daftar Penugasan", icon: faListCheck, path: "/penugasan", roles: [1] },
                    { label: "Riwayat Penugasan", icon: faFolderOpen, path: "/riwayat-penugasan", roles: [1] },
                ],
            },
        ],
    },

    // 5. PENGATURAN SISTEM
    {
        sectionTitle: "Pengaturan Sistem",
        items: [
            { label: "Titik Lokasi Absensi", icon: faMapMarkerAlt, path: "/lokasi-presensi", roles: [1, 5] },
            { label: "Perangkat Absensi", icon: faTabletScreenButton, path: "/perangkat-absensi", roles: [1] },
            { label: "Manajemen Menu", icon: faKey, path: "/manajemen-menu", roles: [1] },
            { label: "Akses HRD", icon: faUserShield, path: "/akses-hrd", roles: [1] },
        ],
    },
];

// CardConfig untuk HomeDesktop
export const cardConfig = menuConfig.flatMap(group =>
    group.items.flatMap(item => {
        if (item.submenu) {
            return item.submenu.map(sub => ({
                title: sub.label,
                icon: sub.icon || item.icon,
                link: sub.path,
                roles: sub.roles,
                perusahaan: sub.perusahaan,
                color: "text-green-500",
            }));
        }
        if (item.path) {
            return {
                title: item.label,
                icon: item.icon,
                link: item.path,
                roles: item.roles,
                perusahaan: item.perusahaan,
                color: "text-green-500",
            };
        }
        return [];
    })
);
