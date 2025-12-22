import {
    faHome,
    faPeopleGroup,
    faUsersCog,
    faBuilding,
    faCalendarDays,
    faUserEdit,
    faUserCheck,
    faCheckSquare,
    faMoneyBillWave,
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
    faFolderOpen,
    faEdit,
    faUserGear,
    faGift,
    faCalendarCheck,
    faUserGroup,
    faPenFancy,
    faListAlt
} from "@fortawesome/free-solid-svg-icons";

export const menuConfig = [
    // BERANDA
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

    // ABSENSI
    {
        sectionTitle: "Absensi",
        items: [
            {
                label: "Absensi",
                icon: faCalendarCheck,
                path: "/absensi",
                roles: [5, 20],
            },
            {
                label: "Manajemen Absensi",
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

    // PENGAJUAN (KARYAWAN)
    {
        sectionTitle: "Pengajuan",
        items: [
            {
                label: "Pengajuan Lembur",
                icon: faClock,
                path: "/lembur",
                roles: [5, 20],
            },
            {
                label: "Pengajuan Dinas",
                icon: faPlaneDeparture,
                path: "/formulir-dinas",
                roles: [5, 20],
            },
        ],
    },

    // PENGAJUAN & PERSETUJUAN (HRD / ATASAN)
    {
        sectionTitle: "Pengajuan & Persetujuan",
        items: [
            {
                label: "Lembur",
                icon: faBusinessTime,
                roles: [1, 4, 5, 6, 20],
                submenu: [
                    {
                        label: "Daftar Pengajuan Lembur",
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
                        label: "Daftar Pengajuan Dinas",
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

    // PENGGAJIAN & TUNJANGAN
    {
        sectionTitle: "Penggajian & Tunjangan",
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
                label: "Shift & Jam Kerja",
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
                        label: "Periode Aktif",
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

    // REMINDER
    {
        sectionTitle: "NICO Reminder",
        items: [
            {
                label: "Reminder",
                icon: faTasks,
                roles: [1, 4, 5, 20],
                submenu: [
                    {
                        label: "Daftar Reminder",
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

    // MANAJEMEN SDM
    {
        sectionTitle: "Manajemen SDM",
        items: [
            {
                label: "Kelola Karyawan",
                icon: faPeopleGroup,
                roles: [1, 4, 6],
                submenu: [
                    {
                        label: "Kelola Data Karyawan",
                        icon: faUserGroup,
                        path: "/karyawan",
                        roles: [1, 4, 6],
                    },
                    {
                        label: "Tunjangan Karyawan",
                        icon: faMoneyBillWave,
                        path: "/tunjangan-karyawan",
                        roles: [1, 4, 6],
                        perusahaan: [1, 4],
                    },
                    {
                        label: "Kelola Data Divisi",
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

                ]
            },
            {
                label: "Kelola Perusahaan",
                icon: faBuilding,
                roles: [1, 4, 6],
                submenu: [
                    {
                        label: "Data Perusahaan",
                        icon: faBuilding,
                        path: "/perusahaan",
                        roles: [1, 4, 6],
                    },
                    {
                        label: "Hari Libur",
                        icon: faCalendarDays,
                        path: "/manajemen-hari-libur",
                        roles: [1],
                    },
                ],
            },
        ],
    },

    // PENGATURAN SISTEM
    {
        sectionTitle: "Pengaturan Sistem",
        items: [
            {
                label: "Lokasi Absensi",
                icon: faMapMarkerAlt,
                path: "/lokasi-presensi",
                roles: [1],
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
                label: "Role Aplikasi",
                icon: faUserGear,
                path: "/role-app",
                roles: [1],
            },
            {
                label: "Log Sistem",
                icon: faListAlt,
                path: "/log-sistem",
                roles: [1],
            },
        ],
    },
];

// CARD CONFIG (HomeDesktop)
export const cardConfig = menuConfig.flatMap(section =>
    section.items.flatMap(item => {
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
