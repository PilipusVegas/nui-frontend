import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark, faCheck, faChevronDown, faEdit, faTrash, faCloudDownload, faTimes } from "@fortawesome/free-solid-svg-icons";
import { SectionHeader, LoadingSpinner, ErrorState, EmptyState, Modal, Pagination, SearchBar } from "../../components";
import { fetchWithJwt } from "../../utils/jwtHelper";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Select from "react-select";


const PenjadwalanKaryawan = () => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profilList, setProfilList] = useState([]);
    const [shiftList, setShiftList] = useState([]);
    const [lokasiList, setLokasiList] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedRow, setExpandedRow] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [form, setForm] = useState({ id_penjadwalan: null, id_user: "", id_shift: "", lokasi: [] });
    const scheduledUserIds = data
        .map(item => item.jadwal?.id_user)
        .filter(Boolean);

    const fetchPenjadwalan = async () => {
        try {
            setLoading(true);
            const res = await fetchWithJwt(`${apiUrl}/penjadwalan`);
            const json = await res.json();
            setData(json.data || []);
        } catch (err) {
            console.error(err);
            setError("Gagal memuat data penjadwalan");
            toast.error("Gagal memuat data penjadwalan");
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

        setSelectedUser({
            nama: item.nama,
            role: item.role
        });

        setOpenModal(true);
    };


    const handleSubmit = async () => {
        if (!form.id_shift || !form.lokasi.length) {
            toast.error("Shift dan lokasi wajib diisi");
            return;
        }

        const confirm = await Swal.fire({
            title: isEdit ? "Simpan Perubahan?" : "Tambah Penjadwalan?",
            text: isEdit
                ? "Perubahan penjadwalan akan disimpan"
                : "Penjadwalan baru akan ditambahkan",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Ya, simpan",
            cancelButtonText: "Batal",
            confirmButtonColor: "#16a34a",
            cancelButtonColor: "#6b7280"
        });

        if (!confirm.isConfirmed) return;

        const toastId = toast.loading(
            isEdit ? "Menyimpan perubahan..." : "Menambahkan penjadwalan..."
        );

        try {
            if (isEdit) {
                const res = await fetchWithJwt(
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

                const result = await res.json();

                if (!res.ok) {
                    throw new Error(result?.message || "Gagal memperbarui penjadwalan");
                }

                toast.success("Penjadwalan berhasil diperbarui", { id: toastId });

            } else {
                const res = await fetchWithJwt(`${apiUrl}/penjadwalan`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id_user: Number(form.id_user),
                        id_shift: Number(form.id_shift),
                        location: form.lokasi
                    })
                });

                const result = await res.json();

                if (!res.ok) {
                    // contoh: 409 conflict
                    throw new Error(result?.message || "Terjadi konflik data");
                }

                toast.success("Penjadwalan berhasil ditambahkan", { id: toastId });

            }

            setOpenModal(false);
            fetchPenjadwalan();
        } catch (err) {
            console.error(err);
            toast.error(
                err?.message || "Gagal menyimpan penjadwalan",
                { id: toastId }
            );
        }
    };

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Hapus Penjadwalan?",
            text: "Data penjadwalan yang dihapus tidak dapat dikembalikan",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, hapus",
            cancelButtonText: "Batal",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280"
        });

        if (!confirm.isConfirmed) return;

        const toastId = toast.loading("Menghapus penjadwalan...");

        try {
            await fetchWithJwt(
                `${apiUrl}/penjadwalan/${id}`,
                { method: "DELETE" }
            );

            toast.success("Penjadwalan berhasil dihapus", { id: toastId });
            fetchPenjadwalan();
        } catch (err) {
            console.error(err);
            toast.error("Gagal menghapus penjadwalan", { id: toastId });
        }
    };


    const userOptions = profilList
        .filter(p => !scheduledUserIds.includes(p.id)) // ⬅️ KUNCI UTAMA
        .map(p => ({
            value: p.id,
            label: `${p.nama} - ${p.role}`,
            data: p
        }));


    const shiftOptions = shiftList.map(s => ({
        value: s.id,
        label: s.nama
    }));

    const lokasiOptions = lokasiList
        .filter(l => !form.lokasi.includes(l.id)) // ⬅️ INI KUNCINYA
        .map(l => ({
            value: l.id,
            label: l.nama
        }));

    const selectPortalStyle = {
        menuPortal: (base) => ({
            ...base,
            zIndex: 9999
        })
    };

    const filteredData = data.filter(item => {
        const q = searchQuery.toLowerCase();

        return (
            item.nama?.toLowerCase().includes(q) ||
            item.role?.toLowerCase().includes(q) ||
            item.jadwal?.nama_shift?.toLowerCase().includes(q) ||
            item.jadwal?.lokasi?.some(l =>
                l.nama?.toLowerCase().includes(q)
            )
        );
    });


    return (
        <div className="bg-white flex flex-col">
            <SectionHeader title="Penjadwalan Karyawan" subtitle="Atur Shift dan Lokasi Absensi Karyawan Lapangan"
                onBack={() => navigate(-1)}
                actions={
                    <div className="flex gap-2">
                        <button onClick={openTambah} className="flex items-center gap-2 px-4 py-2 text-sm text-white font-bold bg-green-500 rounded">
                            <FontAwesomeIcon icon={faPlus} />
                            Tambah
                        </button>
                        <button onClick={openTambah} className="flex items-center gap-2 px-4 py-2 text-sm text-white font-bold bg-blue-500 rounded">
                            <FontAwesomeIcon icon={faCloudDownload} />
                            Tarik SPK
                        </button>
                    </div>
                }
            />

            <div className="px-4 mt-4">
                <SearchBar placeholder="Cari nama, role, shift, atau lokasi..." onSearch={setSearchQuery} className="max-w-md"/>
            </div>


            {loading && <LoadingSpinner />}
            {!loading && error && <ErrorState message={error} />}
            {!loading && !error && data.length === 0 && (
                <EmptyState message="Data penjadwalan kosong" />
            )}

            {!loading && !error && data.length > 0 && (
                <>
                    <div className="hidden md:block">
                        <table className="min-w-full text-sm">
                            <thead className="bg-green-500 text-white">
                                <tr>
                                    <th className="px-4 py-3 text-center rounded-tl-lg">
                                        No.
                                    </th>
                                    <th className="px-4 py-3 text-left align-middle">
                                        Nama
                                    </th>
                                    <th className="px-4 py-3 text-center align-middle">
                                        Shift
                                    </th>
                                    <th className="px-4 py-3 text-center align-middle">
                                        Lokasi
                                    </th>
                                    <th className="px-4 py-3 text-center align-middle rounded-tr-lg">
                                        Menu
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredData.map((item, i) => {
                                    const lokasi = item.jadwal?.lokasi || [];
                                    const first = lokasi.length > 0 ? lokasi[0] : null;

                                    return (
                                        <tr key={i} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-1.5 align-middle text-center">
                                                {i + 1}
                                            </td>
                                            <td className="px-4 py-1.5 align-middle text-left">
                                                <div className="font-semibold text-gray-800">
                                                    {item.nama}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {item.role}
                                                </div>
                                            </td>
                                            <td className="px-4 py-1.5 align-middle text-center">
                                                {item.jadwal.nama_shift}
                                            </td>
                                            <td className="px-4 py-1.5 align-middle text-center relative">
                                                <div className="inline-flex items-center gap-2 cursor-pointer justify-center" onMouseEnter={() => setExpandedRow(i)} onMouseLeave={() => setExpandedRow(null)} onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
                                                    <span className="truncate max-w-[180px]">
                                                        {first ? first.nama : "-"}
                                                    </span>

                                                    {lokasi.length > 1 && (
                                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                                            +{lokasi.length - 1}
                                                        </span>
                                                    )}

                                                    <FontAwesomeIcon icon={faChevronDown} className={`text-gray-500 transition ${expandedRow === i ? "rotate-180" : ""}`}
                                                    />
                                                </div>

                                                {expandedRow === i && lokasi.length > 0 && (
                                                    <div className="absolute z-20 top-full left-1/2 -translate-x-1/2 mt-2 w-max min-w-[180px] bg-white border rounded-lg shadow-lg p-3 text-left">
                                                        <div className="text-xs font-semibold text-gray-600 mb-1">
                                                            Daftar Lokasi
                                                        </div>

                                                        <ul className="space-y-1 text-sm text-gray-700">
                                                            {lokasi.map((l) => (
                                                                <li key={l.id}>• {l.nama}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </td>


                                            <td className="px-4 py-1.5 align-middle">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button onClick={() => openEdit(item)} className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition">
                                                        <FontAwesomeIcon icon={faEdit} />
                                                        <span className="text-xs font-medium">Edit</span>
                                                    </button>

                                                    <button onClick={() => handleDelete(item.jadwal.id)} className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-6`   00 transition">
                                                        <FontAwesomeIcon icon={faTrash} />
                                                        <span className="text-xs font-medium">Hapus</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="md:hidden space-y-3">
                        {filteredData.map((item, i) => {
                            const lokasi = item.jadwal?.lokasi || [];
                            const first = lokasi[0];

                            return (
                                <div key={i} className="border rounded-xl p-4 bg-white shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-semibold text-gray-800">
                                                {item.nama}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {item.role}
                                            </div>
                                        </div>

                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                            {item.jadwal.nama_shift}
                                        </span>
                                    </div>

                                    <div className="text-sm text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Lokasi:</span>
                                            <span className="truncate max-w-[160px]">
                                                {first ? first.nama : "-"}
                                            </span>

                                            {lokasi.length > 1 && (
                                                <span onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                                                    className="text-xs bg-gray-200 px-2 rounded cursor-pointer"
                                                >
                                                    +{lokasi.length - 1}
                                                </span>
                                            )}
                                        </div>

                                        {expandedRow === i && (
                                            <div className="mt-2 space-y-1 text-xs text-gray-600">
                                                {lokasi.map((l) => (
                                                    <div key={l.id}>• {l.nama}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* ACTION */}
                                    <div className="flex justify-end gap-2 mt-4">
                                        <button onClick={() => openEdit(item)} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-yellow-500 text-white rounded">
                                            <FontAwesomeIcon icon={faEdit} />
                                            Edit
                                        </button>

                                        <button onClick={() => handleDelete(item.jadwal.id)} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-500 text-white rounded">
                                            <FontAwesomeIcon icon={faTrash} />
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            <Modal isOpen={openModal} onClose={() => setOpenModal(false)} title={isEdit ? "Edit Penjadwalan" : "Tambah Penjadwalan"}>
                <div className="space-y-4">

                    {isEdit && selectedUser && (
                        <div className="border rounded-lg p-3 bg-gray-50">
                            <div className="text-xs text-gray-500">Karyawan</div>
                            <div className="font-semibold">{selectedUser.nama}</div>
                            <div className="text-xs text-gray-500">{selectedUser.role}</div>
                        </div>
                    )}

                    {!isEdit && (
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Karyawan</div>
                            <Select
                                options={userOptions}
                                placeholder={
                                    userOptions.length === 0
                                        ? "Semua karyawan sudah terjadwal"
                                        : "Cari karyawan..."
                                }
                                isDisabled={userOptions.length === 0}
                                onChange={(opt) => {
                                    setForm({ ...form, id_user: opt?.value || "" });
                                    setSelectedUser(opt?.data || null);
                                }}
                                isClearable
                                menuPortalTarget={document.body}
                                styles={selectPortalStyle}
                            />

                        </div>
                    )}

                    {/* ===== PILIH SHIFT ===== */}
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Shift</div>
                        <Select
                            options={shiftOptions}
                            placeholder="Pilih shift..."
                            value={shiftOptions.find(s => s.value === Number(form.id_shift))}
                            onChange={(opt) =>
                                setForm({ ...form, id_shift: opt?.value || "" })
                            }
                            isClearable
                            menuPortalTarget={document.body}
                            styles={selectPortalStyle}
                        />

                    </div>

                    {form.lokasi.length > 0 && (
                        <div className="border rounded-lg p-3 bg-green-50">
                            <div className="flex justify-between mb-2">
                                <span className="text-xs text-gray-600">Lokasi Terpilih</span>
                                <span className="text-xs bg-green-200 px-2 rounded">
                                    {form.lokasi.length}/7
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {lokasiList
                                    .filter(l => form.lokasi.includes(l.id))
                                    .map(l => (
                                        <span
                                            key={l.id}
                                            onClick={() =>
                                                setForm(prev => ({
                                                    ...prev,
                                                    lokasi: prev.lokasi.filter(id => id !== l.id)
                                                }))
                                            }
                                            className="cursor-pointer text-xs bg-white border px-2 py-1 rounded hover:bg-red-50"
                                        >
                                            {l.nama}
                                            <FontAwesomeIcon icon={faTimes} className="ml-1" />
                                        </span>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* ===== TAMBAH LOKASI (HANYA YANG BELUM DIPILIH) ===== */}
                    <div>
                        <div className="text-xs text-gray-500 mb-1">
                            Tambah Lokasi Absensi
                        </div>
                        <Select
                            options={lokasiOptions}
                            placeholder="Cari lokasi..."
                            value={null}                // ⬅️ PENTING: selalu kosong
                            onChange={(opt) => {
                                if (!opt) return;

                                setForm(prev => {
                                    if (prev.lokasi.length >= 7) {
                                        toast.error("Maksimal 7 lokasi absensi");
                                        return prev;
                                    }

                                    if (prev.lokasi.includes(opt.value)) {
                                        return prev; // safety (harusnya sudah terfilter)
                                    }

                                    return {
                                        ...prev,
                                        lokasi: [...prev.lokasi, opt.value]
                                    };
                                });
                            }}
                            menuPortalTarget={document.body}
                            styles={selectPortalStyle}
                        />
                    </div>
                    {/* ===== ACTION ===== */}
                    <div className="flex justify-end gap-2 pt-2">
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
