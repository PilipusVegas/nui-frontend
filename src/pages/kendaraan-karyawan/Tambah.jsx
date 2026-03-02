import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { Modal } from "../../components";
import Select from "react-select";

const TambahKendaraanKaryawan = ({ isOpen, onClose, apiUrl, onSuccess }) => {
    const [users, setUsers] = useState([]);
    const [vehicles, setVehicles] = useState([]);

    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchMasterData();
            setSelectedUser(null);
            setSelectedVehicle(null);
        }
    }, [isOpen]);

    const fetchMasterData = async () => {
        try {
            const [userRes, vehicleRes] = await Promise.all([
                fetchWithJwt(`${apiUrl}/profil`),
                fetchWithJwt(`${apiUrl}/vehicles`)
            ]);

            setUsers((await userRes.json()).data || []);
            setVehicles((await vehicleRes.json()).data || []);
        } catch {
            Swal.fire("Error", "Gagal memuat data master", "error");
        }
    };

    /* ======================
     * React Select Options
     * ====================== */
    const userOptions = useMemo(
        () =>
            users.map((u) => ({
                value: u.id,
                label: `${u.nama} (${u.nip})`,
            })),
        [users]
    );

    const vehicleOptions = useMemo(
        () =>
            vehicles.map((v) => ({
                value: v.id,
                label: `${v.nama} • ${v.tahun} • ${v.nama_bb}`,
            })),
        [vehicles]
    );

    /* ======================
     * Submit
     * ====================== */
    const handleSubmit = async () => {
        if (!selectedUser || !selectedVehicle) {
            return Swal.fire(
                "Validasi",
                "Karyawan dan kendaraan wajib dipilih",
                "warning"
            );
        }

        setLoading(true);
        try {
            const res = await fetchWithJwt(`${apiUrl}/vehicles/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_user: selectedUser.value,
                    id_kendaraan: selectedVehicle.value,
                }),
            });

            if (!res.ok) throw new Error();

            Swal.fire(
                "Berhasil",
                "Kendaraan berhasil ditautkan ke karyawan",
                "success"
            );
            onClose();
            onSuccess();
        } catch {
            Swal.fire("Gagal", "Gagal menambahkan data", "error");
        } finally {
            setLoading(false);
        }
    };

    const kendaraanTidakAdaMessage = () => (
        <div className="text-sm text-gray-700">
            Kendaraan yang Anda cari tidak ada?
            <div
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => window.open("/data-kendaraan", "_blank")}
                className="mt-1 text-green-600 font-medium underline cursor-pointer"
            >
                Tambah data kendaraan
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Tambah Kendaraan Karyawan"
            note="Pilih karyawan dan kendaraan yang akan ditautkan."
            size="md"
            footer={
                <>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-lg"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    >
                        Simpan
                    </button>
                </>
            }
        >
            <div className="space-y-5">
                {/* ================= KARYAWAN ================= */}
                <div>
                    <label className="text-sm font-medium mb-1 block">
                        Karyawan
                    </label>
                    <Select
                        options={userOptions}
                        value={selectedUser}
                        onChange={setSelectedUser}
                        placeholder="Cari nama atau NIP karyawan..."
                        isClearable
                        classNamePrefix="react-select"
                        menuPortalTarget={document.body}
                        styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                        noOptionsMessage={() => "Karyawan tidak ditemukan"}
                    />
                </div>

                {/* ================= KENDARAAN ================= */}
                <div>
                    <label className="text-sm font-medium mb-1 block">
                        Kendaraan
                    </label>
                    <Select
                        options={vehicleOptions}
                        value={selectedVehicle}
                        onChange={setSelectedVehicle}
                        placeholder="Cari kendaraan..."
                        isClearable
                        classNamePrefix="react-select"
                        menuPortalTarget={document.body}
                        styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                        noOptionsMessage={kendaraanTidakAdaMessage}
                    />

                    {/* EMPTY STATE */}
                    {vehicleOptions.length === 0 && (
                        <div className="mt-2 text-sm text-red-600">
                            Kendaraan masih kosong.
                            <span className="ml-1">
                                Silakan tambahkan melalui menu{" "}
                                <span
                                    onClick={() => window.open("/data-kendaraan", "_blank")}
                                    className="underline cursor-pointer font-medium"
                                >
                                    Data Kendaraan
                                </span>
                                .
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default TambahKendaraanKaryawan;