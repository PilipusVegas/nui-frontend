import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faUserTie,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Tambah from "./Tambah";
import Show from "./Show";
import { Modal } from "../../components";
import {
  SectionHeader,
  LoadingSpinner,
  ErrorState,
  EmptyState,
} from "../../components";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";

const KelolaAnggotaTim = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [groupList, setGroupList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openTambah, setOpenTambah] = useState(false);
  const [openShow, setOpenShow] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedGroupName, setSelectedGroupName] = useState("");

  const fetchGroupKadiv = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = getUserFromToken();

      // Validasi Kadiv
      if (!user?.is_kadiv?.status || !user?.is_kadiv?.id) {
        throw new Error("Akses ditolak. Anda bukan Kepala Divisi.");
      }
      const idKadiv = user.is_kadiv.id;

      const res = await fetchWithJwt(
        `${apiUrl}/profil/kadiv-access/group/kadiv/${idKadiv}`,
      );

      if (!res.ok) {
        throw new Error("Gagal memuat data tim Kadiv");
      }

      const result = await res.json();
      setGroupList(result.data ?? []);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupKadiv();
  }, []);

  const handleDeleteGroup = async (id, nama) => {
    const confirm = await Swal.fire({
      title: "Hapus Grup?",
      text: `Grup "${nama}" akan dihapus permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });
    if (!confirm.isConfirmed) return;
    try {
      const res = await fetchWithJwt(
        `${apiUrl}/profil/kadiv-access/group/${id}`,
        {
          method: "DELETE",
        },
      );
      // ⛔ Ambil message dari backend
      if (!res.ok) {
        let errorMessage = "Gagal menghapus grup";
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // kalau response bukan JSON
        }

        throw new Error(errorMessage);
      }
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Grup berhasil dihapus",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchGroupKadiv();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.message || "Terjadi kesalahan",
      });
    }
  };

  return (
    <>
      <div className="w-full mx-auto">
        <SectionHeader
          title="Kelola Anggota Tim"
          subtitle="Manajemen grup dan tim kerja yang berada di bawah tanggung jawab Anda."
          onBack={() => navigate(-1)}
          actions={
            <button
              onClick={() => setOpenTambah(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Tambah Grup</span>
            </button>
          }
        />

        <div className="mt-6">
          {loading && <LoadingSpinner message="Memuat data tim..." />}

          {!loading && error && (
            <ErrorState
              title="Gagal Memuat Data Tim"
              message={error}
              onRetry={fetchGroupKadiv}
            />
          )}

          {!loading && !error && groupList.length === 0 && (
            <EmptyState
              title="Belum Ada Grup Tim"
              description="Saat ini Anda belum memiliki grup tim yang dikelola."
              icon={faUsers}
              actionText="Tambah Grup"
              onAction={() => navigate("/kelola-tim/tambah")}
            />
          )}

          {!loading && !error && groupList.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {groupList.map((group) => {
                const hasLeader = Boolean(group.id_leader);

                return (
                  <div
                    key={group.id}
                    onClick={() => {
                      setSelectedGroupId(group.id);
                      setSelectedGroupName(group.nama_grup);
                      setOpenShow(true);
                    }}
                    className="group bg-white border border-gray-300 rounded-xl p-4 py-2 pb-3 cursor-pointer transition hover:shadow-lg"
                  >
                    {/* HEADER */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {group.nama_grup}
                      </h3>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGroup(group.id, group.nama_grup);
                        }}
                        className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full hover:bg-red-200 hover:text-red-700 transition active:scale-95"
                        title="Hapus Grup"
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-sm" />
                      </button>
                    </div>

                    {/* LEADER */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center 
                ${
                  hasLeader
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
                      >
                        <FontAwesomeIcon icon={faUserTie} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Team Leader</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {hasLeader ? group.nama_leader : "Belum ditentukan"}
                        </p>
                      </div>
                    </div>

                    {/* FOOTER */}
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <FontAwesomeIcon
                          icon={faUsers}
                          className="text-gray-400"
                        />
                        <span>{group.total_member} Anggota</span>
                      </div>

                      <span
                        className={`text-xs font-medium ${
                          hasLeader ? "text-green-600" : "text-orange-500"
                        }`}
                      >
                        {hasLeader ? "Leader aktif" : "Belum ada leader"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={openTambah}
        onClose={() => setOpenTambah(false)}
        title="Tambah Grup Tim"
        note="Buat grup kerja baru di bawah tanggung jawab Anda sebagai Kepala Divisi."
        size="sm"
        footer={null}
      >
        <Tambah
          onSuccess={() => {
            setOpenTambah(false);
            fetchGroupKadiv();
          }}
          onCancel={() => setOpenTambah(false)}
        />
      </Modal>
      <Modal
        isOpen={openShow}
        onClose={() => {
          setOpenShow(false);
          setSelectedGroupId(null);
          setSelectedGroupName("");
        }}
        title={`Detail Grup ${selectedGroupName}`}
        note="Halaman ini menampilkan struktur tim dalam grup ini. Anda dapat melihat siapa yang menjadi Team Leader dan mengatur peran anggota sesuai kebutuhan."
        size="lg"
      >
        {selectedGroupId && (
          <Show idGroup={selectedGroupId} onUpdate={fetchGroupKadiv} />
        )}
      </Modal>
    </>
  );
};

export default KelolaAnggotaTim;
