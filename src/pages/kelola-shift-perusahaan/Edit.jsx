import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave, faTimes, faTrash, faPlus} from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt } from "../../utils/jwtHelper";
import Swal from "sweetalert2";

const EditPerusahaan = () => {
    const [nama, setNama] = useState("");
    const [shiftList, setShiftList] = useState([]);
    const [selectedShifts, setSelectedShifts] = useState([]);
    const [selectedOptionValue, setSelectedOptionValue] = useState("");
    const [perusahaanData, setPerusahaanData] = useState(null);
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const { id } = useParams();


    useEffect(() => {
        fetchPerusahaan();
        fetchShiftList();
    }, []);

    useEffect(() => {
        if (shiftList.length > 0 && perusahaanData?.data?.shift) {
            const shiftIds = perusahaanData.data.shift
                .map((s) => s.id)
                .filter(Boolean);
            setSelectedShifts(shiftIds);
        }
    }, [shiftList, perusahaanData]);


    const fetchPerusahaan = async () => {
        try {
            const res = await fetchWithJwt(`${apiUrl}/perusahaan/${id}`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            setNama(data?.data?.nama || "");
            setPerusahaanData(data);
        } catch {
            Swal.fire("Error", "Gagal memuat data perusahaan", "error");
        }
    };


    const fetchShiftList = async () => {
        try {
            const res = await fetchWithJwt(`${apiUrl}/shift`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            setShiftList(Array.isArray(data?.data) ? data.data : []);
        } catch {
            Swal.fire("Error", "Gagal memuat data shift", "error");
        }
    };

    const availableShifts = shiftList.filter(
        (shift) => !selectedShifts.includes(shift.id)
    );

    const handleAddShift = () => {
        if (!selectedOptionValue) return;
        setSelectedShifts((prev) => [...prev, Number(selectedOptionValue)]);
        setSelectedOptionValue("");
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedShifts.length === 0) {
            return Swal.fire({
                icon: "warning",
                title: "Shift belum dipilih",
                text: "Pilih setidaknya satu shift yang akan dikaitkan.",
            });
        }
        const confirm = await Swal.fire({
            title: "Yakin ingin menyimpan?",
            text: "Perubahan data perusahaan akan disimpan secara permanen.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#16a34a",
            cancelButtonColor: "#d33",
            confirmButtonText: "Ya, simpan!",
            cancelButtonText: "Batal",
        });
        if (!confirm.isConfirmed) return;
        try {
            const res = await fetchWithJwt(`${apiUrl}/perusahaan/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    detailShift: selectedShifts.map((id) => ({
                        id_shift: id,
                    })),
                }),
            });
            if (!res.ok) throw new Error();
            await Swal.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Shift perusahaan berhasil diperbarui.",
                timer: 1500,
                showConfirmButton: false,
            });
            navigate("/shift-perusahaan");
        } catch {
            Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan data", "error");
        }
    };


    const handleRemoveShift = async (shift) => {
        const confirm = await Swal.fire({
            icon: "warning",
            title: "Hapus Shift ini?",
            html: `
            <div style="text-align:left;font-size:14px">
                Shift <b>${shift.nama}</b> akan dihapus dari perusahaan ini.<br/><br/>
                <b>Konsekuensi:</b>
                <ul style="margin-left:16px;list-style:disc">
                    <li>Perusahaan tidak lagi memiliki jam kerja untuk shift ini</li>
                    <li>Karyawan dengan shift ini perlu disesuaikan kembali</li>
                </ul>
                <br/>
                Apakah Anda yakin ingin melanjutkan?
            </div>
        `,
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Ya, hapus shift",
            cancelButtonText: "Batal",
        });

        if (!confirm.isConfirmed) return;

        setSelectedShifts((prev) => prev.filter((id) => id !== shift.id));
    };


    const handleCreateShift = async () => {
        const confirm = await Swal.fire({
            icon: "question",
            title: "Simpan Perubahan Terlebih Dahulu?",
            html: `
            <div style="text-align:left;font-size:14px">
                Anda sedang mengubah shift perusahaan ini.<br/><br/>
                Apakah Anda ingin <b>menyimpan perubahan terlebih dahulu</b>
                sebelum membuat shift baru?
            </div>
        `,
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonColor: "#16a34a",
            denyButtonColor: "#2563eb",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Ya, simpan dulu",
            denyButtonText: "Langsung buat shift",
            cancelButtonText: "Batal",
        });

        // === SIMPAN DULU, LALU KE HALAMAN SHIFT ===
        if (confirm.isConfirmed) {
            if (selectedShifts.length === 0) {
                return Swal.fire({
                    icon: "warning",
                    title: "Tidak ada shift untuk disimpan",
                    text: "Tambahkan minimal satu shift sebelum menyimpan.",
                });
            }

            try {
                const res = await fetchWithJwt(`${apiUrl}/perusahaan/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        detailShift: selectedShifts.map((id) => ({
                            id_shift: id,
                        })),
                    }),
                });

                if (!res.ok) throw new Error();

                await Swal.fire({
                    icon: "success",
                    title: "Perubahan Disimpan",
                    text: "Anda akan diarahkan ke halaman pembuatan shift.",
                    timer: 1500,
                    showConfirmButton: false,
                });

                navigate("/shift");
            } catch {
                Swal.fire("Gagal", "Tidak dapat menyimpan perubahan", "error");
            }
        }

        // === LANGSUNG KE HALAMAN SHIFT (TANPA SIMPAN) ===
        if (confirm.isDenied) {
            navigate("/shift");
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <div className="w-full flex items-center justify-between pb-4 bg-white shadow-sm border-b">
                <div className="flex items-center space-x-2">
                    <button onClick={() => navigate(-1)} className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-full">
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">
                        Edit Shift Perusahaan
                    </h1>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-grow pt-5 sm:p-4 w-full mx-auto space-y-6">
                <div>
                    <label className="block mb-1 font-medium text-gray-700">
                        Nama Perusahaan
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        Nama perusahaan bersifat informatif dan tidak dapat
                        diubah di halaman ini.
                    </p>
                    <input type="text" value={nama} disabled className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"/>
                </div>

                {/* Pilih Shift */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Tambah Shift
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                            Pilih shift terlebih dahulu, lalu klik tambahkan.
                        </p>

                        {availableShifts.length > 0 ? (
                            <>
                                <select value={selectedOptionValue} onChange={(e) => setSelectedOptionValue(e.target.value)} className="w-full border border-gray-300 rounded-md px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none">
                                    <option value="">
                                        -- Pilih shift --
                                    </option>
                                    {availableShifts.map((shift) => (
                                        <option key={shift.id} value={shift.id}>
                                            {shift.nama}
                                        </option>
                                    ))}
                                </select>

                                <div className="flex justify-end mt-2">
                                    <button type="button" onClick={handleAddShift} disabled={!selectedOptionValue} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded flex items-center shadow">
                                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                        Tambahkan Shift
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 text-sm text-gray-600">
                                <p className="mb-1 font-medium text-gray-700">
                                    Semua shift sudah ditambahkan
                                </p>
                                <p className="text-xs text-gray-500 mb-3">
                                    Perusahaan ini sudah memiliki seluruh shift yang tersedia.
                                    Jika ingin menambahkan jam kerja baru, silakan buat shift baru.
                                </p>
                                <div className="flex justify-end">
                                    <button type="button" onClick={handleCreateShift} className="text-green-700 text-xs font-semibold px-3 py-1 bg-green-100 rounded-sm hover:bg-green-200 border border-green-200">
                                        Buat Shift Baru
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {selectedShifts.length > 0 && (
                        <div>
                            <label className="block mb-1 font-medium text-gray-700 text-sm">
                                Shift Terpilih
                            </label>
                            <p className="text-xs text-gray-500 mb-2">
                                Di bawah ini adalah shift yang telah dipilih untuk perusahaan ini.
                            </p>

                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                                {selectedShifts.map((shiftId) => {
                                    const shift = shiftList.find(
                                        (s) => s.id === shiftId
                                    );
                                    if (!shift) return null;
                                    return (
                                        <div key={shiftId} className="bg-white border border-green-200 rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow duration-200 space-y-4">
                                            <div className="flex items-start justify-between">
                                                <h3 className="text-lg font-semibold text-green-700">
                                                    {shift.nama}
                                                </h3>
                                                <button type="button" onClick={() => handleRemoveShift(shift)} className="text-sm text-white bg-red-600 hover:bg-red-700 transition px-3 py-1 rounded-md shadow-sm">
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                            <hr className="border-t border-green-100" />
                                            <div className="text-sm text-gray-700 space-y-2">
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                    Jadwal Shift
                                                </p>
                                                {Array.isArray(shift.detail) &&
                                                    shift.detail.length > 0 ? (
                                                    <ul className="space-y-1">
                                                        {shift.detail.map((jadwal, idx) => (
                                                            <li key={idx} className="flex justify-between border-b border-dashed border-gray-200 pb-1 text-xs">
                                                                <span className="text-gray-600 font-medium">
                                                                    {jadwal.hari}
                                                                </span>
                                                                <span className="text-gray-800 font-semibold">
                                                                    {jadwal.jam_masuk} - {" "}
                                                                    {jadwal.jam_pulang}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="italic text-gray-400">
                                                        Tidak ada jadwal shift.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>


                <div className="flex justify-between space-x-4 pt-4">
                    <button type="button" onClick={() => navigate(-1)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center shadow">
                        <FontAwesomeIcon icon={faTimes} className="mr-2" />
                        Batal
                    </button>
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center shadow">
                        <FontAwesomeIcon icon={faSave} className="mr-2" />
                        Simpan Perubahan
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditPerusahaan;