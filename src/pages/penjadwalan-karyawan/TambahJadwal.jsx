import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import toast from "react-hot-toast";
import { SectionHeader } from "../../components";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCalendarCheck } from "@fortawesome/free-solid-svg-icons";

const selectStyle = {
    control: (base) => ({
        ...base,
        borderRadius: "0.5rem",
        minHeight: "42px",
    }),
    menu: (base) => ({
        ...base,
        maxHeight: 200,
    }),
    menuList: (base) => ({
        ...base,
        maxHeight: 200,
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};


const TambahPenjadwalanUser = () => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const { id_user } = useParams();

    const [userInfo, setUserInfo] = useState(null);
    const [shiftList, setShiftList] = useState([]);
    const [lokasiList, setLokasiList] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        id_shift: "",
        lokasi: [],
        start_date: "",
        end_date: "",
        permanent: 0, // 0 = false, 1 = true
    });

    const today = new Date().toISOString().split("T")[0];
    const [selectedShift, setSelectedShift] = useState(null);


    /* FETCH MASTER */
    useEffect(() => {
        const fetchMaster = async () => {
            try {
                const [shiftRes, lokasiRes] = await Promise.all([
                    fetchWithJwt(`${apiUrl}/shift`),
                    fetchWithJwt(`${apiUrl}/lokasi`),
                ]);
                setShiftList((await shiftRes.json()).data || []);
                setLokasiList((await lokasiRes.json()).data || []);
            } catch {
                toast.error("Gagal memuat data master");
            }
        };

        fetchMaster();
    }, [apiUrl]);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const res = await fetchWithJwt(
                    `${apiUrl}/jadwal/detail/${id_user}`
                );
                const json = await res.json();

                if (!res.ok || !json?.data) {
                    throw new Error();
                }

                const data = Array.isArray(json.data)
                    ? json.data[0]
                    : json.data;

                setUserInfo({
                    nama: data.nama,
                    role: data.role,
                    perusahaan: data.perusahaan,
                });
            } catch {
                toast.error("Gagal memuat informasi karyawan");
            }
        };

        fetchUserInfo();
    }, [apiUrl, id_user]);


    /* LOKASI HANDLER */
    const handleTambahLokasi = (opt) => {
        if (!opt) return;
        setForm((prev) => ({
            ...prev,
            lokasi: [...prev.lokasi, opt.value],
        }));
    };

    const handleHapusLokasi = (idLokasi) => {
        setForm((prev) => ({
            ...prev,
            lokasi: prev.lokasi.filter((id) => id !== idLokasi),
        }));
    };

    /* SUBMIT */
    const handleSubmit = async () => {
        if (submitting) return;

        const { id_shift, lokasi, start_date, end_date, permanent } = form;

        if (!id_shift || !lokasi.length) {
            toast.error("Shift dan lokasi wajib diisi");
            return;
        }

        if (permanent === 0 && (!start_date || !end_date)) {
            toast.error("Rentang tanggal wajib diisi");
            return;
        }

        try {
            setSubmitting(true);

            const res = await fetchWithJwt(
                `${apiUrl}/jadwal/${id_user}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id_shift: Number(id_shift),
                        permanent,
                        start_date: permanent === 1 ? null : start_date,
                        end_date: permanent === 1 ? null : end_date,
                        location: lokasi,
                    }),
                }
            );

            const json = await res.json();
            if (!res.ok || json.success === false) {
                throw new Error(json.message || "Gagal menambahkan penjadwalan");
            }

            toast.success("Penjadwalan berhasil ditambahkan");
            navigate(-1);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };



    return (
        <div>
            <SectionHeader title="Tambah Jadwal" subtitle="Jadwalkan Shift dan Lokasi Penugasan." onBack={() => navigate(-1)} />
            {userInfo && (
                <div className="mt-6 bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Informasi Karyawan
                    </div>
                    <div className="mt-1 text-lg font-semibold text-gray-900">
                        {userInfo.nama}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium text-gray-700">
                            {userInfo.role}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span>{userInfo.perusahaan}</span>
                    </div>
                </div>
            )}

            <div className="mx-auto mt-6 bg-white rounded-xl shadow-sm border w-full px-4 sm:px-6 py-6 space-y-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Shift Kerja
                    </label>
                    <Select placeholder="Pilih shift..."
                        options={shiftList.map((s) => ({
                            value: s.id,
                            label: s.nama,
                        }))}
                        onChange={(o) => {
                            const shift = shiftList.find((s) => s.id === o?.value);
                            setForm((prev) => ({
                                ...prev,
                                id_shift: o?.value || "",
                            }));
                            setSelectedShift(shift || null);
                        }}
                        styles={selectStyle}
                        menuPortalTarget={document.body}
                    />
                    {selectedShift && (
                        <div className="mt-4 border rounded-xl p-4 bg-gray-50">
                            <div className="text-sm font-semibold text-gray-800 mb-3">
                                Detail Jadwal Shift
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                {selectedShift.detail.map((d, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-white border rounded-lg px-3 py-2">
                                        <span className="font-medium text-gray-700">
                                            {d.hari}
                                        </span>
                                        <span className="text-gray-600">
                                            {d.jam_masuk} – {d.jam_pulang}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-gray-300 bg-white p-4">
                    <div className="flex items-center justify-between gap-4">
                        {/* LEFT CONTENT */}
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-green-600">
                                <FontAwesomeIcon icon={faCalendarCheck} />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    Penjadwalan Permanen
                                </p>
                                <p className="mt-0.5 text-xs text-gray-700 leading-relaxed">
                                    {form.permanent === 1? "Jadwal ini berlaku permanent dan tidak menggunakan tanggal mulai maupun tanggal selesai." : "Aktifkan jika jadwal ingin berlaku permanent tanpa tanggal mulai dan tanggal selesai."}
                                </p>
                            </div>
                        </div>

                        {/* TOGGLE */}
                        <button type="button"
                            onClick={() =>
                                setForm((prev) => ({
                                    ...prev,
                                    permanent: prev.permanent === 1 ? 0 : 1,
                                }))
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                            ${form.permanent === 1 ? "bg-green-600" : "bg-gray-400"}`}
                            aria-label="Toggle penjadwalan permanen"
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200
                                ${form.permanent === 1 ? "translate-x-6" : "translate-x-1"}`}
                            />
                        </button>
                    </div>
                </div>


                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tanggal Mulai
                        </label>
                        <input type="date" min={today} value={form.start_date} disabled={form.permanent === 1}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    start_date: e.target.value,
                                    end_date:
                                        prev.end_date && e.target.value > prev.end_date
                                            ? ""
                                            : prev.end_date,
                                }))
                            }
                            className="w-full border rounded-lg px-3 py-2 text-sm disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tanggal Selesai
                        </label>
                        <input type="date" min={form.start_date || today} value={form.end_date} disabled={form.permanent === 1}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    end_date: e.target.value,
                                }))
                            }
                            className="w-full border rounded-lg px-3 py-2 text-sm disabled:bg-gray-100"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lokasi Absensi
                    </label>
                    <Select placeholder="Tambah lokasi..." value={null}
                        options={lokasiList
                            .filter((l) => !form.lokasi.includes(l.id))
                            .map((l) => ({
                                value: l.id,
                                label: l.nama,
                            }))}
                        onChange={handleTambahLokasi}
                        styles={selectStyle}
                        menuPlacement="top"
                        menuPortalTarget={document.body}
                    />

                    {form.lokasi.length > 0 && (
                        <div className="mt-4">
                            <p className="text-xs font-medium text-gray-500 mb-2">
                                Lokasi yang dipilih
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {lokasiList
                                    .filter((l) => form.lokasi.includes(l.id))
                                    .map((l) => (
                                        <div key={l.id} className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-full text-xs">
                                            <span className="font-medium">
                                                {l.nama}
                                            </span>

                                            <button type="button" onClick={() => handleHapusLokasi(l.id)} className="flex items-center justify-center w-4 h-4 rounded-full text-green-700 hover:text-red-600 hover:bg-red-100 transition" title="Hapus lokasi">
                                                <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                                            </button>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ACTION */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                    <button onClick={() => navigate(-1)} className="px-4 py-2 text-sm bg-gray-200 rounded" disabled={submitting}>
                        Batal
                    </button>
                    <button onClick={handleSubmit} disabled={submitting} className="px-5 py-2 text-sm font-semibold rounded text-white bg-green-600 hover:bg-green-700 disabled:bg-green-300">
                        {submitting ? "Menyimpan..." : "Simpan"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TambahPenjadwalanUser;