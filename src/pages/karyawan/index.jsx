import React, { useEffect, useMemo, useState, useCallback } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faPlus,
  faCheckCircle,
  faExclamationCircle,
  faEye,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt } from "../../utils/jwtHelper";
import {
  Modal,
  DataView,
  Button,
  SectionHeader,
  Badge,
  FilterSelect,
} from "../../components";

const DataKaryawan = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedPerusahaan, setSelectedPerusahaan] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [openInfo, setOpenInfo] = useState(false);
  const [selectedUserInfo, setSelectedUserInfo] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchWithJwt(`${apiUrl}/profil`);
        const json = await res.json();
        const data = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json)
            ? json
            : [];

        setUsers(data);
      } catch (err) {
        setErrorMessage(err.message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [apiUrl]);

  const getIncompleteFields = useCallback((user) => {
    const fields = {
      nik: "NIK",
      nip: "NIP",
      npwp: "NPWP",
      no_rek: "No Rekening",
      telp: "Nomor Telepon",
      status_nikah: "Status Nikah",
      id_shift: "Shift",
    };

    return Object.keys(fields)
      .filter((k) => {
        const v = user[k];
        if (k === "id_shift") return !v || v <= 0;
        if (typeof v === "string") return !v.trim() || v === "-";
        return v == null;
      })
      .map((k) => fields[k]);
  }, []);

  const isDataComplete = (u) => getIncompleteFields(u).length === 0;

  const openModal = (user) => {
    setSelectedUserInfo(user);
    setOpenInfo(true);
  };

  const renderActionButtons = (user) => (
    <div className="flex gap-2 justify-center">
      <Button
        size="sm"
        variant="detail"
        icon={faEye}
        onClick={() => navigate(`/karyawan/show/${user.id}`)}
      >
        Detail
      </Button>
      <Button
        size="sm"
        variant="warning"
        icon={faEdit}
        onClick={() => navigate(`/karyawan/edit/${user.id}`)}
      >
        Edit
      </Button>

      <Button
        size="sm"
        variant="danger"
        icon={faTrash}
        onClick={() => handleDelete(user.id)}
      >
        Hapus
      </Button>
    </div>
  );

  const handleDelete = async (id) => {
    const res = await Swal.fire({ title: "Hapus?", showCancelButton: true });
    if (!res.isConfirmed) return;
    await fetchWithJwt(`${apiUrl}/profil/${id}`, { method: "DELETE" });
    setUsers((p) => p.filter((u) => u.id !== id));
  };

  const columns = useMemo(
    () => [
      { label: "NIP", key: "nip", align: "text-center" },
      {
        label: "Nama Karyawan",
        render: (row) => {
          const incomplete = !isDataComplete(row);

          return (
            <div className="flex justify-between items-center gap-2">
              <div>
                <div className="font-semibold">{row.nama}</div>
              </div>

              {incomplete && (
                <FontAwesomeIcon
                  icon={faExclamationCircle}
                  className="text-red-500 cursor-pointer"
                  onClick={() => openModal(row)}
                />
              )}
            </div>
          );
        },
      },

      { label: "Divisi", key: "role", align: "text-center" },
      { label: "Shift", key: "shift", align: "text-center" },
      {
        label: "Status",
        align: "text-center",
        render: (row) => (
          <Badge variant={row.status === 1 ? "success" : "neutral"} size="sm">
            {row.status === 1 ? "Aktif" : "Nonaktif"}
          </Badge>
        ),
      },

      {
        label: "Menu",
        isAction: true,
        align: "text-center",
        render: (row) => renderActionButtons(row),
      },
    ],
    [],
  );

  const filteredUsers = users.filter((u) => {
    const p = (u.perusahaan || "").toLowerCase();
    const r = (u.role || "").toLowerCase();
    return (
      (!selectedPerusahaan || p === selectedPerusahaan.toLowerCase()) &&
      (!selectedRole || r === selectedRole.toLowerCase())
    );
  });

  const summaryItems = [
    {
      key: "total",
      title: "Total Karyawan",
      value: filteredUsers.length,
      note: "Semua data",
      icon: faUser,
      variant: "default",
    },
  ];

  const perusahaanOptions = useMemo(
    () => [
      { value: "", label: "Semua" },
      ...[...new Set(users.map((u) => u.perusahaan).filter(Boolean))].map(
        (p) => ({ value: p, label: p }),
      ),
    ],
    [users],
  );

  const roleOptions = useMemo(
    () => [
      { value: "", label: "Semua" },
      ...[...new Set(users.map((u) => u.role).filter(Boolean))].map((r) => ({
        value: r,
        label: r,
      })),
    ],
    [users],
  );

  return (
    <div>
      <SectionHeader
        title="Kelola Karyawan"
        subtitle="Mengelola data karyawan yang terdaftar dalam sistem."
        onBack={() => navigate("/home")}
        actions={
          <Button icon={faPlus} onClick={() => navigate("/karyawan/tambah")}>
            Tambah
          </Button>
        }
      />

      <DataView
        data={filteredUsers}
        columns={columns}
        rowKey={(r) => r.id}
        searchable
        searchKeys={["nip", "nama", "perusahaan", "role"]}
        searchPlaceholder="Cari karyawan..."
        isLoading={isLoading}
        error={errorMessage}
        summaryItems={summaryItems}
        header={
          <>
            <FilterSelect
              label="Perusahaan"
              value={selectedPerusahaan}
              onChange={setSelectedPerusahaan}
              options={perusahaanOptions}
              className="md:w-56"
            />
            <FilterSelect
              label="Divisi"
              value={selectedRole}
              onChange={setSelectedRole}
              options={roleOptions}
              className="md:w-48"
            />
          </>
        }
      />

      {/* MODAL FIXED */}
      <Modal
        isOpen={openInfo}
        onClose={() => setOpenInfo(false)}
        title="Info Kelengkapan Data"
        note={`Nama Karyawan: ${selectedUserInfo?.nama}`}
        footer={
          <Button
            variant="warning"
            onClick={() => {
              setOpenInfo(false);
              navigate(`/karyawan/edit/${selectedUserInfo?.id}`);
            }}
          >
            Perbarui
          </Button>
        }
      >
        {selectedUserInfo &&
          (isDataComplete(selectedUserInfo) ? (
            <div className="flex gap-2 text-emerald-600">
              <FontAwesomeIcon icon={faCheckCircle} />
              Data sudah lengkap
            </div>
          ) : (
            <div>
              <p className="font-semibold text-red-600 mb-2">
                Data belum lengkap:
              </p>
              <ul className="list-disc pl-5 text-sm">
                {getIncompleteFields(selectedUserInfo).map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          ))}
      </Modal>
    </div>
  );
};

export default DataKaryawan;
