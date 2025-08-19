// src/data/menuConfig.js
import { faHome, faPeopleGroup, faUsersCog, faCheckSquare, faUserCheck, faBook, faPenFancy, faLocationArrow, faBuilding, faCheckCircle, faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";

export const menuConfig = [
    {
        sectionTitle: "Menu Utama",
        items: [
            { label: "Dashboard", icon: faHome, path: "/home", roles: [1, 2, 3, 4, 5, 6, 13, 20] },
        ],
    },
    {
        sectionTitle: "Manajemen Karyawan",
        items: [
            { label: "Kelola Karyawan", icon: faPeopleGroup, path: "/karyawan", roles: [1, 4, 6] },
            { label: "Kelola Struktur Divisi", icon: faUsersCog, path: "/divisi", roles: [1, 4, 6] },
        ],
    },
    {
        sectionTitle: "Manajemen Presensi",
        items: [
            { label: "Persetujuan Presensi", icon: faCheckSquare, path: "/persetujuan-presensi", roles: [1, 4, 5, 6, 13, 20], perusahaan: [1, 4] },
            { label: "Kelola Presensi", icon: faUserCheck, path: "/kelola-presensi", roles: [1, 4, 5, 6] },
            { label: "Kelola Jam Kerja", icon: faClockRotateLeft, path: "/shift", roles: [1, 4, 6] },
            { label: "Kelola Penggajian", icon: faBook, path: "/penggajian", roles: [1, 4, 6] },
        ],
    },
    {
        sectionTitle: "E-Form",
        items: [
            { label: "Dinas Keluar Kantor", icon: faPenFancy, path: "/surat-dinas", roles: [1, 4, 5, 6] },
        ],
    },
    {
        sectionTitle: "Lainnya",
        items: [
            { label: "Persetujuan Lembur", icon: faCheckCircle, path: "/persetujuan-lembur", roles: [1, 4, 5, 6, 20], perusahaan: [1, 4] },
            { label: "Titik Lokasi Absensi", icon: faLocationArrow, path: "/lokasi-presensi", roles: [1, 5] },
            { label: "Kelola Perusahaan", icon: faBuilding, path: "/perusahaan", roles: [1, 4, 6] },
        ],
    },
];

// Untuk HomeDesktop (cards) kita bisa transformasi dari menuConfig
export const cardConfig = menuConfig.flatMap(group =>
    group.items
        .filter(item => item.path) // ambil yg punya path
        .map(item => ({
            title: item.label,
            icon: item.icon,
            link: item.path,
            roles: item.roles,
            perusahaan: item.perusahaan,
            // tambahkan warna default agar tampil beda
            color: "text-green-500"
        }))
);
