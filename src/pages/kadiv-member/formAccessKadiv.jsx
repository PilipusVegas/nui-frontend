import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Modal } from "../../components";
import { fetchWithJwt } from "../../utils/jwtHelper";

const FormAccessKadiv = ({ isOpen, onClose, onSuccess, editData }) => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;

    const [listUser, setListUser] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch list user
    useEffect(() => {
        if (!isOpen) return;

        const loadData = async () => {
            try {
                const res = await fetchWithJwt(`${apiUrl}/profil`);
                const json = await res.json();

                if (json.success) {
                    let filtered = json.data
                        .filter((u) => u.status === 1)               // hanya aktif
                        .filter((u) => !u.is_kadiv && !u.is_member); // bukan kadiv/member

                    // --- Penting: Saat edit, tambahkan user yang sedang dipakai ---
                    if (editData) {
                        const currentUser = json.data.find(
                            (u) => u.id === editData.id_user
                        );

                        if (currentUser) {
                            const exists = filtered.some(
                                (u) => u.id === currentUser.id
                            );

                            if (!exists) {
                                filtered.unshift(currentUser);
                            }
                        }
                    }

                    const options = filtered.map((u) => ({
                        value: u.id,
                        label: u.nama,
                        role: u.role,
                    }));

                    setListUser(options);
                }
            } catch (err) {
                console.error("Gagal memuat data:", err);
            }
        };

        loadData();
    }, [isOpen, apiUrl, editData]);


    useEffect(() => {
        if (editData && listUser.length > 0) {
            const found = listUser.find((x) => x.value === editData.id_kadiv);
            setSelectedUser(found || null);
        } else if (!editData) {
            setSelectedUser(null);
        }
    }, [editData, listUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = { id_user: Number(selectedUser.value) };

            let url = `${apiUrl}/profil/kadiv-access`;
            let method = "POST";

            if (editData) {
                url = `${apiUrl}/profil/kadiv-access/${editData.id}`;
                method = "PUT";
            }

            const res = await fetchWithJwt(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (data.success) {
                onSuccess();
                onClose();
            }
        } catch (err) {
            console.error("Error submit:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editData ? "Edit Akses Kadiv" : "Tambah Akses Kadiv"} note={editData  ? "Ganti kepala divisi sambil mempertahankan anggota yang ada."  : "Tambahkan kepala divisi baru."}>

            <form onSubmit={handleSubmit} className="grid gap-4 text-sm text-gray-700">

                <div>
                    <label className="block mb-1 font-medium">Pilih User</label>
                    <Select value={selectedUser} onChange={setSelectedUser} options={listUser} placeholder="Cari nama user..." required menuPortalTarget={document.body}
                        styles={{
                            menuPortal: (base) => ({
                                ...base,
                                zIndex: 999999,
                            }),
                            menu: (base) => ({
                                ...base,
                                zIndex: 999999,
                            }),
                        }}
                        formatOptionLabel={(option) => (
                            <div className="flex justify-between items-center w-full">
                                <span className="font-medium text-gray-800">{option.label}</span>
                                <span className="text-gray-800 text-xs">{option.role}</span>
                            </div>
                        )}
                    />

                </div>

                <button type="submit" disabled={loading || !selectedUser} className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow active:scale-95 transition-all">
                    {loading ? "Menyimpan..." : editData ? "Perbarui" : "Tambah"}
                </button>
            </form>
        </Modal >
    );
};

export default FormAccessKadiv;
