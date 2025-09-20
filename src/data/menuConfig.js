// src/data/menuConfig.js
import { faHome, faPeopleGroup, faUsersCog, faCheckSquare, faUserCheck, faBook, faPenFancy, faLocationArrow, faBuilding, faCheckCircle, faClockRotateLeft, faKey, faTabletAlt, faCalendarDays, faUserAltSlash, faUserEdit } from "@fortawesome/free-solid-svg-icons";

export const menuConfig = [
    // 1. BERANDA
    {
        sectionTitle: "Beranda",
        items: [
            { label: "Dashboard", icon: faHome, path: "/home", roles: [1, 2, 3, 4, 5, 6, 13, 20] },
        ],
    },

    // 2. MANAJEMEN ORGANISASI
    {
        sectionTitle: "Manajemen Organisasi",
        items: [
            { label: "Karyawan", icon: faPeopleGroup, path: "/karyawan", roles: [1, 4, 6] },
            { label: "Struktur Divisi", icon: faUsersCog, path: "/divisi", roles: [1, 4, 6] },
            {
                label: "Kelola Perusahaan",
                icon: faBuilding,
                roles: [1, 4, 6],
                submenu: [
                    { label: "Perusahaan", icon: faBuilding, path: "/perusahaan", roles: [1, 4, 6] },
                    { label: "Manajemen Hari Libur", icon: faCalendarDays, path: "/manajemen-hari-libur", roles: [1] },
                ]
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
                    { label: "Persetujuan Absensi", icon: faCheckSquare, path: "/persetujuan-absensi", roles: [1, 4, 5, 6, 13, 20], perusahaan: [1, 4] },
                    { label: "Data Absensi Harian", icon: faUserCheck, path: "/kelola-presensi", roles: [1, 4, 5, 6] },
                    { label: "Remark Absensi", icon: faUserEdit, path: "/remark-absensi", roles: [1], }
                ]
            },
            { label: "Jam Kerja / Shift", icon: faClockRotateLeft, path: "/shift", roles: [1, 4, 6] },
            { label: "Penggajian", icon: faBook, path: "/penggajian", roles: [1, 4, 6] },
        ],
    },

    {
        sectionTitle: "Pengajuan & Riwayat",
        items: [
            {
                label: "Dinas Keluar Kantor", icon: faPenFancy, roles: [1, 4, 5, 6],
                submenu: [
                    { label: "Pengajuan Dinas", path: "/surat-dinas", roles: [1, 4, 5, 6] },
                    { label: "Riwayat Dinas", path: "/surat-dinas/riwayat", roles: [1, 4, 5, 6] },
                ]
            },
            {
                label: "Lembur", icon: faCheckCircle, roles: [1, 4, 5, 6, 20],
                submenu: [
                    { label: "Pengajuan Lembur", path: "/persetujuan-lembur", roles: [1, 4, 5, 6, 20] },
                    { label: "Riwayat Lembur", path: "/riwayat-lembur", roles: [1, 4, 5, 6, 20] },
                ]
            },
        ]
    },

    // 5. PENGATURAN SISTEM
    {
        sectionTitle: "Pengaturan Sistem",
        items: [
            { label: "Titik Lokasi Absensi", icon: faLocationArrow, path: "/lokasi-presensi", roles: [1, 5] },
            { label: "Perangkat Absensi", icon: faTabletAlt, path: "/perangkat-absensi", roles: [1] },
            { label: "Manajemen Menu", icon: faKey, path: "/manajemen-menu", roles: [1] },
            { label: "Manajemen Hari Libur", icon: faBook, path: "/manajemen-hari-libur", roles: [1, 4, 6] },
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
