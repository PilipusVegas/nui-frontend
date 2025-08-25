// src/data/menuConfig.js
import { faHome, faPeopleGroup, faUsersCog, faCheckSquare, faUserCheck, faBook, faPenFancy, faLocationArrow, faBuilding, faCheckCircle, faClockRotateLeft, faKey, faTablet, faTabletAlt } from "@fortawesome/free-solid-svg-icons";

export const menuConfig = [
    {
        sectionTitle: "Beranda",
        items: [
            { label: "Dashboard", icon: faHome, path: "/home", roles: [1, 2, 3, 4, 5, 6, 13, 20] },
        ],
    },
    {
        sectionTitle: "Data & Tim",
        items: [
            { label: "Kelola Karyawan", icon: faPeopleGroup, path: "/karyawan", roles: [1, 4, 6] },
            { label: "Kelola Struktur Divisi", icon: faUsersCog, path: "/divisi", roles: [1, 4, 6] },
        ],
    },
    {
        sectionTitle: "Presensi & Jadwal",
        items: [
            { label: "Persetujuan Presensi", icon: faCheckSquare, path: "/persetujuan-presensi", roles: [1, 4, 5, 6, 13, 20], perusahaan: [1, 4] },
            { label: "Kelola Presensi", icon: faUserCheck, path: "/kelola-presensi", roles: [1, 4, 5, 6] },
            { label: "Kelola Jam Kerja", icon: faClockRotateLeft, path: "/shift", roles: [1, 4, 6] },
            { label: "Kelola Penggajian", icon: faBook, path: "/penggajian", roles: [1, 4, 6] },
        ],
    },
    {
        sectionTitle: "Pengajuan & Formulir",
        items: [
            { label: "Dinas Keluar Kantor", icon: faPenFancy, path: "/surat-dinas", roles: [1, 4, 5, 6] },
            { label: "Persetujuan Lembur", icon: faCheckCircle, path: "/persetujuan-lembur", roles: [1, 4, 5, 6, 20], perusahaan: [1, 4] },
        ],
    },
    {
        sectionTitle: "Master Data",
        items: [
            { label: "Titik Lokasi Absensi", icon: faLocationArrow, path: "/lokasi-presensi", roles: [1, 5] },
            { label: "Kelola Perusahaan", icon: faBuilding, path: "/perusahaan", roles: [1, 4, 6] },
            { label: "Kode Fitur Menu", icon: faKey, path: "/manajemen-menu", roles: [1] },
            { label: "Perangkat Absensi", icon: faTabletAlt, path: "/perangkat-absensi", roles: [1] },
        ],
    },
];

// Untuk HomeDesktop (cards) kita bisa transformasi dari menuConfig
export const cardConfig = menuConfig.flatMap(group =>
    group.items.flatMap(item => {
        // Kalau ada submenu → mapping submenu jadi card
        if (item.submenu) {
            return item.submenu.map(sub => ({
                title: sub.label,
                icon: sub.icon || item.icon, // fallback pakai icon induk
                link: sub.path,
                roles: sub.roles,
                perusahaan: sub.perusahaan,
                color: "text-green-500",
            }));
        }

        // Kalau bukan submenu → card biasa
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

        return []; // skip kalau gak ada path
    })
);
