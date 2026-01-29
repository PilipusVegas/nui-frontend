import React, { useState, useEffect } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faSearch } from "@fortawesome/free-solid-svg-icons";
import { SectionHeader } from "../../components";
import RemarkInfoModal from "./RemarkInfoModal";
import RemarkForm from "./RemarkForm";

const AbsenManual = () => {
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [profil, setProfil] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [lokasi, setLokasi] = useState([]);
    const [idUser, setIdUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [absenData, setAbsenData] = useState(null);
    const [isChecked, setIsChecked] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    /* LOAD MASTER DATA — TIDAK DIUBAH */
    useEffect(() => {
        (async () => {
            try {
                const [u, s, l] = await Promise.all([
                    fetchWithJwt(`${apiUrl}/profil`).then(r => r.json()),
                    fetchWithJwt(`${apiUrl}/shift`).then(r => r.json()),
                    fetchWithJwt(`${apiUrl}/lokasi`).then(r => r.json()),
                ]);

                setProfil((u.data || []).filter(x => x.status === 1));
                setShifts(s.data || []);
                setLokasi(l.data || []);
            } catch {
                toast.error("Gagal memuat data awal");
            }
        })();
    }, [apiUrl]);

    /* CHANGE USER — TIDAK DIUBAH */
    useEffect(() => {
        if (!idUser) {
            setSelectedUser(null);
            setIsChecked(false);
            setAbsenData(null);
            return;
        }

        const user = profil.find(p => p.id === idUser);
        setSelectedUser(user || null);
        setIsChecked(false);
        setAbsenData(null);
    }, [idUser, profil]);

    /* CEK ABSEN — TIDAK DIUBAH */
    const cekAbsen = async () => {
        if (!idUser || !selectedDate) {
            toast.error("Pilih karyawan dan tanggal");
            return;
        }

        if (new Date(selectedDate).getDay() === 0) {
            toast.error("Hari Minggu tidak bisa dipilih");
            return;
        }

        try {
            const res = await fetchWithJwt(
                `${apiUrl}/absen/cek-manual/${idUser}?date=${selectedDate}`
            );
            const json = await res.json();
            const absen = Array.isArray(json.data)
                ? json.data[0] || null
                : json.data;
            setAbsenData(absen);
            setIsChecked(true);
            toast.success(absen ? "Data absen ditemukan" : "Belum ada absen, silakan buat baru");
        } catch {
            toast.error("Gagal cek absensi");
        }
    };

    const resetFormResult = () => {
        setIsChecked(false);
        setAbsenData(null);
    };


    return (
        <div className="flex flex-col">
            <SectionHeader title="Remark Absensi" subtitle="Berikan Catatan untuk Absensi Karyawan" onBack={() => navigate("/")}
                actions={
                    <button onClick={() => setShowInfo(true)} className="bg-blue-500 text-white px-3 py-2 rounded flex items-center">
                        <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                        Informasi
                    </button>
                }
            />

            <div className="p-4 space-y-6 mb-20">
                {/* FORM INDEX — TANGGAL & NAMA (TETAP ADA) */}
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        cekAbsen();
                    }}
                    className="bg-white p-6 rounded-xl shadow border space-y-4"
                >
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Tanggal
                            </label>
                            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="border rounded px-3 py-2 w-full" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Nama Karyawan
                            </label>
                            <Select options={profil.map(p => ({
                                    value: p.id,
                                    label: `(${p.role || "-"}) - ${p.nama}`,
                                }))}
                                value={
                                    idUser
                                        ? (() => {
                                            const p = profil.find(x => x.id === idUser);
                                            return p
                                                ? {
                                                    value: p.id,
                                                    label: `(${p.role || "-"}) - ${p.nama}`,
                                                }
                                                : null;
                                        })()
                                        : null
                                }
                                onChange={opt => setIdUser(opt?.value || null)}
                                isClearable
                                placeholder="Pilih karyawan"
                            />

                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button className="bg-green-600 text-white px-5 py-2 rounded flex items-center">
                            <FontAwesomeIcon icon={faSearch} className="mr-2" />
                            Cek Absensi
                        </button>
                    </div>
                </form>

                {/* FORM RESULT — DIPINDAHKAN TANPA HILANG LOGIC */}
                {isChecked && (
                    <RemarkForm apiUrl={apiUrl} navigate={navigate} selectedDate={selectedDate} selectedUser={selectedUser} absenData={absenData} shifts={shifts} lokasi={lokasi} onSuccess={resetFormResult} />
                )}

            </div>

            <RemarkInfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
        </div>
    );
};

export default AbsenManual;