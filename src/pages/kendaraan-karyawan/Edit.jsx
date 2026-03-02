import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { Modal } from "../../components/";

const EditKendaraanKaryawan = ({ isOpen, onClose, apiUrl, data, onSuccess }) => {
    const [users, setUsers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [idUser, setIdUser] = useState("");
    const [idVehicle, setIdVehicle] = useState("");

    useEffect(() => {
        if (isOpen && data) {
            setIdUser(data.id_user);
            setIdVehicle(data.id_kendaraan);
            fetchMasterData();
        }
    }, [isOpen, data]);

    const fetchMasterData = async () => {
        try {
            const [userRes, vehicleRes] = await Promise.all([
                fetchWithJwt(`${apiUrl}/profil`),
                fetchWithJwt(`${apiUrl}/vehicles`)
            ]);

            setUsers((await userRes.json()).data || []);
            setVehicles((await vehicleRes.json()).data || []);
        } catch {
            Swal.fire("Error", "Gagal memuat data", "error");
        }
    };

    const handleSubmit = async () => {
        try {
            const res = await fetchWithJwt(
                `${apiUrl}/vehicles/users/${data.id_user_kendaraan}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id_user: idUser,
                        id_kendaraan: idVehicle,
                    }),
                }
            );

            if (!res.ok) throw new Error();

            Swal.fire("Berhasil", "Data berhasil diperbarui", "success");
            onClose();
            onSuccess();
        } catch {
            Swal.fire("Gagal", "Gagal memperbarui data", "error");
        }
    };

    if (!data) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Kendaraan Karyawan" note="Perubahan hanya memengaruhi relasi karyawan dan kendaraan." size="md"
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
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
                    >
                        Simpan Perubahan
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                <select
                    value={idUser}
                    onChange={(e) => setIdUser(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                    {users.map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.nama} ({u.nip})
                        </option>
                    ))}
                </select>

                <select
                    value={idVehicle}
                    onChange={(e) => setIdVehicle(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                    {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                            {v.nama_kendaraan}
                        </option>
                    ))}
                </select>
            </div>
        </Modal>
    );
};

export default EditKendaraanKaryawan;