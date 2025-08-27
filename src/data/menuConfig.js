// src/data/menuConfig.js
import { 
    faHome, faPeopleGroup, faUsersCog, faCheckSquare, faUserCheck, 
    faBook, faPenFancy, faLocationArrow, faBuilding, faCheckCircle, 
    faClockRotateLeft, faKey, faTabletAlt 
} from "@fortawesome/free-solid-svg-icons";

export const menuConfig = [
    // 1. BERANDA
    {
        sectionTitle: "Beranda",
        items: [
            { label: "Dashboard", icon: faHome, path: "/home", roles: [1,2,3,4,5,6,13,20] },
        ],
    },

    // 2. MANAJEMEN ORGANISASI
    {
        sectionTitle: "Manajemen Organisasi",
        items: [
            { label: "Karyawan", icon: faPeopleGroup, path: "/karyawan", roles: [1,4,6] },
            { label: "Struktur Divisi", icon: faUsersCog, path: "/divisi", roles: [1,4,6] },
            { label: "Perusahaan", icon: faBuilding, path: "/perusahaan", roles: [1,4,6] },
        ],
    },

    // 3. PRESENSI & PENGGAJIAN
    {
        sectionTitle: "Presensi & Penggajian",
        items: [
            { label: "Presensi Harian", icon: faUserCheck, path: "/kelola-presensi", roles: [1,4,5,6] },
            { label: "Persetujuan Presensi", icon: faCheckSquare, path: "/persetujuan-presensi", roles: [1,4,5,6,13,20], perusahaan: [1,4] },
            { label: "Jam Kerja / Shift", icon: faClockRotateLeft, path: "/shift", roles: [1,4,6] },
            { label: "Penggajian", icon: faBook, path: "/penggajian", roles: [1,4,6] },
        ],
    },

    // 4. PENGAJUAN & PERSETUJUAN
    {
        sectionTitle: "Pengajuan & Persetujuan",
        items: [
            { label: "Dinas Keluar Kantor", icon: faPenFancy, path: "/surat-dinas", roles: [1,4,5,6] },
            { label: "Pengajuan Lembur", icon: faCheckCircle, path: "/persetujuan-lembur", roles: [1,4,5,6,20], perusahaan: [1,4] },
            { label: "Riwayat Lembur", icon: faClockRotateLeft, path: "/riwayat-lembur", roles: [1,4,5,6,20], perusahaan: [1,4] },
        ],
    },

    // 5. PENGATURAN SISTEM
    {
        sectionTitle: "Pengaturan Sistem",
        items: [
            { label: "Titik Lokasi Absensi", icon: faLocationArrow, path: "/lokasi-presensi", roles: [1,5] },
            { label: "Perangkat Absensi", icon: faTabletAlt, path: "/perangkat-absensi", roles: [1] },
            { label: "Manajemen Menu", icon: faKey, path: "/manajemen-menu", roles: [1] },
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
