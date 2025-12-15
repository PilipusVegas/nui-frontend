// src/data/menuConfig.js
import { faHome, faPeopleGroup, faUsersCog, faBuilding,faCalendarDays,faUserEdit,faUserCheck,faCheckSquare,faMoneyBillWave,faPlaneDeparture,faFileSignature,faBusinessTime,faTasks,faMapMarkerAlt,faTabletScreenButton,faKey,faUserShield,faListCheck,faHistory,faBriefcase,faClock,faFolderOpen,faEdit,faUserGear,faGift,faCalendarCheck,faUserGroup,faPenFancy} from "@fortawesome/free-solid-svg-icons";

export const menuConfig = [
    // =========================
    // BERANDA
    // =========================
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

    // =========================
    // ABSENSI & KEHADIRAN
    // =========================
    {
        sectionTitle: "Absensi & Kehadiran",
        items: [
            // FORMULIR (KARYAWAN)
            {
                label: "Formulir Absensi",
                icon: faCalendarCheck,
                path: "/absensi",
                roles: [5, 20],
            },

            // PENGELOLAAN & PERSETUJUAN
            {
                label: "Kelola Absensi",
                icon: faUserEdit,
                roles: [1, 4, 5, 6, 18, 20],
                submenu: [
                    {
                        label: "Persetujuan Absensi",
                        icon: faCheckSquare,
                        path: "/pengajuan-absensi",
                        roles: [1, 4, 5, 6, 18, 20],
                        perusahaan: [1, 4],
                    },
                    {
                        label: "Data Absensi Harian",
                        icon: faUserCheck,
                        path: "/kelola-absensi",
                        roles: [1, 4, 6],
                        target: "_blank",
                    },
                    {
                        label: "Remark Absensi",
                        icon: faEdit,
                        path: "/remark-absensi",
                        roles: [1, 4, 6],
                    },
                ],
            },
        ],
    },

    // =========================
    // FORMULIR (KARYAWAN)
    // =========================
    {
        sectionTitle: "Formulir",
        items: [
            {
                label: "Formulir Lembur",
                icon: faClock,
                path: "/lembur",
                roles: [5, 20],
            },
            {
                label: "Formulir Dinas",
                icon: faPlaneDeparture,
                path: "/formulir-dinas",
                roles: [5, 20],
            },
        ],
    },

    // =========================
    // PENGAJUAN & PERSETUJUAN
    // =========================
    {
        sectionTitle: "Pengajuan & Persetujuan",
        items: [
            {
                label: "Lembur",
                icon: faBusinessTime,
                roles: [1, 4, 5, 6, 20],
                submenu: [
                    {
                        label: "Pengajuan Lembur",
                        icon: faPenFancy,
                        path: "/pengajuan-lembur",
                        roles: [1, 4, 5, 6, 20],
                    },
                    {
                        label: "Riwayat Lembur",
                        icon: faHistory,
                        path: "/riwayat-lembur",
                        roles: [1, 4, 5, 6, 20],
                    },
                ],
            },
            {
                label: "Dinas",
                icon: faFileSignature,
                roles: [1, 4, 5, 6, 20],
                submenu: [
                    {
                        label: "Pengajuan Dinas",
                        icon: faFileSignature,
                        path: "/pengajuan-dinas",
                        roles: [1, 4, 5, 6, 20],
                    },
                    {
                        label: "Riwayat Dinas",
                        icon: faBriefcase,
                        path: "/riwayat-surat-dinas",
                        roles: [1, 4, 5, 6, 20],
                    },
                ],
            },
        ],
    },

    // =========================
    // PENGGAJIAN & TUNJANGAN
    // =========================
    {
        sectionTitle: "Penggajian",
        items: [
            {
                label: "Rekap Tunjangan",
                icon: faGift,
                path: "/rekap-tunjangan",
                roles: [1],
                perusahaan: [1, 4],
                target: "_blank",
            },
            {
                label: "Jam Kerja / Shift",
                icon: faClock,
                path: "/shift",
                roles: [1, 4, 6],
            },
            {
                label: "Penggajian",
                icon: faMoneyBillWave,
                roles: [1, 4, 6],
                submenu: [
                    {
                        label: "Periode Saat Ini",
                        icon: faPenFancy,
                        path: "/penggajian",
                        roles: [1, 4, 6],
                    },
                    {
                        label: "Riwayat Penggajian",
                        icon: faHistory,
                        path: "/penggajian/riwayat",
                        roles: [1, 4, 6],
                    },
                ],
            },
        ],
    },

    // =========================
    // REMINDER & TUGAS
    // =========================
    {
        sectionTitle: "Reminder & Tugas",
        items: [
            {
                label: "NICO Reminder",
                icon: faTasks,
                roles: [1, 4, 5, 20],
                submenu: [
                    {
                        label: "Reminder",
                        icon: faListCheck,
                        path: "/penugasan",
                        roles: [1, 4, 5, 20],
                    },
                    {
                        label: "Riwayat Reminder",
                        icon: faFolderOpen,
                        path: "/penugasan/riwayat",
                        roles: [1, 4, 5, 20],
                    },
                ],
            },
        ],
    },

    // =========================
    // MANAJEMEN SDM
    // =========================
    {
        sectionTitle: "Manajemen SDM",
        items: [
            {
                label: "Data Karyawan",
                icon: faPeopleGroup,
                path: "/karyawan",
                roles: [1, 4, 6],
            },
            {
                label: "Manajemen Divisi",
                icon: faUsersCog,
                roles: [1, 4, 6],
                submenu: [
                    {
                        label: "Kelola Divisi",
                        icon: faUsersCog,
                        path: "/divisi",
                        roles: [1, 4, 6],
                    },
                    {
                        label: "Kelola Kepala Divisi",
                        icon: faUserGroup,
                        path: "/kadiv-member",
                        roles: [1, 4, 6],
                        perusahaan: [1, 4],
                    },
                ],
            },
            {
                label: "Perusahaan",
                icon: faBuilding,
                roles: [1, 4, 6],
                submenu: [
                    {
                        label: "Kelola Perusahaan",
                        icon: faBuilding,
                        path: "/perusahaan",
                        roles: [1, 4, 6],
                    },
                    {
                        label: "Manajemen Hari Libur",
                        icon: faCalendarDays,
                        path: "/manajemen-hari-libur",
                        roles: [1],
                    },
                ],
            },
        ],
    },

    // =========================
    // PENGATURAN SISTEM
    // =========================
    {
        sectionTitle: "Pengaturan Sistem",
        items: [
            {
                label: "Titik Lokasi Absensi",
                icon: faMapMarkerAlt,
                path: "/lokasi-presensi",
                roles: [1, 5],
            },
            {
                label: "Perangkat Absensi",
                icon: faTabletScreenButton,
                path: "/perangkat-absensi",
                roles: [1],
            },
            {
                label: "Manajemen Menu",
                icon: faKey,
                path: "/manajemen-menu",
                roles: [1],
            },
            {
                label: "Akses HRD",
                icon: faUserShield,
                path: "/akses-hrd",
                roles: [1],
            },
            {
                label: "Role App",
                icon: faUserGear,
                path: "/role-app",
                roles: [1],
            },
            {
                label: "Kadiv Member",
                icon: faUserGroup,
                path: "/kadiv-member",
                roles: [1],
            },
        ],
    },
];

// =========================
// CARD CONFIG (HomeDesktop)
// =========================
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
