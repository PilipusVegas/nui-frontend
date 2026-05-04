import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faUserTie,
  faPlus,
  faTrash,
  faEye,
} from "@fortawesome/free-solid-svg-icons";

import {
  SectionHeader,
  Modal,
  DataView,
  Button,
  Badge,
  CardView,
} from "../../components";

import Tambah from "./Tambah";
import Show from "./Show";
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

      if (!user?.is_kadiv?.status || !user?.is_kadiv?.id) {
        throw new Error("Akses ditolak. Anda bukan Kepala Divisi.");
      }

      const res = await fetchWithJwt(
        `${apiUrl}/profil/kadiv-access/group/kadiv/${user.is_kadiv.id}`,
      );

      if (!res.ok) throw new Error("Gagal memuat data tim Kadiv");

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
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetchWithJwt(
        `${apiUrl}/profil/kadiv-access/group/${id}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        let msg = "Gagal menghapus grup";
        try {
          const err = await res.json();
          msg = err.message || msg;
        } catch {}
        throw new Error(msg);
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
        text: err.message,
      });
    }
  };

  const openDetailGroup = (row) => {
    setSelectedGroupId(row.id);
    setSelectedGroupName(row.nama_grup);
    setOpenShow(true);
  };

  return (
    <>
      <SectionHeader
        title="Kelola Anggota Tim"
        subtitle="Manajemen grup dan tim kerja di bawah tanggung jawab Anda."
        onBack={() => navigate(-1)}
        actions={
          <Button icon={faPlus} onClick={() => setOpenTambah(true)}>
            Tambah
          </Button>
        }
      />

      <DataView
        data={groupList}
        isLoading={loading}
        error={error}
        onRetry={fetchGroupKadiv}
        emptyTitle="Belum Ada Grup"
        emptyMessage="Silakan buat grup baru untuk mulai mengelola tim."
        emptyActionText="Tambah Grup"
        onEmptyAction={() => setOpenTambah(true)}
        searchable
        searchKeys={["nama_grup", "nama_leader"]}
        itemsPerPage={10}
        columns={[
          {
            label: "Nama Grup",
            key: "nama_grup",
            truncate: true,
          },
          {
            label: "Leader",
            render: (row) => row.nama_leader || "-",
          },
          {
            label: "Status",
            render: (row) => {
              const hasLeader = Boolean(row.id_leader);

              return (
                <Badge variant={hasLeader ? "success" : "warning"} size="sm">
                  {hasLeader ? "Aktif" : "Kosong"}
                </Badge>
              );
            },
          },
          {
            label: "Anggota",
            render: (row) => `${row.total_member} orang`,
          },
          {
            label: "Menu",
            isAction: true,
            align: "center",
            render: (row) => (
              <div className="flex justify-center gap-2">
                <Button size="sm" variant="detail" icon={faEye} onClick={() => openDetailGroup(row)}>
                  Detail
                </Button>
                <Button size="sm" variant="danger" icon={faTrash} onClick={() => handleDeleteGroup(row.id, row.nama_grup)}>
                  Hapus
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Modal isOpen={openTambah} onClose={() => setOpenTambah(false)} title="Tambah Grup Baru" note="Grup baru akan dibuat di bawah tanggung jawab Anda" size="md">
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
