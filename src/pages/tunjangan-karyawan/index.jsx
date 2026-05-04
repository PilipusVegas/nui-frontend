import React, { useEffect, useMemo, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faPlus,
  faEdit,
  faGasPump,
  faUtensils,
  faHotel,
  faBriefcase,
  faInfo,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import {
  SectionHeader,
  Modal,
  DataView,
  Badge,
  FilterSelect,
  Button,
} from "../../components";
import TunjanganDetail from "./show";
import TunjanganForm from "./form";
import Swal from "sweetalert2";

const tunjanganMeta = [
  { key: "bensin", label: "Bensin", icon: faGasPump, variant: "warning" },
  { key: "makan", label: "Makan", icon: faUtensils, variant: "success" },
  { key: "penginapan", label: "Penginapan", icon: faHotel, variant: "purple" },
  { key: "dinas", label: "Dinas", icon: faBriefcase, variant: "info" },
];

const renderTunjanganBadge = (active, label, icon, variant) => (
  <Badge
    key={label}
    variant={active ? variant : "neutral"}
    tone={active ? "soft" : "outline"}
    size="xs"
    rounded="full"
    icon={<FontAwesomeIcon icon={icon} />}
  >
    {label}
  </Badge>
);

const TunjanganKaryawan = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editData, setEditData] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchWithJwt(`${apiUrl}/tunjangan/user`);
      const json = await res.json();
      if (json.success) {
        setList(Array.isArray(json.data) ? json.data : []);
      } else {
        setList([]);
      }
    } catch (err) {
      setError(err?.message || "Terjadi kesalahan saat mengambil data.");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const roleOptions = useMemo(() => {
    const roles = list.map((item) => item?.role).filter(Boolean);
    const uniqueRoles = [...new Set(roles)];

    return [
      { label: "Semua Divisi", value: "ALL" },
      ...uniqueRoles.map((role) => ({
        label: role,
        value: role,
      })),
    ];
  }, [list]);

  const filteredByRole = useMemo(() => {
    if (roleFilter === "ALL") return list;
    return list.filter((item) => item?.role === roleFilter);
  }, [list, roleFilter]);

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: "Hapus tunjangan?",
      text: `Tunjangan ${item.nama ?? "-"} akan dihapus`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    try {
      await fetchWithJwt(`${apiUrl}/tunjangan/user/${item.id_user}`, {
        method: "DELETE",
      });
      Swal.fire({
        icon: "success",
        title: "Tunjangan berhasil dihapus",
        timer: 1200,
        showConfirmButton: false,
      });
      fetchData();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gagal menghapus tunjangan",
      });
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "nip",
        label: "NIP",
        align: "text-center",
        cellClassName: "text-center whitespace-nowrap",
      },
      {
        key: "nama",
        label: "Nama Karyawan",
        cellClassName: "font-semibold text-slate-900 min-w-[160px]",
      },
      {
        key: "role",
        label: "Divisi",
        cellClassName: "text-sm text-slate-600 whitespace-nowrap",
      },
      {
        key: "tunjangan",
        label: "Daftar Tunjangan",
        align: "text-center",
        render: (row) => (
          <div className="flex flex-wrap justify-center gap-1.5">
            {tunjanganMeta.map((item) =>
              renderTunjanganBadge(
                Boolean(row?.[item.key]),
                item.label,
                item.icon,
                item.variant,
              ),
            )}
          </div>
        ),
      },
      {
        key: "menu",
        label: "Menu",
        align: "text-center",
        isAction: true,
        render: (row) => (
          <div className="flex flex-wrap justify-center gap-1.5">
            <Button
              size="sm"
              variant="detail"
              icon={faEye}
              onClick={() => {
                setSelected(row);
                setDetailOpen(true);
              }}
            >
              Detail
            </Button>

            <Button
              size="sm"
              variant="warning"
              icon={faEdit}
              onClick={() => {
                setEditData(row);
                setFormOpen(true);
              }}
            >
              Edit
            </Button>

            <Button
              size="sm"
              variant="danger"
              icon={faTrash}
              onClick={() => handleDelete(row)}
            >
              Hapus
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="w-full animate-fadeIn">
      <SectionHeader
        title="Tunjangan Karyawan"
        subtitle="Mengelola data penerima tunjangan karyawan secara terpusat."
        onBack={() => navigate(-1)}
        actions={
          <div className="flex gap-2">
            <Button
              variant="primary"
              icon={faPlus}
              onClick={() => {
                setEditData(null);
                setFormOpen(true);
              }}
            >
              Tambah
            </Button>

            <Button
              variant="detail"
              icon={faInfo}
              onClick={() => setInfoOpen(true)}
            >
              Info
            </Button>
          </div>
        }
      />

      <DataView
        data={filteredByRole}
        columns={columns}
        searchable
        searchKeys={["nama", "nip", "perusahaan", "role"]}
        searchPlaceholder="Cari nama, NIP, perusahaan, atau divisi..."
        isLoading={loading}
        error={error}
        onRetry={fetchData}
        loadingMessage="Memuat data tunjangan..."
        emptyTitle="Data tunjangan belum tersedia"
        emptyMessage="Belum ada data tunjangan yang dapat ditampilkan."
        header={
          <div className="w-full md:w-56">
            <FilterSelect
              label="Filter Divisi"
              options={roleOptions}
              value={roleFilter}
              onChange={(value) => setRoleFilter(value || "ALL")}
              placeholder="Semua Divisi"
              isClearable={false}
            />
          </div>
        }
        showIndex={true}
        tableClassName="border-slate-200"
        paginationClassName="pt-2"
      />

      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={`Detail Tunjangan ${selected?.nama ?? ""}`}
        note={`Nama karyawan: ${selected?.nama ?? "-"}`}
        size="xl"
      >
        <TunjanganDetail data={selected} />
      </Modal>

      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editData ? "Edit Tunjangan" : "Tambah Tunjangan"}
      >
        <TunjanganForm
          editData={editData}
          onSuccess={() => {
            setFormOpen(false);
            fetchData();
          }}
        />
      </Modal>

      <Modal
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
        title="Informasi Tunjangan Karyawan"
        note="Penjelasan jenis tunjangan, syarat pemberian, serta ketentuan perhitungan dalam sistem."
        size="lg"
      >
        <div className="space-y-5 text-sm text-gray-700 leading-relaxed">
          <div>
            <p className="font-medium text-gray-800 mb-1">Gambaran Umum</p>
            <p>
              Menu <b>Tunjangan Karyawan</b> digunakan untuk mengatur hak
              tunjangan yang diterima karyawan berdasarkan aktivitas kerja,
              lokasi penugasan, serta persetujuan absensi atau lembur.
            </p>
          </div>

          <div>
            <p className="font-medium text-gray-800 mb-2">
              Jenis Tunjangan & Ketentuan
            </p>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <FontAwesomeIcon
                  icon={faUtensils}
                  className="text-green-500 mt-1"
                />
                <div>
                  <p className="font-semibold">Tunjangan Voucher Makan</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>
                      Karyawan telah ditandai berhak menerima tunjangan ini.
                    </li>
                    <li>Minimal lembur 5 jam di gerai Jabodetabek.</li>
                    <li>Tidak sedang melakukan perjalanan dinas.</li>
                    <li>Tidak berlaku untuk lembur pada hari Minggu.</li>
                    <li>Hanya dihitung jika lembur disetujui.</li>
                  </ul>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <FontAwesomeIcon
                  icon={faGasPump}
                  className="text-orange-500 mt-1"
                />
                <div>
                  <p className="font-semibold">Tunjangan Uang Bensin</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>
                      Karyawan telah ditandai berhak menerima uang bensin.
                    </li>
                    <li>Melakukan absensi di gerai, bukan kantor.</li>
                    <li>Lokasi kerja berada di wilayah Jabodetabek.</li>
                    <li>Tidak sedang melakukan perjalanan dinas.</li>
                    <li>Hanya dihitung jika absensi disetujui.</li>
                  </ul>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <FontAwesomeIcon
                  icon={faHotel}
                  className="text-indigo-500 mt-1"
                />
                <div>
                  <p className="font-semibold">Tunjangan Biaya Penginapan</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>
                      Karyawan telah ditandai berhak menerima biaya penginapan.
                    </li>
                    <li>Melakukan absensi shift malam 1 atau shift malam 2.</li>
                    <li>Absensi dilakukan di gerai wilayah Jabodetabek.</li>
                    <li>Karyawan tidak sedang berdinas.</li>
                    <li>Hanya dihitung jika absensi disetujui.</li>
                  </ul>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <FontAwesomeIcon
                  icon={faBriefcase}
                  className="text-blue-500 mt-1"
                />
                <div>
                  <p className="font-semibold">Tunjangan Perjalanan Dinas</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>
                      Diberikan kepada karyawan yang bertugas ke luar
                      Jabodetabek.
                    </li>
                    <li>
                      Pada hari dinas, hanya tunjangan perjalanan dinas yang
                      berlaku.
                    </li>
                    <li>Tunjangan lain tidak berlaku pada hari dinas.</li>
                    <li>Karyawan wajib melakukan absensi pada hari dinas.</li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-medium text-gray-800 mb-2">Status Ikon</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={faGasPump} className="text-orange-500" />
                <span>
                  Ikon berwarna menandakan tunjangan aktif dan berlaku.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <FontAwesomeIcon icon={faGasPump} className="text-gray-300" />
                <span>Ikon abu-abu menandakan tunjangan tidak aktif.</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="font-medium text-blue-800 mb-1">Catatan Penting</p>
            <ul className="list-disc pl-5 text-blue-800 space-y-1">
              <li>Seluruh tunjangan hanya dihitung jika status disetujui.</li>
              <li>Status reject otomatis membuat tunjangan hangus.</li>
              <li>Pastikan penandaan hak tunjangan dilakukan dengan benar.</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TunjanganKaryawan;
