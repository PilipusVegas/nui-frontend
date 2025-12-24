import { useEffect, useState } from "react";
import { fetchWithJwt } from "../../utils/jwtHelper";
import Select from "react-select";

const TunjanganForm = ({ editData, onSuccess }) => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [loadingUser, setLoadingUser] = useState(false);
    const [userOptions, setUserOptions] = useState([]);
    const [form, setForm] = useState({
        id_user: editData?.id_user || null,
        bensin: editData?.bensin || 0,
        makan: editData?.makan || 0,
        penginapan: editData?.penginapan || 0,
        dinas: editData?.dinas || 0,
    });

    const selectStyles = {
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
                ? "#E5F7ED"   // hijau lembut untuk selected
                : state.isFocused
                    ? "#F9FAFB"   // abu hover tipis
                    : "white",
            color: "#1F2937",
            cursor: "pointer",
        }),
    };




    /* FETCH PROFIL (MODE TAMBAH) */
    useEffect(() => {
        if (editData) return;

        const fetchProfil = async () => {
            try {
                setLoadingUser(true);
                const res = await fetchWithJwt(`${apiUrl}/tunjangan/user/profil`);
                const json = await res.json();

                if (json.success) {
                    setUserOptions(
                        json.data.map((u) => ({
                            value: u.id,
                            label: (
                                <div className="flex justify-between items-start gap-4 leading-tight">
                                    <div>
                                        <div className="font-medium text-gray-800">
                                            {u.nama}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {u.nip} • {u.role}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 text-right whitespace-nowrap">
                                        {u.perusahaan}
                                    </div>
                                </div>
                            ),
                            raw: u,
                        }))
                    );
                }
            } finally {
                setLoadingUser(false);
            }
        };

        fetchProfil();
    }, [editData, apiUrl]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        const tunjanganPayload = {
            bensin: form.bensin,
            makan: form.makan,
            penginapan: form.penginapan,
            dinas: form.dinas,
        };

        // MODE EDIT
        if (editData) {
            await fetchWithJwt(
                `${apiUrl}/tunjangan/user/${editData.id_user}`,
                {
                    method: "PUT",
                    body: JSON.stringify({
                        tunjangan: tunjanganPayload,
                    }),
                }
            );

            onSuccess();
            return;
        }

        // MODE TAMBAH
        await fetchWithJwt(
            `${apiUrl}/tunjangan/user`,
            {
                method: "POST",
                body: JSON.stringify({
                    id_user: form.id_user,
                    tunjangan: tunjanganPayload,
                }),
            }
        );
        onSuccess();
    };

    const CheckboxCard = ({ label, name }) => {
        const checked = form[name] === 1;

        return (
            <div onClick={() => setForm({ ...form, [name]: checked ? 0 : 1 })} className={`cursor-pointer select-none flex items-center gap-3 rounded-lg border px-4 py-3 transition ${checked ? "border-green-500 bg-green-50" : "border-gray-200 bg-white hover:bg-gray-50"}`}>
                <input type="checkbox" checked={checked} readOnly className="w-4 h-4 accent-green-600 pointer-events-none" />
                <span className="text-sm font-medium text-gray-800">
                    {label}
                </span>
            </div>
        );
    };

    const isAllChecked =
        form.bensin &&
        form.makan &&
        form.penginapan &&
        form.dinas;

    const handleCheckAll = (checked) => {
        setForm({
            ...form,
            bensin: checked ? 1 : 0,
            makan: checked ? 1 : 0,
            penginapan: checked ? 1 : 0,
            dinas: checked ? 1 : 0,
        });
    };


    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* ================= EDIT MODE ================= */}
            {editData && (
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="leading-tight">
                            <p className="text-base font-semibold text-gray-900">
                                {editData.nama}
                            </p>
                            <p className="text-sm text-gray-600">
                                NIP {editData.nip} • {editData.role}
                            </p>
                            <p className="text-sm text-gray-500">
                                {editData.perusahaan}
                            </p>
                        </div>
                    </div>
                </div>
            )}


            {/* ================= TAMBAH MODE ================= */}
            {!editData && (
                <div className="space-y-2">
                    {/* LABEL */}
                    <label className="block text-sm font-semibold text-gray-700">
                        Pilih Karyawan
                        <span className="ml-1 text-xs font-normal text-gray-500">
                            (Nama atau NIP)
                        </span>
                    </label>

                    {/* SELECT */}
                    <div className="relative">
                        <Select
                            options={userOptions}
                            isLoading={loadingUser}
                            placeholder="Ketik nama atau NIP karyawan..."
                            onChange={(opt) =>
                                setForm({ ...form, id_user: opt?.value || null })
                            }
                            styles={selectStyles}
                        />

                    </div>

                    {/* HELPER TEXT */}
                    <p className="text-xs text-gray-500">
                        Digunakan untuk menentukan karyawan yang akan diberikan tunjangan.
                    </p>
                </div>
            )}


            {/* ================= TUNJANGAN ================= */}
            <div className="space-y-3">
                <div onClick={() => handleCheckAll(!isAllChecked)} className={`cursor-pointer select-none rounded-xl border px-5 py-4 transition ${isAllChecked ? "border-green-500 bg-green-50" : "border-gray-200 bg-white hover:bg-gray-50"}`}>
                    <div className="flex items-start gap-3">
                        <input type="checkbox" checked={isAllChecked} readOnly className="w-4 h-4 mt-0.5 accent-green-600 pointer-events-none" />
                        <div>
                            <p className="text-sm font-semibold text-gray-900">
                                Semua Tunjangan
                            </p>
                            <p className="text-xs text-gray-500">
                                Aktifkan seluruh jenis tunjangan untuk karyawan ini
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-sm font-medium text-gray-700">
                        Jenis Tunjangan
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <CheckboxCard label="Uang Bensin" name="bensin" />
                        <CheckboxCard label="Voucher Makan" name="makan" />
                        <CheckboxCard label="Biaya Penginapan" name="penginapan" />
                        <CheckboxCard label="Perjalanan Dinas" name="dinas" />
                    </div>
                </div>
            </div>

            <button type="submit" disabled={!form.id_user} className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-2.5 rounded-lg font-semibold transition">
                Simpan Tunjangan
            </button>
        </form>
    );
};

export default TunjanganForm;
