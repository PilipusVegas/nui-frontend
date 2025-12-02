// components/DetailKadiv.jsx

import React, { useMemo, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUserTie,
    faBuilding,
    faUsers,
    faTrash,
    faPen,
    faPencil,
} from "@fortawesome/free-solid-svg-icons";

import { fetchWithJwt } from "../../utils/jwtHelper";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";

// COMPONENTS
import {
    LoadingSpinner,
    ErrorState,
    EmptyState,
    SearchBar,
} from "../../components";
import { id } from "date-fns/locale";

const DetailKadiv = ({ data, onRefresh }) => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;

    const [loadingAction, setLoadingAction] = useState(false);
    const [search, setSearch] = useState("");
    const [members, setMembers] = useState(data?.member ?? []);
    const [selectedIds, setSelectedIds] = useState([]);
    const [listKadiv, setListKadiv] = useState([]);

    useEffect(() => {
        const loadKadiv = async () => {
            try {
                const res = await fetchWithJwt(`${apiUrl}/profil/kadiv-access`);
                const json = await res.json();
                if (json.success) {
                    setListKadiv(json.data);
                }
            } catch {
                toast.error("Gagal memuat daftar Kadiv");
            }
        };
        loadKadiv();
    }, []);

    useEffect(() => {
        setMembers(data?.member ?? []);
    }, [data]);

    const memberList = members;

    const filteredMembers = useMemo(() => {
        if (!search.trim()) return memberList;

        const q = search.toLowerCase();
        return memberList.filter(
            (m) =>
                m.nama.toLowerCase().includes(q) ||
                m.nip.toLowerCase().includes(q) ||
                m.role.toLowerCase().includes(q)
        );
    }, [search, memberList]);

    if (!data) {
        return (
            <ErrorState
                message="Data Kadiv tidak ditemukan"
                detail="Silakan kembali ke halaman sebelumnya dan lakukan muat ulang."
            />
        );
    }

    const handleDelete = async (id_member) => {
        const sure = await Swal.fire({
            title: "Hapus Member?",
            text: "Member ini akan dihapus dari daftar anggota Kadiv.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, hapus",
            cancelButtonText: "Batal",
        });

        if (!sure.isConfirmed) return;

        try {
            setLoadingAction(true);

            const res = await fetchWithJwt(
                `${apiUrl}/profil/kadiv-access/member/${id_member}`,
                { method: "DELETE" }
            );
            const json = await res.json();

            if (json.success) {
                toast.success("Member berhasil dihapus!");
                setMembers(prev => prev.filter(m => m.id_member !== id_member));
                onRefresh?.();
            } else {
                toast.error(json.message || "Gagal menghapus member");
            }
        } catch (err) {
            toast.error("Terjadi kesalahan server");
        } finally {
            setLoadingAction(false);
        }
    };

    const handleUpdate = async (id_member, id_user) => {
        // Dropdown → ambil ID (primary key) dari Kadiv
        const kadivOptions = listKadiv
            .map(k => `<option value="${k.id}">${k.nama} - ${k.nip}</option>`)
            .join("");

        const { value: selectedKadiv } = await Swal.fire({
            title: "Pindahkan ke Kadiv lain",
            html: `
            <select id="kadivSelect" class="swal2-select" style="width:100%; padding:8px;">
                ${kadivOptions}
            </select>
        `,
            preConfirm: () => document.getElementById("kadivSelect").value,
            showCancelButton: true,
            confirmButtonText: "Pindahkan",
            cancelButtonText: "Batal",
        });

        if (!selectedKadiv) return;

        try {
            setLoadingAction(true);

            const res = await fetchWithJwt(
                `${apiUrl}/profil/kadiv-access/member/${id_member}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id_kadiv: Number(selectedKadiv),
                        id_user: members.find(m => m.id_member === id_member).id_user,
                    }),
                }
            );

            const json = await res.json();
            if (json.success) {
                toast.success("Kadiv member berhasil dipindahkan!");
                onRefresh?.();
            } else {
                toast.error(json.message || "Gagal update");
            }
        } catch {
            toast.error("Kesalahan server");
        } finally {
            setLoadingAction(false);
        }
    };





    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredMembers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredMembers.map((m) => m.id_member));
        }
    };

    const handleDeleteBatch = async () => {
        if (selectedIds.length === 0) {
            return toast.error("Tidak ada member yang dipilih.");
        }

        const sure = await Swal.fire({
            title: "Hapus Massal?",
            text: "Semua member yang dipilih akan dihapus.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, hapus",
            cancelButtonText: "Batal",
        });

        if (!sure.isConfirmed) return;

        try {
            setLoadingAction(true);

            const res = await fetchWithJwt(`${apiUrl}/profil/kadiv-access/member/batch`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ member_ids: selectedIds }),
            });

            const json = await res.json();

            if (json.success) {
                toast.success("Member berhasil dihapus secara massal!");
                setMembers((prev) => prev.filter((m) => !selectedIds.includes(m.id_member)));
                setSelectedIds([]);
                onRefresh?.();
            } else {
                toast.error(json.message || "Gagal menghapus secara massal");
            }
        } catch (err) {
            toast.error("Kesalahan server");
        } finally {
            setLoadingAction(false);
        }
    };



    return (
        <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faUserTie} className="text-green-600" />
                    Informasi Kepala Divisi
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500">Nama</p>
                        <p className="font-semibold text-gray-900">{data.nama}</p>
                    </div>

                    <div>
                        <p className="text-gray-500">NIP</p>
                        <p className="font-semibold text-gray-900">{data.nip}</p>
                    </div>

                    <div>
                        <p className="text-gray-500">ID Kadiv</p>
                        <p className="font-semibold text-gray-900">{data.id_user}</p>
                    </div>

                    <div>
                        <p className="text-gray-500">Perusahaan</p>
                        <p className="font-semibold text-gray-900 flex items-center gap-2">
                            <FontAwesomeIcon icon={faBuilding} className="text-gray-600" />
                            {data.perusahaan}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faUsers} className="text-green-600" />
                    Daftar Member
                </h3>
                <SearchBar onSearch={setSearch} placeholder="Cari member berdasarkan nama, NIP, atau role..." className="mb-4" />
                {selectedIds.length > 0 && (
                    <div className="flex justify-end mb-3">
                        <button onClick={handleDeleteBatch} disabled={selectedIds.length === 0 || loadingAction} className={`px-4 py-2 text-sm font-medium text-white rounded  ${selectedIds.length > 0 ? "bg-red-600 hover:bg-red-700" : "bg-gray-400 cursor-not-allowed"}`}>
                            Hapus Massal ({selectedIds.length})
                        </button>
                    </div>
                )}

                {memberList.length === 0 && (
                    <EmptyState title="Belum Ada Member" description="Kadiv ini belum memiliki anggota." />
                )}

                {memberList.length > 0 && filteredMembers.length === 0 && (
                    <EmptyState title="Tidak Ada Hasil" description="Coba gunakan kata kunci lain." />
                )}

                {filteredMembers.length > 0 && (
                    <div className="relative overflow-x-auto">

                        {loadingAction && (
                            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-20">
                                <LoadingSpinner message="Memproses aksi..." />
                            </div>
                        )}

                        {/* DESKTOP TABLE */}
                        <div className="hidden md:block">
                            <table className="min-w-full text-sm text-gray-700 border border-gray-200 rounded-lg overflow-hidden relative z-10">
                                <thead className="bg-green-600 text-white text-left">
                                    <tr>
                                        <th className="py-2 px-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.length === filteredMembers.length && filteredMembers.length > 0}
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                        <th className="py-2 px-3">Nama</th>
                                        <th className="py-2 px-3">NIP</th>
                                        <th className="py-2 px-3">Role</th>
                                        <th className="py-2 px-3 text-center">Aksi</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {filteredMembers.map((m) => (
                                        <tr key={m.id_member} className="hover:bg-gray-200 transition">
                                            <td className="py-2 px-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(m.id_member)}
                                                    onChange={() => toggleSelect(m.id_member)}
                                                />
                                            </td>

                                            <td className="py-2 px-3 font-semibold">{m.nama}</td>
                                            <td className="py-2 px-3">{m.nip}</td>
                                            <td className="py-2 px-3">{m.role}</td>

                                            <td className="py-1 px-3 flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleUpdate(m.id_member, m.id)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-2 py-1 rounded shadow-sm transition active:scale-95"
                                                    disabled={loadingAction}
                                                >
                                                    <FontAwesomeIcon icon={faPencil} />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(m.id_member, m.id)}
                                                    className="bg-red-600 hover:bg-red-700 text-white text-sm px-2 py-1 rounded shadow-sm transition active:scale-95"
                                                    disabled={loadingAction}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* MOBILE CARD TABLE */}
                        <div className="md:hidden space-y-3">
                            {filteredMembers.map((m) => (
                                <div
                                    key={m.id_member}
                                    className="border border-gray-300 rounded-lg p-4 shadow-sm bg-white"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-900">{m.nama}</p>
                                            <p className="text-gray-600 text-sm">{m.nip}</p>
                                            <p className="text-gray-500 text-xs mt-1">{m.role}</p>
                                        </div>

                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(m.id_member)}
                                            onChange={() => toggleSelect(m.id_member)}
                                        />
                                    </div>

                                    <div className="mt-3 flex justify-end gap-2">
                                        <button
                                            onClick={() => handleUpdate(m.id_member)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-md shadow-sm transition active:scale-95"
                                            disabled={loadingAction}
                                        >
                                            <FontAwesomeIcon icon={faPencil} />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(m.id_member)}
                                            className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-md shadow-sm transition active:scale-95"
                                            disabled={loadingAction}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailKadiv;
