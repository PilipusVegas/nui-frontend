import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faTrashAlt,
    faPen,
    faXmark,
    faCheck,
    faChevronDown
} from "@fortawesome/free-solid-svg-icons";
import {
    SectionHeader,
    LoadingSpinner,
    ErrorState,
    EmptyState,
    Modal
} from "../../components";
import { fetchWithJwt } from "../../utils/jwtHelper";

const PenjadwalanKaryawan = () => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();

    // ===== VIEW DATA =====
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ===== MASTER DATA =====
    const [profilList, setProfilList] = useState([]);
    const [shiftList, setShiftList] = useState([]);
    const [lokasiList, setLokasiList] = useState([]);

    // ===== UI STATE =====
    const [openModal, setOpenModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);

    // ===== FORM =====
    const [form, setForm] = useState({
        id_penjadwalan: null,
        id_user: "",
        id_shift: "",
        lokasi: []
    });

    /* ================= FETCH ================= */
    const fetchPenjadwalan = async () => {
        try {
            setLoading(true);
            const res = await fetchWithJwt(`${apiUrl}/penjadwalan`);
            const json = await res.json();
            setData(json.data || []);
        } catch (err) {
            console.error(err);
            setError("Gagal memuat data penjadwalan");
        } finally {
            setLoading(false);
        }
    };

    const fetchMaster = async () => {
        const [profilRes, shiftRes, lokasiRes] = await Promise.all([
            fetchWithJwt(`${apiUrl}/profil`),
            fetchWithJwt(`${apiUrl}/shift`),
            fetchWithJwt(`${apiUrl}/lokasi`)
        ]);

        setProfilList((await profilRes.json()).data || []);
        setShiftList((await shiftRes.json()).data || []);
        setLokasiList((await lokasiRes.json()).data || []);
    };

    useEffect(() => {
        fetchPenjadwalan();
    }, []);

    /* ================= FORM ================= */
    const toggleLokasi = (id) => {
        setForm((prev) => ({
            ...prev,
            lokasi: prev.lokasi.includes(id)
                ? prev.lokasi.filter((l) => l !== id)
                : [...prev.lokasi, id]
        }));
    };

    const openTambah = async () => {
        await fetchMaster();
        setIsEdit(false);
        setForm({ id_penjadwalan: null, id_user: "", id_shift: "", lokasi: [] });
        setOpenModal(true);
    };

    const openEdit = async (item) => {
        await fetchMaster();
        setIsEdit(true);
        setForm({
            id_penjadwalan: item.jadwal.id,
            id_shift: item.jadwal.id_shift,
            lokasi: item.jadwal.lokasi.map(l => l.id)
        });

        setOpenModal(true);
    };

    const handleSubmit = async () => {
        if (!form.id_shift || !form.lokasi.length) {
            alert("Shift dan lokasi wajib diisi");
            return;
        }


        try {
            if (isEdit) {
                await fetchWithJwt(
                    `${apiUrl}/penjadwalan/${form.id_penjadwalan}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            id_shift: Number(form.id_shift),
                            id_lokasi: form.lokasi
                        })
                    }
                );

            } else {
                await fetchWithJwt(`${apiUrl}/penjadwalan`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id_user: Number(form.id_user),
                        id_shift: Number(form.id_shift),
                        location: form.lokasi
                    })
                });
            }

            setOpenModal(false);
            fetchPenjadwalan();
        } catch (err) {
            console.error(err);
            alert("Gagal menyimpan penjadwalan");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Hapus penjadwalan ini?")) return;

        try {
            await fetchWithJwt(`${apiUrl}/penjadwalan/${id}`, {
                method: "DELETE"
            });
            fetchPenjadwalan();
        } catch (err) {
            console.error(err);
            alert("Gagal menghapus penjadwalan");
        }
    };

    /* ================= RENDER ================= */
    return (
        <div className="bg-white flex flex-col">
            <SectionHeader
                title="Penjadwalan Karyawan"
                subtitle="Atur shift dan lokasi absensi karyawan"
                onBack={() => navigate(-1)}
                actions={
                    <button
                        onClick={openTambah}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-green-500 rounded-lg"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Tambah
                    </button>
                }
            />

            {loading && <LoadingSpinner />}
            {!loading && error && <ErrorState message={error} />}
            {!loading && !error && data.length === 0 && (
                <EmptyState message="Data penjadwalan kosong" />
            )}

            {!loading && !error && data.length > 0 && (
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full text-sm">
                        <thead className="bg-green-500 text-white">
                            <tr>
                                {/* NAMA – KIRI */}
                                <th className="px-4 py-3 text-left align-middle">
                                    Nama
                                </th>

                                {/* SHIFT – TENGAH */}
                                <th className="px-4 py-3 text-center align-middle">
                                    Shift
                                </th>

                                {/* LOKASI – TENGAH */}
                                <th className="px-4 py-3 text-center align-middle">
                                    Lokasi
                                </th>

                                {/* MENU – TENGAH */}
                                <th className="px-4 py-3 text-center align-middle">
                                    Menu
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {data.map((item, i) => {
                                const lokasi = item.jadwal.lokasi;
                                const first = lokasi[0];

                                return (
                                    <tr key={i} className="border-b hover:bg-gray-50">
                                        {/* ================= NAMA (KIRI) ================= */}
                                        <td className="px-4 py-3 align-middle text-left">
                                            <div className="font-semibold text-gray-800">
                                                {item.nama}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {item.role}
                                            </div>
                                        </td>

                                        {/* ================= SHIFT (TENGAH) ================= */}
                                        <td className="px-4 py-3 align-middle text-center">
                                            {item.jadwal.nama_shift}
                                        </td>

                                        {/* ================= LOKASI (TENGAH) ================= */}
                                        <td className="px-4 py-3 align-middle text-center">
                                            <div
                                                className="inline-flex items-center gap-2 cursor-pointer justify-center"
                                                onClick={() =>
                                                    setExpandedRow(expandedRow === i ? null : i)
                                                }
                                            >
                                                <span className="truncate max-w-[180px]">
                                                    {first.nama}
                                                </span>

                                                {lokasi.length > 1 && (
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                                        +{lokasi.length - 1}
                                                    </span>
                                                )}

                                                <FontAwesomeIcon
                                                    icon={faChevronDown}
                                                    className="text-gray-500"
                                                />
                                            </div>

                                            {expandedRow === i && (
                                                <div className="mt-2 space-y-1 text-sm text-gray-600">
                                                    {lokasi.map((l) => (
                                                        <div key={l.id}>• {l.nama}</div>
                                                    ))}
                                                </div>
                                            )}
                                        </td>

                                        {/* ================= MENU (TENGAH) ================= */}
                                        <td className="px-4 py-3 align-middle">
                                            <div className="flex justify-center items-center gap-2">
                                                <button
                                                    onClick={() => openEdit(item)}
                                                    className="w-9 h-9 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                                                >
                                                    <FontAwesomeIcon icon={faPen} />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(item.jadwal.id)}
                                                    className="w-9 h-9 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                                                >
                                                    <FontAwesomeIcon icon={faTrashAlt} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                </div>
            )}

            {/* ================= MODAL ================= */}
            <Modal
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
                title={isEdit ? "Edit Penjadwalan" : "Tambah Penjadwalan"}
            >
                <div className="space-y-3">
                    {!isEdit && (
                        <select
                            className="w-full border rounded px-3 py-2"
                            value={form.id_user}
                            onChange={(e) =>
                                setForm({ ...form, id_user: e.target.value })
                            }
                        >
                            <option value="">Pilih Karyawan</option>
                            {profilList.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.nama} - {p.role}
                                </option>
                            ))}
                        </select>
                    )}


                    <select
                        className="w-full border rounded px-3 py-2"
                        value={form.id_shift}
                        onChange={(e) =>
                            setForm({ ...form, id_shift: e.target.value })
                        }
                    >
                        <option value="">Pilih Shift</option>
                        {shiftList.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.nama}
                            </option>
                        ))}
                    </select>

                    <div className="border rounded p-2 max-h-40 overflow-y-auto">
                        {lokasiList.map((l) => (
                            <label key={l.id} className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={form.lokasi.includes(l.id)}
                                    onChange={() => toggleLokasi(l.id)}
                                />
                                {l.nama}
                            </label>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2">
                        <button onClick={() => setOpenModal(false)} className="px-4 py-2 bg-gray-200 rounded">
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                        <button onClick={handleSubmit} className="px-4 py-2 bg-green-500 text-white rounded">
                            <FontAwesomeIcon icon={faCheck} />
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PenjadwalanKaryawan;
