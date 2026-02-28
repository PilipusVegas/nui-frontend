import {
    faHome,
    faPeopleGroup,
    faUsersCog,
    faBuilding,
    faCalendarDays,
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
    faUserGear,
    faGift,
    faCalendarCheck,
    faUserGroup,
    faPenFancy,
    faListAlt,
    faTimesCircle,
    faHelmetSafety,
    faGasPump,
    faMapLocationDot,
    faBicycle,
    faUserTag,
    faMotorcycle,
    faCarSide,
    faUsersGear
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

    // MANAJEMEN SDM
    {
        sectionTitle: "Manajemen SDM",
        items: [
            {
                label: "Data Karyawan",
                icon: faPeopleGroup,
                roles: [1, 4, 6],
                submenu: [
                    {
                        label: "Kelola Karyawan",
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
                        label: "Kendaraan Karyawan",
                        icon: faUserGear,
                        path: "/kendaraan-karyawan",
                        roles: [1],
                        perusahaan: [1, 4],
                    },
                ],
            },
            {
                label: "Struktur Organisasi",
                icon: faUsersCog,
                roles: [1, 4, 6],
                submenu: [
                    {
                        label: "Data Divisi",
                        icon: faUsersCog,
                        path: "/divisi",
                        roles: [1, 4, 6],
                    },
                    {
                        label: "Data Kepala Divisi",
                        icon: faUserGroup,
                        path: "/kadiv-member",
                        roles: [1, 4, 6],
                        perusahaan: [1, 4],
                    },
                ],
            },
            {
                label: "Manajemen Tim",
                icon: faUserGroup,
                roles: [1, 5, 20],
                submenu: [
                    {
                        label: "Kelola Anggota Tim",
                        icon: faUserGroup,
                        path: "/kelola-anggota-tim",
                        roles: [1, 5, 20],
                        perusahaan: [1, 4],
                    },
                ],
            },
            {
                label: "Jadwal Kerja",
                icon: faCalendarCheck,
                roles: [1, 5, 20],
                submenu: [
                    {
                        label: "Penjadwalan Karyawan",
                        icon: faCalendarCheck,
                        path: "/penjadwalan",
                        roles: [1, 5, 20],
                        perusahaan: [1, 4],
                    },
                ],
            }
        ],
    },
    {
        sectionTitle: "Manajemen Perusahaan",
        items: [
            {
                label: "Data Perusahaan",
                icon: faBuilding,
                path: "/perusahaan",
                roles: [1, 4, 6],
            },
            {
                label: "Data Shift",
                icon: faClock,
                path: "/shift",
                roles: [1, 4, 6],
            },
            {
                label: "Kelola Shift Perusahaan",
                icon: faBuilding,
                path: "/shift-perusahaan",
                roles: [1, 4, 6],
            },
        ],
    },

    // ABSENSI
    {
        sectionTitle: "Manajemen Absensi",
        items: [
            {
                label: "Formulir Absensi",
                icon: faCalendarCheck,
                path: "/absensi",
                roles: [1, 5, 20],
            },
            {
                label: "Kelola Presensi Karyawan",
                icon: faUserCheck,
                path: "/kelola-absensi",
                roles: [1, 4, 6],
                target: "_blank",
            },
            {
                label: "Absensi Lapangan",
                icon: faHelmetSafety,
                roles: [1, 4, 5, 6, 18, 20],
                submenu: [
                    {
                        label: "Absensi Tidak Valid",
                        icon: faTimesCircle,
                        path: "/absensi-tidak-valid",
                        roles: [1, 4, 5, 6],
                        perusahaan: [1, 4],
                    },
                    {
                        label: "Monitoring Absensi",
                        icon: faCheckSquare,
                        path: "/monitoring-absensi",
                        roles: [1, 4, 5, 6, 18, 20],
                        perusahaan: [1, 4],
                    },
                    {
                        label: "Riwayat Absensi",
                        icon: faCalendarDays,
                        path: "/riwayat-absensi-lapangan",
                        roles: [1, 4, 5, 6, 18, 20],
                        perusahaan: [1, 4],
                    },
                ],
            }
            // {
            //     label: "Remark Absensi",
            //     icon: faEdit,
            //     path: "/remark-absensi",
            //     roles: [1, 4, 5, 6, 18, 20],
            // },
        ],
    },

    // PENGAJUAN (KARYAWAN)
    {
        sectionTitle: "Menu Pengajuan",
        items: [
            {
                label: "Formulir Dinas",
                icon: faPlaneDeparture,
                path: "/formulir-dinas",
                roles: [1, 5, 20],
            },
        ],
    },

    // PENGAJUAN & PERSETUJUAN (HRD / ATASAN)
    {
        sectionTitle: "Permohonan & Riwayat",
        items: [
            {
                label: "Absensi Tim",
                icon: faUserGroup,
                roles: [1, 5, 20],
                perusahaan: [1, 4],
                submenu: [
                    {
                        label: "Permohonan Absensi Tim",
                        icon: faPenFancy,
                        path: "/permohonan-absensi-tim",
                        roles: [1, 4, 5, 6, 20],
                    },
                ],
            },
            {
                label: "Lembur",
                icon: faBusinessTime,
                roles: [1, 4, 5, 6, 20],
                perusahaan: [1, 4],
                submenu: [
                    {
                        label: "Daftar permohonan Lembur",
                        icon: faPenFancy,
                        path: "/permohonan-lembur",
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
                perusahaan: [1, 4],
                submenu: [
                    {
                        label: "Daftar permohonan Dinas",
                        icon: faFileSignature,
                        path: "/permohonan-dinas",
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
            {
                label: "Kunjungan",
                icon: faMapLocationDot,
                roles: [1, 4, 5, 6, 20],
                submenu: [
                    {
                        label: "Permohonan Kunjungan",
                        icon: faPenFancy,
                        path: "/permohonan-kunjungan",
                        roles: [1, 5, 20],
                    },
                    {
                        label: "Riwayat Kunjungan",
                        icon: faHistory,
                        path: "/riwayat-permohonan-kunjungan",
                        roles: [1, 4, 5, 6, 20],
                    },
                ],
            },
        ],
    },

    // PENGGAJIAN & TUNJANGAN
    {
        sectionTitle: "Rekap Penggajian",
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
        sectionTitle: "NICO Reminder & Riwayat",
        items: [
            {
                label: "NICO Reminder",
                icon: faTasks,
                roles: [1, 5, 20],
                submenu: [
                    {
                        label: "Daftar Reminder",
                        icon: faListCheck,
                        path: "/penugasan",
                        roles: [1, 5, 20],
                    },
                    {
                        label: "Riwayat Reminder",
                        icon: faFolderOpen,
                        path: "/penugasan/riwayat",
                        roles: [1, 5, 20],
                    },
                ],
            },
        ],
    },

    {
        sectionTitle: "Manajemen Operasional",
        items: [
            {
                label: "Data Lokasi",
                icon: faMapMarkerAlt,
                path: "/data-lokasi",
                roles: [1, 4, 5, 6, 20],
            },
            {
                label: "Data Kendaraan",
                icon: faBicycle,
                path: "/data-kendaraan",
                roles: [1, 4, 5, 6, 20],
            },
            {
                label: "Data Jenis BBM",
                icon: faGasPump,
                path: "/jenis-bbm",
                roles: [1, 5, 20],
            },

        ],
    },


    // PENGATURAN SISTEM
    {
        sectionTitle: "Pengaturan Sistem",
        items: [
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
