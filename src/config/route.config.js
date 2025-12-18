import {
    faHome,
    faCalendarCheck,
    faUserEdit,
    faCheckSquare,
    faUserCheck,
    faEdit,
    faClock,
    faPlaneDeparture,
    faPenFancy,
    faHistory,
    faFileSignature,
    faBriefcase,
    faGift,
    faMoneyBillWave,
    faTasks,
    faListCheck,
    faFolderOpen,
    faPeopleGroup,
    faUsersCog,
    faUserGroup,
    faBuilding,
    faCalendarDays,
    faMapMarkerAlt,
    faTabletScreenButton,
    faKey,
    faUserShield,
    faUserGear,
} from "@fortawesome/free-solid-svg-icons";

export const routeConfig = [
    // =========================
    // BERANDA
    // =========================
    {
        path: "/home",
        meta: {
            label: "Dashboard",
            section: "Beranda",
            icon: faHome,
            roles: ["1", "2", "3", "4", "5", "6", "13", "20"],
        },
    },

    // =========================
    // ABSENSI & KEHADIRAN
    // =========================
    {
        path: "/absensi",
        meta: {
            label: "Formulir Absensi",
            section: "Absensi & Kehadiran",
            icon: faCalendarCheck,
            roles: ["5", "20"],
        },
    },
    {
        path: "/pengajuan-absensi",
        meta: {
            label: "Persetujuan Absensi",
            section: "Absensi & Kehadiran",
            icon: faCheckSquare,
            roles: ["1", "4", "5", "6", "18", "20"],
            perusahaan: ["1", "4"],
        },
    },
    {
        path: "/kelola-absensi",
        meta: {
            label: "Data Absensi Harian",
            section: "Absensi & Kehadiran",
            icon: faUserCheck,
            roles: ["1", "4", "6"],
            target: "_blank",
        },
    },
    {
        path: "/remark-absensi",
        meta: {
            label: "Remark Absensi",
            section: "Absensi & Kehadiran",
            icon: faEdit,
            roles: ["1", "4", "6"],
        },
    },

    // =========================
    // FORMULIR
    // =========================
    {
        path: "/lembur",
        meta: {
            label: "Formulir Lembur",
            section: "Formulir",
            icon: faClock,
            roles: ["5", "20"],
        },
    },
    {
        path: "/formulir-dinas",
        meta: {
            label: "Formulir Dinas",
            section: "Formulir",
            icon: faPlaneDeparture,
            roles: ["5", "20"],
        },
    },

    // =========================
    // PENGAJUAN & PERSETUJUAN
    // =========================
    {
        path: "/pengajuan-lembur",
        meta: {
            label: "Pengajuan Lembur",
            section: "Pengajuan & Persetujuan",
            icon: faPenFancy,
            roles: ["1", "4", "5", "6", "20"],
        },
    },
    {
        path: "/riwayat-lembur",
        meta: {
            label: "Riwayat Lembur",
            section: "Pengajuan & Persetujuan",
            icon: faHistory,
            roles: ["1", "4", "5", "6", "20"],
        },
    },
    {
        path: "/pengajuan-dinas",
        meta: {
            label: "Pengajuan Dinas",
            section: "Pengajuan & Persetujuan",
            icon: faFileSignature,
            roles: ["1", "4", "5", "6", "20"],
        },
    },
    {
        path: "/riwayat-surat-dinas",
        meta: {
            label: "Riwayat Dinas",
            section: "Pengajuan & Persetujuan",
            icon: faBriefcase,
            roles: ["1", "4", "5", "6", "20"],
        },
    },

    // =========================
    // PENGGAJIAN
    // =========================
    {
        path: "/rekap-tunjangan",
        meta: {
            label: "Rekap Tunjangan",
            section: "Penggajian",
            icon: faGift,
            roles: ["1"],
            perusahaan: ["1", "4"],
            target: "_blank",
        },
    },
    {
        path: "/shift",
        meta: {
            label: "Jam Kerja / Shift",
            section: "Penggajian",
            icon: faClock,
            roles: ["1", "4", "6"],
        },
    },
    {
        path: "/penggajian",
        meta: {
            label: "Penggajian (Periode Saat Ini)",
            section: "Penggajian",
            icon: faMoneyBillWave,
            roles: ["1", "4", "6"],
        },
    },
    {
        path: "/penggajian/riwayat",
        meta: {
            label: "Riwayat Penggajian",
            section: "Penggajian",
            icon: faHistory,
            roles: ["1", "4", "6"],
        },
    },

    // =========================
    // REMINDER & TUGAS
    // =========================
    {
        path: "/penugasan",
        meta: {
            label: "Reminder",
            section: "Reminder & Tugas",
            icon: faListCheck,
            roles: ["1", "4", "5", "20"],
        },
    },
    {
        path: "/penugasan/riwayat",
        meta: {
            label: "Riwayat Reminder",
            section: "Reminder & Tugas",
            icon: faFolderOpen,
            roles: ["1", "4", "5", "20"],
        },
    },

    // =========================
    // MANAJEMEN SDM
    // =========================
    {
        path: "/karyawan",
        meta: {
            label: "Data Karyawan",
            section: "Manajemen SDM",
            icon: faPeopleGroup,
            roles: ["1", "4", "6"],
        },
    },
    {
        path: "/divisi",
        meta: {
            label: "Kelola Divisi",
            section: "Manajemen SDM",
            icon: faUsersCog,
            roles: ["1", "4", "6"],
        },
    },
    {
        path: "/kadiv-member",
        meta: {
            label: "Kelola Kepala Divisi",
            section: "Manajemen SDM",
            icon: faUserGroup,
            roles: ["1", "4", "6"],
            perusahaan: ["1", "4"],
        },
    },
    {
        path: "/perusahaan",
        meta: {
            label: "Kelola Perusahaan",
            section: "Manajemen SDM",
            icon: faBuilding,
            roles: ["1", "4", "6"],
        },
    },
    {
        path: "/manajemen-hari-libur",
        meta: {
            label: "Manajemen Hari Libur",
            section: "Manajemen SDM",
            icon: faCalendarDays,
            roles: ["1"],
        },
    },

    // =========================
    // PENGATURAN SISTEM
    // =========================
    {
        path: "/lokasi-presensi",
        meta: {
            label: "Titik Lokasi Absensi",
            section: "Pengaturan Sistem",
            icon: faMapMarkerAlt,
            roles: ["1", "5"],
        },
    },
    {
        path: "/perangkat-absensi",
        meta: {
            label: "Perangkat Absensi",
            section: "Pengaturan Sistem",
            icon: faTabletScreenButton,
            roles: ["1"],
        },
    },
    {
        path: "/manajemen-menu",
        meta: {
            label: "Manajemen Menu",
            section: "Pengaturan Sistem",
            icon: faKey,
            roles: ["1"],
        },
    },
    {
        path: "/akses-hrd",
        meta: {
            label: "Akses HRD",
            section: "Pengaturan Sistem",
            icon: faUserShield,
            roles: ["1"],
        },
    },
    {
        path: "/role-app",
        meta: {
            label: "Role App",
            section: "Pengaturan Sistem",
            icon: faUserGear,
            roles: ["1"],
        },
    },
];
