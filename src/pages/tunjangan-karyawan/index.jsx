import React, { useEffect, useState } from "react";
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
    LoadingSpinner,
    ErrorState,
    EmptyState,
    SearchBar,
    Modal,
    Pagination,
} from "../../components";
import TunjanganDetail from "./show";
import TunjanganForm from "./form";
import Swal from "sweetalert2";

const TunjanganKaryawan = () => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const [list, setList] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [search, setSearch] = useState("");
    const [detailOpen, setDetailOpen] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [editData, setEditData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [infoOpen, setInfoOpen] = useState(false);
    const ITEMS_PER_PAGE = 10;
    const [roleFilter, setRoleFilter] = useState("ALL");
    const roleOptions = ["ALL", ...new Set(list.map((i) => i.role))];

    const handleDelete = async (item) => {
        const result = await Swal.fire({
            title: "Konfirmasi Penghapusan",
            html: `
            <div style="text-align:left; line-height:1.6">
                <p>
                    Anda akan menghapus <b>data tunjangan karyawan</b> dengan
                    rincian sebagai berikut:
                </p>

                <div style="margin:12px 0; padding:10px; background:#f9fafb; border-radius:8px">
                    <div><b>Nama</b> : ${item.nama}</div>
                    <div><b>NIP</b> : ${item.nip}</div>
                    <div><b>Perusahaan</b> : ${item.perusahaan}</div>
                </div>

                <p style="color:#6b7280; font-size:13px">
                    Tindakan ini bersifat <b>permanen</b> dan tidak dapat dibatalkan.
                    Pastikan data yang dipilih sudah sesuai.
                </p>
            </div>
        `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Hapus Data",
            cancelButtonText: "Batal",
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#9ca3af",
            reverseButtons: true,
            focusCancel: true,
        });

        if (!result.isConfirmed) return;

        try {
            await fetchWithJwt(`${apiUrl}/tunjangan/user/${item.id_user}`, { method: "DELETE" });

            await Swal.fire({
                icon: "success",
                title: "Penghapusan Berhasil",
                text: "Data tunjangan karyawan telah berhasil dihapus dari sistem.",
                timer: 1800,
                showConfirmButton: false,
            });

            fetchData();
        } catch (err) {
            await Swal.fire({
                icon: "error",
                title: "Penghapusan Gagal",
                text: "Terjadi kendala saat menghapus data. Silakan coba kembali atau hubungi administrator.",
            });
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetchWithJwt(`${apiUrl}/tunjangan/user`);
            const json = await res.json();

            if (json.success) {
                setList(json.data);
                setFiltered(json.data);
            } else {
                setList([]);
                setFiltered([]);
            }
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
        let data = [...list];
        if (search.trim()) {
            const lower = search.toLowerCase();
            data = data.filter(
                (i) => i.nama.toLowerCase().includes(lower) || i.nip.toLowerCase().includes(lower)
            );
        }

        if (roleFilter !== "ALL") {
            data = data.filter((i) => i.role === roleFilter);
        }

        setFiltered(data);
    }, [search, roleFilter, list]);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedData = filtered.slice(startIndex, endIndex);

    return (
        <div className="w-full animate-fadeIn">
            <SectionHeader title="Tunjangan Karyawan" subtitle="Halaman untuk mengelola tunjangan karyawan" onBack={() => navigate(-1)}
                actions={
                    <div className="flex gap-2">
                        <button onClick={() => { setEditData(null); setFormOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg">
                            <FontAwesomeIcon icon={faPlus} />
                            Tambah
                        </button>
                        <button onClick={() => setInfoOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg">
                            <FontAwesomeIcon icon={faInfo} />
                            Informasi
                        </button>
                    </div>
                }
            />

            <div className="flex flex-col md:flex-row gap-3 mb-4">
                <div className="flex-1">
                    <SearchBar placeholder="Cari nama atau NIP karyawan..." onSearch={setSearch} />
                </div>

                <div className="w-full md:w-56">
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full h-[42px] border-2 rounded-lg px-3 text-sm text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="ALL">Semua Divisi</option>
                        {roleOptions
                            .filter((r) => r !== "ALL")
                            .map((role) => (
                                <option key={role} value={role}>
                                    {role}
                                </option>
                            ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                {loading ? (
                    <LoadingSpinner text="Memuat data tunjangan..." />
                ) : error ? (
                    <ErrorState onRetry={fetchData} />
                ) : filtered.length === 0 ? (
                    <EmptyState message="Data tunjangan belum tersedia" />
                ) : (
                    <>
                        <div className="hidden lg:block bg-white rounded-xl shadow border overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-green-500 text-white">
                                    <tr>
                                        <th className="px-4 py-2">NIP</th>
                                        <th className="px-4 py-2">Status Karyawan</th>
                                        <th className="px-4 py-2 text-left">Nama</th>
                                        <th className="px-4 py-2">Perusahaan</th>
                                        <th className="px-4 py-2 text-center">Tunjangan</th>
                                        <th className="px-4 py-2">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.map((item) => (
                                        <tr key={item.id} className="hover:bg-green-50">
                                            <td className="px-4 py-1 text-center">{item.nip}</td>
                                            <td className="px-4 py-1 text-center">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${item.status ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                                    {item.status ? "Aktif Bekerja" : "Non-Aktif"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-1">
                                                <div className="font-semibold">{item.nama}</div>
                                                <div className="text-xs text-gray-500">{item.role}</div>
                                            </td>
                                            <td className="px-4 py-1 text-center">{item.perusahaan}</td>
                                            <td className="px-4 py-1 text-center">
                                                <div className="flex justify-center gap-2.5">
                                                    <FontAwesomeIcon icon={faGasPump} title="Uang Bensin" className={`text-sm ${item.bensin ? "text-orange-500" : "text-gray-300"}`} />
                                                    <FontAwesomeIcon icon={faUtensils} title="Voucher Makan" className={`text-sm ${item.makan ? "text-green-500" : "text-gray-300"}`} />
                                                    <FontAwesomeIcon icon={faHotel} title="Biaya Penginapan" className={`text-sm ${item.penginapan ? "text-indigo-500" : "text-gray-300"}`} />
                                                    <FontAwesomeIcon icon={faBriefcase} title="Perjalanan Dinas" className={`text-sm ${item.dinas ? "text-blue-500" : "text-gray-300"}`} />
                                                </div>
                                            </td>
                                            <td className="px-4 py-1 text-center text-xs">
                                                <div className="flex flex-wrap justify-center gap-1.5">
                                                    <button onClick={() => { setSelected(item); setDetailOpen(true); }} className="px-3 py-1.5 bg-blue-500 text-white rounded">
                                                        <FontAwesomeIcon icon={faEye} /> Detail
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setEditData(item);
                                                            setFormOpen(true);
                                                        }}
                                                        className="px-3 py-1.5 bg-amber-400 text-white rounded"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} /> Edit
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(item)}
                                                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} /> Hapus
                                                    </button>
                                                </div>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* MOBILE */}
                        <div className="lg:hidden space-y-3">
                            {paginatedData.map((item) => (
                                <div key={item.id} className="bg-white border rounded-xl px-4 py-3 shadow-sm">
                                    {/* HEADER */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                {item.nama}
                                            </p>
                                            <p className="text-[11px] text-gray-500">
                                                {item.nip}
                                            </p>
                                            <p className="text-[11px] text-gray-500 truncate">
                                                {item.perusahaan}
                                            </p>
                                        </div>

                                        {/* STATUS (optional, kalau mau ditampilkan) */}
                                        <span
                                            className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${item.status
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-500"
                                                }`}
                                        >
                                            {item.status ? "Aktif" : "Non-Aktif"}
                                        </span>
                                    </div>

                                    {/* DIVIDER */}
                                    <div className="my-3 border-t" />

                                    {/* TUNJANGAN */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-sm">
                                            <FontAwesomeIcon
                                                icon={faGasPump}
                                                title="Uang Bensin"
                                                className={item.bensin ? "text-orange-500" : "text-gray-300"}
                                            />
                                            <FontAwesomeIcon
                                                icon={faUtensils}
                                                title="Voucher Makan"
                                                className={item.makan ? "text-green-500" : "text-gray-300"}
                                            />
                                            <FontAwesomeIcon
                                                icon={faHotel}
                                                title="Penginapan"
                                                className={item.penginapan ? "text-indigo-500" : "text-gray-300"}
                                            />
                                            <FontAwesomeIcon
                                                icon={faBriefcase}
                                                title="Perjalanan Dinas"
                                                className={item.dinas ? "text-blue-500" : "text-gray-300"}
                                            />
                                        </div>

                                        {/* ACTION ICON */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelected(item);
                                                    setDetailOpen(true);
                                                }}
                                                title="Detail"
                                                className="
              w-8 h-8 flex items-center justify-center
              rounded-md
              bg-blue-50 text-blue-600
              hover:bg-blue-100 transition
            "
                                            >
                                                <FontAwesomeIcon icon={faEye} className="text-xs" />
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setEditData(item);
                                                    setFormOpen(true);
                                                }}
                                                title="Edit"
                                                className="
              w-8 h-8 flex items-center justify-center
              rounded-md
              bg-amber-50 text-amber-600
              hover:bg-amber-100 transition
            "
                                            >
                                                <FontAwesomeIcon icon={faEdit} className="text-xs" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </>
                )}
            </div>

            {filtered.length > ITEMS_PER_PAGE && (
                <Pagination currentPage={currentPage} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
            )}

            <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title={`Detail Tunjangan ${selected?.nama ?? ""}`} note="Penjelasan jenis tunjangan, arti ikon, serta ketentuan umum pemberian tunjangan karyawan." size="xl">
                <TunjanganDetail data={selected} />
            </Modal>

            <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editData ? "Edit Tunjangan" : "Tambah Tunjangan"}>
                <TunjanganForm editData={editData} onSuccess={() => { setFormOpen(false); fetchData(); }} />
            </Modal>

            {/* INFORMASI */}
            <Modal isOpen={infoOpen} onClose={() => setInfoOpen(false)} title="Informasi Tunjangan Karyawan" note="Penjelasan jenis tunjangan, arti ikon, serta ketentuan umum pemberian tunjangan karyawan." size="lg">
                <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                    <div>
                        <p className="font-medium text-gray-800 mb-1">Gambaran Umum</p>
                        <p>
                            Menu <b>Tunjangan Karyawan</b> digunakan untuk mengatur hak tunjangan yang diterima
                            setiap karyawan berdasarkan peran, kebutuhan operasional, serta kebijakan perusahaan
                            yang berlaku.
                        </p>
                    </div>
                    <div>
                        <p className="font-medium text-gray-800 mb-2">Arti Ikon & Ketentuan Tunjangan</p>
                        <ul className="space-y-3 text-sm text-gray-700 leading-relaxed">
                            <li className="flex items-start gap-2">
                                <FontAwesomeIcon icon={faUtensils} className="text-green-500 mt-1" />
                                <span>
                                    <b>Voucher Makan</b> diberikan apabila:
                                    <ul className="list-disc pl-5 mt-1 space-y-1">
                                        <li>
                                            Karyawan <b>sudah ditandai berhak menerima tunjangan</b>.
                                        </li>
                                        <li>
                                            Melakukan <b>lembur minimal 5 jam</b>.
                                        </li>
                                        <li>
                                            Lembur dilakukan di <b>lokasi kerja lapangan (gerai)</b>.
                                        </li>
                                        <li>
                                            <b>Tidak berlaku</b> untuk lokasi kantor: Kantor Palem, Utan Jati, dan Garuda.
                                        </li>
                                        <li>
                                            <b>Tidak berlaku</b> untuk lembur pada hari Minggu.
                                        </li>
                                    </ul>
                                </span>
                            </li>

                            <li className="flex items-start gap-2">
                                <FontAwesomeIcon icon={faBriefcase} className="text-blue-500 mt-1" />
                                <span>
                                    <b>Perjalanan Dinas</b> diberikan apabila:
                                    <ul className="list-disc pl-5 mt-1 space-y-1">
                                        <li>
                                            Karyawan <b>sudah ditandai berhak menerima tunjangan</b>.
                                        </li>
                                        <li>
                                            Melakukan <b>perjalanan dinas ke luar kota</b>.
                                        </li>
                                        <li>
                                            <b>Melakukan absensi</b> pada hari perjalanan dinas tersebut.
                                        </li>
                                        <li>
                                            Jika karyawan <b>tidak masuk atau tidak absen</b>, maka tunjangan{" "}
                                            <b>dibatalkan</b>.
                                        </li>
                                        <li>
                                            <b>Tidak berlaku</b> untuk hari Minggu.
                                        </li>
                                    </ul>
                                </span>
                            </li>

                            <li className="flex items-start gap-2">
                                <FontAwesomeIcon icon={faGasPump} className="text-orange-500 mt-1" />
                                <span>
                                    <b>Uang Bensin</b> diberikan apabila:
                                    <ul className="list-disc pl-5 mt-1 space-y-1">
                                        <li>
                                            Karyawan <b>sudah ditandai berhak menerima tunjangan</b>.
                                        </li>
                                        <li>
                                            Menggunakan <b>kendaraan pribadi</b>.
                                        </li>
                                        <li>
                                            Bekerja dan melakukan absensi di <b>gerai</b>.
                                        </li>
                                        <li>
                                            <b>Tidak berlaku</b> untuk lokasi kantor: Kantor Palem, Utan Jati, dan Garuda.
                                        </li>
                                        <li>
                                            Absensi dinyatakan <b>sesuai dan memenuhi syarat</b>.
                                        </li>
                                    </ul>
                                </span>
                            </li>

                            <li className="flex items-start gap-2">
                                <FontAwesomeIcon icon={faHotel} className="text-indigo-500 mt-1" />
                                <span>
                                    <b>Biaya Penginapan</b> diberikan apabila:
                                    <ul className="list-disc pl-5 mt-1 space-y-1">
                                        <li>
                                            Karyawan <b>sudah ditandai berhak menerima tunjangan</b>.
                                        </li>
                                        <li>
                                            Melakukan <b>absensi shift malam</b>.
                                        </li>
                                        <li>
                                            Bekerja di <b>gerai</b>, bukan kantor.
                                        </li>
                                        <li>
                                            <b>Tidak berlaku</b> untuk lokasi kantor: Kantor Palem, Utan Jati, dan Garuda.
                                        </li>
                                    </ul>
                                </span>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <p className="font-medium text-gray-800 mb-2">Status Ikon</p>

                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faGasPump} className="text-orange-500" />
                                <span>
                                    <b>Ikon berwarna</b> menandakan tunjangan <b>aktif</b> dan berlaku untuk karyawan
                                    tersebut.
                                </span>
                            </li>

                            <li className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faGasPump} className="text-gray-300" />
                                <span>
                                    <b>Ikon abu-abu</b> menandakan tunjangan <b>tidak aktif</b> atau tidak diberikan.
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="font-medium text-blue-800 mb-1">Catatan Penting</p>
                        <ul className="list-disc pl-5 text-blue-800 space-y-1">
                            <li>Setiap karyawan hanya dapat memiliki satu konfigurasi tunjangan aktif.</li>
                            <li>
                                Perubahan tunjangan akan langsung memengaruhi perhitungan hak karyawan terkait.
                            </li>
                            <li>
                                Pastikan data karyawan dan kebijakan perusahaan sudah sesuai sebelum menyimpan
                                perubahan.
                            </li>
                        </ul>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TunjanganKaryawan;
