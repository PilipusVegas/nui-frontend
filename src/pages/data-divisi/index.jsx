import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faEye, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Select from "react-select";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { SectionHeader, Modal, DataView, Button } from "../../components";

const DivisiTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPerusahaan, setSelectedPerusahaan] = useState("");
  const [perusahaan, setPerusahaan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [divisi, setDivisi] = useState([]);
  const [nama, setNama] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [openKeterangan, setOpenKeterangan] = useState(null);
  const [editId, setEditId] = useState(null);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  const perusahaanOptions = perusahaan.map((p) => ({
    value: p.id,
    label: p.nama,
  }));

  const fetchDivisi = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithJwt(`${apiUrl}/karyawan/divisi`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      setDivisi(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      console.error("Gagal memuat data divisi:", err);
      setError("Gagal memuat data divisi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPerusahaan = async () => {
    try {
      const res = await fetchWithJwt(`${apiUrl}/perusahaan`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      setPerusahaan(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      console.error("Gagal memuat data perusahaan:", err);
      toast.error("Gagal memuat daftar perusahaan");
    }
  };

  useEffect(() => {
    fetchDivisi();
    fetchPerusahaan();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nama.trim() || !keterangan.trim() || !selectedPerusahaan) {
      toast.error("Nama, keterangan, dan perusahaan wajib diisi.");
      return;
    }

    const url = editId
      ? `${apiUrl}/karyawan/divisi/${editId}`
      : `${apiUrl}/karyawan/divisi`;
    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetchWithJwt(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          keterangan,
          id_perusahaan: selectedPerusahaan,
        }),
      });

      if (!res.ok) {
        let msg = `Gagal menyimpan (status ${res.status})`;
        try {
          const errJson = await res.json();
          if (errJson?.message) msg = errJson.message;
        } catch (_) {}
        throw new Error(msg);
      }

      toast.success(
        editId ? "Divisi berhasil diperbarui." : "Divisi berhasil ditambahkan.",
      );
      setNama("");
      setKeterangan("");
      setEditId(null);
      setIsModalOpen(false);
      fetchDivisi();
    } catch (err) {
      console.error("Gagal menyimpan data:", err);
      toast.error(err.message || "Terjadi kesalahan saat menyimpan data.");
    }
  };

  const handleEdit = React.useCallback((item) => {
    setNama(item.nama);
    setKeterangan(item.keterangan || "");
    setSelectedPerusahaan(item.id_perusahaan || "");
    setEditId(item.id);
    setIsModalOpen(true);
  }, []);

  const columns = React.useMemo(
    () => [
      {
        label: "Nama Divisi",
        render: (row) => (
          <div className="font-semibold uppercase text-gray-800">
            {row.nama}
          </div>
        ),
      },
      {
        label: "Menu",
        align: "text-center",
        isAction: true,
        render: (row) => (
          <div className="flex justify-center gap-2">
            <Button
              size="sm"
              variant="warning"
              icon={faEdit}
              onClick={() => handleEdit(row)}
            >
              Edit
            </Button>

            <Button
              size="sm"
              variant="detail"
              icon={faEye}
              onClick={() =>
                setOpenKeterangan(openKeterangan === row.id ? null : row.id)
              }
            >
              Detail
            </Button>
          </div>
        ),
      },
    ],
    [handleEdit, openKeterangan],
  );

  return (
    <div className="mx-auto w-full">
      <SectionHeader
        title="Data Divisi"
        subtitle={`${divisi.length} divisi terdaftar dan dapat dikelola.`}
        onBack={() => navigate("/")}
        actions={
          <Button
            size="md"
            icon={faPlus}
            onClick={() => {
              setEditId(null);
              setNama("");
              setKeterangan("");
              setSelectedPerusahaan("");
              setIsModalOpen(true);
            }}
          >
            Tambah
          </Button>
        }
      />

      <div className="mt-4">
        <DataView
          data={divisi}
          columns={columns}
          searchable
          searchPlaceholder="Cari nama divisi..."
          itemsPerPage={10}
          isLoading={loading}
          error={error}
          onRetry={fetchDivisi}
          emptyTitle="Belum ada data divisi"
          emptyMessage="Silakan tambahkan divisi baru."
          searchFn={(item, term) => {
            const q = term.trim().toLowerCase();

            if (/^\d+$/.test(q)) {
              return String(item.id) === q;
            }

            return (
              String(item.nama ?? "")
                .toLowerCase()
                .includes(q) ||
              String(item.keterangan ?? "")
                .toLowerCase()
                .includes(q)
            );
          }}
          renderExpandedRow={(row) =>
            openKeterangan === row.id ? (
              <div className="rounded-md border-l-4 border-green-500 bg-green-50 p-3">
                <strong className="text-gray-800">Keterangan:</strong>
                <p className="mt-1 text-sm text-gray-700">
                  {row.keterangan || "Tidak ada keterangan"}
                </p>
              </div>
            ) : null
          }
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setNama("");
          setKeterangan("");
          setEditId(null);
          setSelectedPerusahaan("");
        }}
        title={editId ? "Edit Divisi" : "Tambah Divisi"}
        note="Isi data divisi dengan lengkap dan benar!"
        size="lg"
        footer={
          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end w-full">
            {/* BUTTON BATAL */}
            <Button
              type="button"
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => {
                setIsModalOpen(false);
                setNama("");
                setKeterangan("");
                setEditId(null);
                setSelectedPerusahaan("");
              }}
              className="sm:w-auto"
            >
              Batal
            </Button>

            {/* BUTTON SIMPAN */}
            <Button
              type="submit"
              form="form-divisi"
              variant="primary"
              size="md"
              fullWidth
              loading={loading}
              className="sm:w-auto"
            >
              Simpan
            </Button>
          </div>
        }
      >
        <form id="form-divisi" onSubmit={handleSubmit} className="space-y-4">
          {/* NAMA DIVISI */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Nama Divisi
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              disabled={!!editId}
              placeholder="Masukkan nama divisi"
              className="
          w-full rounded-lg border border-gray-300 bg-white
          px-4 py-2 text-gray-800 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-green-500
          disabled:opacity-60
        "
            />
          </div>

          {/* PILIH PERUSAHAAN */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Divisi Ini Berlaku Di Perusahaan
            </label>
            <Select
              options={perusahaanOptions}
              value={
                perusahaanOptions.find(
                  (opt) => opt.value === selectedPerusahaan,
                ) || null
              }
              onChange={(opt) => setSelectedPerusahaan(opt?.value || "")}
              placeholder="Pilih Perusahaan"
              className="react-select-container"
              classNamePrefix="react-select"
              isClearable
            />
          </div>

          {/* KETERANGAN */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-800">
              Keterangan Divisi
            </label>
            <textarea
              rows={8}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              required
              placeholder="Tulis keterangan singkat tentang divisi ini"
              className="
          w-full resize-none rounded-lg border border-gray-300
          px-4 py-2 text-gray-800 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-green-500
        "
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DivisiTable;
