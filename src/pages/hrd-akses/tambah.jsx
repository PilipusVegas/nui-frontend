import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserTie, faSave, faArrowLeft, faTimes, faBuilding } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { SectionHeader } from "../../components/";
import toast from "react-hot-toast";

const TambahAksesHRD = () => {
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_BASE_URL;

    const [allHRD, setAllHRD] = useState([]);
    const [allPerusahaan, setAllPerusahaan] = useState([]);
    const [selectedHRD, setSelectedHRD] = useState(null);
    const [selectedPerusahaan, setSelectedPerusahaan] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profilRes = await fetch(`${apiUrl}/profil`, {
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                const profilJson = await profilRes.json();

                const perusahaanRes = await fetch(`${apiUrl}/perusahaan`, {
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                const perusahaanJson = await perusahaanRes.json();

                setAllHRD(
                    (profilJson.data || []).map(u => ({
                        value: u.id,
                        label: `${u.nama} (${u.role ?? "Tanpa Role"})`,
                        role: u.role,
                    }))
                );

                setAllPerusahaan(
                    (perusahaanJson.data || []).map(p => ({
                        value: p.id,
                        label: p.nama,
                        alamat: p.alamat,
                    }))
                );
            } catch (err) {
                console.error("❌ Gagal fetch data:", err);
            }
        };

        fetchData();
    }, [apiUrl]);

    const handleAddPerusahaan = (selectedOption) => {
        if (selectedOption && !selectedPerusahaan.some(p => p.value === selectedOption.value)) {
            setSelectedPerusahaan(prev => [...prev, selectedOption]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedHRD) return toast.error("Pilih HRD terlebih dahulu.");
        if (selectedPerusahaan.length === 0) return toast.error("Pilih minimal satu perusahaan.");

        setSubmitting(true);
        try {
            const payload = {
                id_hrd: selectedHRD.value,
                perusahaan_list: selectedPerusahaan.map(p => p.value),
            };
            const response = await fetchWithJwt(`${apiUrl}/profil/hrd-access`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (result.success) {
                toast.success("✅ Akses HRD berhasil ditambahkan!");
                setTimeout(() => navigate(-1), 1000); // beri jeda supaya toast terlihat
            } else {
                toast.error("❌ Gagal menambahkan akses HRD: " + (result.message || "Terjadi kesalahan"));
            }
        } catch (err) {
            console.error("Error:", err);
            toast.error("❌ Terjadi kesalahan server.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemovePerusahaan = (id) => {
        setSelectedPerusahaan(prev => prev.filter(p => p.value !== id));
    };

    return (
        <div className="w-full">
            <SectionHeader title="Tambah Akses HRD" subtitle="Tambahkan HRD dan tentukan perusahaan yang dapat dikelolanya." onBack={() => navigate(-1)} />

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-xl border border-gray-200 p-8 mt-6 flex flex-col min-h-[70vh]">
                {/* Pilih HRD */}
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2 text-sm uppercase tracking-wide">
                        Pilih HRD / User
                    </label>
                    <Select
                        value={selectedHRD}
                        onChange={setSelectedHRD}
                        options={allHRD}
                        placeholder="Cari atau pilih user..."
                        className="text-sm"
                        classNames={{
                            control: () => "border-gray-300 shadow-sm hover:border-green-400 focus:ring-2 focus:ring-green-200 rounded-lg"
                        }}
                        styles={{
                            option: (base, state) => ({
                                ...base,
                                backgroundColor: state.isFocused ? "#f0fdf4" : "white",
                                color: "#333",
                            }),
                        }}
                    />
                    {selectedHRD && (
                        <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                            <FontAwesomeIcon icon={faUserTie} className="text-green-600" />
                            <span className="font-medium">{selectedHRD.label}</span>
                        </div>
                    )}
                </div>

                {/* Pilih Perusahaan */}
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2 text-sm uppercase tracking-wide">
                        Pilih Perusahaan
                    </label>
                    <Select isClearable isSearchable value={null} onChange={handleAddPerusahaan} options={allPerusahaan.filter(p => !selectedPerusahaan.some(sel => sel.value === p.value))} placeholder="Cari atau pilih perusahaan..." className="text-sm" classNames={{ control: () => "border-gray-300 shadow-sm hover:border-green-400 focus:ring-2 focus:ring-green-200 rounded-lg" }} />
                </div>

                {/* Card Perusahaan */}
                {selectedPerusahaan.length > 0 && (
                    <div className="mt-4">
                        <span className="font-semibold text-gray-800 mb-2 inline-block">
                            Perusahaan yang dipilih:
                        </span>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                            {selectedPerusahaan.map((p) => (
                                <div key={p.value} className="border border-gray-200 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FontAwesomeIcon icon={faBuilding} className="text-green-600" />
                                        <h4 className="font-medium text-gray-800 text-sm">
                                            {p.label}
                                        </h4>
                                    </div>
                                    <button type="button" onClick={() => handleRemovePerusahaan(p.value)} className="text-red-500 hover:text-red-600 text-sm font-medium">
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {/* Tombol Aksi */}
                <div className="flex justify-between gap-3 mt-auto pt-6 border-t border-gray-100">
                    <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200 flex items-center gap-2">
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Kembali
                    </button>
                    <button type="submit" disabled={submitting} className={`px-6 py-2.5 rounded-lg text-white font-medium flex items-center gap-2 transition-all duration-200 ${submitting ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg"}`}>
                        <FontAwesomeIcon icon={faSave} />
                        {submitting ? "Menyimpan..." : "Simpan Akses HRD"}
                    </button>
                </div>
            </form>
        </div>
    );

};

export default TambahAksesHRD;
