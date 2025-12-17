// components/DetailKadiv.jsx
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserTie, faBuilding, faUsers, faUserShield, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { LoadingSpinner, ErrorState, EmptyState } from "../../components";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";


const DetailKadiv = ({ data }) => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [teams, setTims] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [groupDetail, setGroupDetail] = useState(null);
    const [loadingGroup, setLoadingGroup] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);
    const [userList, setUserList] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [loadingAdd, setLoadingAdd] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [showAddGroup, setShowAddGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [submittingGroup, setSubmittingGroup] = useState(false);
    const [searchMember, setSearchMember] = useState("");

    /* INIT TEAMS */
    useEffect(() => {
        if (data?.teams) {
            setTims(data.teams);
        }
    }, [data]);


    const loadUserList = async () => {
        try {
            const res = await fetchWithJwt(`${apiUrl}/profil`);
            const json = await res.json();

            if (json.success) {
                const filtered = json.data.filter(u => !u.is_member);
                setUserList(filtered);
            }
        } catch {
            toast.error("Gagal memuat daftar user");
        }
    };

    const handleDeleteGroup = async () => {
        if (!groupDetail) return;
        const result = await Swal.fire({
            title: "Hapus Tim?",
            text: `Tim "${groupDetail.nama_grup}" akan dihapus permanen`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#9ca3af",
            confirmButtonText: "Ya, hapus",
            cancelButtonText: "Batal",
        });
        if (!result.isConfirmed) return;
        try {
            const res = await fetchWithJwt(
                `${apiUrl}/profil/kadiv-access/group/kadiv/${groupDetail.id}`,
                { method: "DELETE" }
            );
            const json = await res.json();
            if (json.success) {
                toast.success("Tim berhasil dihapus");
                setTims(prev => prev.filter(t => t.id_group !== groupDetail.id));
                setSelectedGroupId(null);
                setGroupDetail(null);
                setShowAddMember(false);
            } else {
                toast.error(json.message || "Gagal menghapus tim");
            }
        } catch (err) {
            console.error(err);
            toast.error("Kesalahan server saat menghapus tim");
        }
    };


    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) {
            return toast.error("Nama team wajib diisi");
        }
        try {
            setSubmittingGroup(true);
            const payload = {
                nama: newGroupName,
                id_kadiv: data.id_kadiv
            };
            const res = await fetchWithJwt(
                `${apiUrl}/profil/kadiv-access/group`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                }
            );
            const json = await res.json();
            if (json.success) {
                toast.success("Tim berhasil dibuat");
                const resTims = await fetchWithJwt(`${apiUrl}/profil/kadiv-access/${data.id_kadiv}`);
                const jsonTims = await resTims.json();
                if (jsonTims.success && jsonTims.data?.teams) {
                    setTims(jsonTims.data.teams);
                }
                setNewGroupName("");
                setShowAddGroup(false);
            }
            else {
                toast.error(json.message || "Gagal membuat team");
            }
        } catch (err) {
            console.error(err);
            toast.error("Kesalahan server saat membuat team");
        } finally {
            setSubmittingGroup(false);
        }
    };


    const handleDeleteMember = async (id_member, nama) => {
        const result = await Swal.fire({
            title: "Hapus Anggota?",
            text: `"${nama}" akan dihapus dari tim`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#9ca3af",
            confirmButtonText: "Hapus",
            cancelButtonText: "Batal",
        });
        if (!result.isConfirmed) return;
        try {
            const res = await fetchWithJwt(
                `${apiUrl}/profil/kadiv-access/member/${id_member}`,
                { method: "DELETE" }
            );
            const json = await res.json();
            if (json.success) {
                toast.success("Anggota berhasil dihapus");
                setGroupDetail(prev => ({
                    ...prev,
                    member: prev.member.filter(m => m.id !== id_member),
                }));
            } else {
                toast.error(json.message || "Gagal menghapus anggota");
            }
        } catch (err) {
            console.error(err);
            toast.error("Kesalahan server saat menghapus anggota");
        }
    };


    /* LOAD GROUP DETAIL */
    const loadGroupDetail = async (id_group) => {
        try {
            setLoadingGroup(true);
            setSelectedGroupId(id_group);
            setGroupDetail(null);
            const res = await fetchWithJwt(
                `${apiUrl}/profil/kadiv-access/group/${id_group}`
            );
            const json = await res.json();

            if (json.success) {
                setGroupDetail(json.data);
            } else {
                toast.error(json.message || "Gagal memuat detail group");
            }
        } catch {
            toast.error("Kesalahan server saat memuat group");
        } finally {
            setLoadingGroup(false);
        }
    };

    if (!data) {
        return (
            <ErrorState message="Data Kadiv tidak ditemukan" detail="Silakan muat ulang halaman." />
        );
    }

    const handleSubmitBatch = async () => {
        if (!groupDetail || selectedMembers.length === 0) {
            return toast.error("Pilih minimal 1 anggota");
        }

        try {
            setSubmitting(true);

            const payload = {
                id_kadiv: groupDetail.id_kadiv,
                id_kadiv_group: groupDetail.id,
                member_ids: selectedMembers
            };

            const res = await fetchWithJwt(
                `${apiUrl}/profil/kadiv-access/member/batch`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                }
            );

            const json = await res.json();

            if (json.success) {
                toast.success("Anggota berhasil ditambahkan");
                await loadGroupDetail(groupDetail.id);
                setShowAddMember(false);
                setSelectedMembers([]);
            } else {
                toast.error(json.message || "Gagal menambahkan anggota");
            }
        } catch (err) {
            console.error(err);
            toast.error("Kesalahan server saat menambahkan anggota");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateLevel = async (member, newLevel) => {
        const label = newLevel === 1 ? "Tim Leader" : "Anggota";

        const result = await Swal.fire({
            title: "Ubah Peran?",
            text: `"${member.nama}" akan dijadikan ${label}`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#16a34a",
            cancelButtonColor: "#9ca3af",
            confirmButtonText: "Ya, ubah",
            cancelButtonText: "Batal",
        });

        if (!result.isConfirmed) return;

        try {
            const payload = {
                id_user: member.id_user || member.id,
                id_kadiv: groupDetail.id_kadiv,
                id_kadiv_group: groupDetail.id,
                level: newLevel,
            };

            const res = await fetchWithJwt(
                `${apiUrl}/profil/kadiv-access/member/${member.id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            const json = await res.json();

            if (json.success) {
                toast.success("Peran berhasil diperbarui");
                await loadGroupDetail(groupDetail.id);
            } else {
                toast.error(json.message || "Gagal memperbarui peran");
            }
        } catch (err) {
            console.error(err);
            toast.error("Kesalahan server saat update peran");
        }
    };

    const filteredUserList = userList.filter(u =>
        u.nama.toLowerCase().includes(searchMember.toLowerCase()) ||
        u.nip?.toLowerCase().includes(searchMember.toLowerCase()) ||
        u.perusahaan?.toLowerCase().includes(searchMember.toLowerCase())
    );

    return (
        <div className="space-y-6">

            {/* INFORMASI KADIV */}
            <div className="bg-white border rounded-xl p-4 py-3 shadow-sm">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <FontAwesomeIcon icon={faUserTie} className="text-green-600" />
                    Informasi Kepala Divisi
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500">Nama</p>
                        <p className="font-semibold">{data.nama}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">NIP</p>
                        <p className="font-semibold">{data.nip}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">ID Kadiv</p>
                        <p className="font-semibold">{data.id_user}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Perusahaan</p>
                        <p className="font-semibold flex items-center gap-2">
                            <FontAwesomeIcon icon={faBuilding} />
                            {data.perusahaan}
                        </p>
                    </div>
                </div>
            </div>

            {/* DAFTAR TEAM */}
            <div className="bg-white border rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FontAwesomeIcon icon={faUsers} className="text-green-600" />
                        Daftar Tim
                    </h3>

                    <button onClick={() => setShowAddGroup(true)} className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition" aria-label="Tambah Tim">
                        <FontAwesomeIcon icon={faPlus} />
                        <span className="hidden sm:inline text-sm">
                            Tim
                        </span>
                    </button>
                </div>

                {showAddGroup && (
                    <div className="mb-4 border rounded-xl p-2.5 sm:p-4 bg-gray-50">
                        <p className="text-sm font-medium mb-2">
                            Tambah Tim Baru
                        </p>
                        <input type="text" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Masukkan nama team baru" className="w-full border rounded-lg px-3 py-2 text-sm mb-4" />
                        <div className="flex items-center justify-end gap-3">
                            <button onClick={() => { setShowAddGroup(false); setNewGroupName(""); }} className="px-4 py-1.5 sm:px-6 sm:py-2 text-sm rounded-md border border-red-300 text-red-600 hover:bg-red-50 transition">
                                Batal
                            </button>

                            <button onClick={handleCreateGroup} disabled={submittingGroup} className="px-4 py-1.5 sm:px-6 sm:py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition">
                                Simpan
                            </button>
                        </div>

                    </div>
                )}


                {teams.length === 0 && (
                    <EmptyState title="Belum Ada Tim" description="Kadiv ini belum memiliki team." />
                )}

                {teams.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {teams.map(team => {
                            const leaders = Array.isArray(team.team_lead)
                                ? team.team_lead.map(l => l.nama).join(", ")
                                : null;

                            return (
                                <button
                                    key={team.id_group}
                                    onClick={() => loadGroupDetail(team.id_group)}
                                    className={`
                        text-left rounded-xl border
                        p-3 sm:p-4
                        transition-all duration-200
                        hover:shadow-md
                        ${selectedGroupId === team.id_group
                                            ? "border-green-600 bg-green-50"
                                            : "border-gray-200 bg-white"}
                    `}
                                >
                                    {/* TEAM NAME */}
                                    <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                        {team.nama_grup}
                                    </p>

                                    {/* LEADER */}
                                    {leaders ? (
                                        <p className="mt-1 text-xs sm:text-sm text-gray-600 line-clamp-2">
                                            <span className="font-medium text-gray-700">
                                                Leader:
                                            </span>{" "}
                                            {leaders}
                                        </p>
                                    ) : (
                                        <p className="mt-1 text-xs sm:text-sm text-gray-400 italic">
                                            Belum ada leader
                                        </p>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ===============================
                DETAIL GROUP
            =============================== */}
            {selectedGroupId && (
                <div className="bg-white border rounded-xl px-4 py-3 sm:p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <FontAwesomeIcon icon={faUserShield} className="text-green-600" />
                            Detail Tim
                        </h3>

                        <div className="flex gap-2">
                            <button onClick={() => { setShowAddMember(true); loadUserList(); }} title="Tambah Anggota" className="flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
                                <FontAwesomeIcon icon={faPlus} />
                                <span className="hidden sm:inline ml-2 text-sm">
                                    Anggota
                                </span>
                            </button>

                            <button onClick={handleDeleteGroup} title="Hapus Tim" className="flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition">
                                <FontAwesomeIcon icon={faTrash} />
                                <span className="hidden sm:inline ml-2 text-sm">
                                    Hapus Tim
                                </span>
                            </button>
                        </div>
                    </div>


                    {loadingGroup && (
                        <LoadingSpinner message="Memuat detail team..." />
                    )}

                    {!loadingGroup && groupDetail && (
                        <>
                            <div className="mb-4">
                                <p className="text-sm text-gray-500">Nama Tim</p>
                                <p className="font-semibold text-gray-900">
                                    {groupDetail.nama_grup}
                                </p>
                            </div>

                            {/* TEAM LEADER */}
                            {groupDetail.team_lead && (
                                <div className="mb-6">
                                    <p className="text-sm text-gray-500 mb-2">
                                        Tim Leader
                                    </p>

                                    <div className="relative overflow-hidden rounded-2xl border border-blue-300 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm">
                                        {/* ACCENT BAR */}
                                        <div className="absolute inset-y-0 left-0 w-1 bg-blue-600" />

                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            {/* INFO */}
                                            <div className="pl-3 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faUserShield} className="text-blue-600" />
                                                    <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                                                        {groupDetail.team_lead.nama}
                                                    </p>
                                                </div>

                                                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                                                    <span>NIP: {groupDetail.team_lead.nip}</span>
                                                    <span>{groupDetail.team_lead.perusahaan}</span>
                                                </div>
                                            </div>

                                            {/* ACTION */}
                                            <div className="flex items-center gap-2 self-end sm:self-auto">
                                                {/* LEVEL */}
                                                <select
                                                    value={groupDetail.team_lead.level}
                                                    onChange={e =>
                                                        handleUpdateLevel(
                                                            groupDetail.team_lead,
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                    className="text-xs border rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                >
                                                    <option value={1}>Tim Leader</option>
                                                    <option value={2}>Anggota</option>
                                                </select>

                                                {/* DELETE */}
                                                <button onClick={() => handleDeleteMember(groupDetail.team_lead.id, groupDetail.team_lead.nama)} title="Hapus Tim Leader" className="w-8 h-8 flex items-center justify-center bg-red-600 text-white rounded-md hover:bg-red-700 transition">
                                                    <FontAwesomeIcon icon={faTrash} size="sm" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}


                            {showAddMember && (
                                <div className="border rounded-xl p-4 mb-4 bg-gray-50">
                                    {/* HEADER */}
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-semibold text-gray-800">
                                            Tambah Anggota (Per Batch)
                                        </p>
                                        <span className="text-xs text-gray-500">
                                            Dipilih: {selectedMembers.length}
                                        </span>
                                    </div>

                                    {/* SEARCH */}
                                    <input
                                        type="text"
                                        value={searchMember}
                                        onChange={e => setSearchMember(e.target.value)}
                                        placeholder="Cari nama / NIP / perusahaan..."
                                        className="w-full mb-3 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />

                                    {/* LIST */}
                                    <div className="max-h-72 overflow-y-auto border rounded-lg bg-white divide-y">
                                        {filteredUserList.length === 0 && (
                                            <p className="text-sm text-gray-500 p-4 text-center">
                                                Data tidak ditemukan
                                            </p>
                                        )}

                                        {filteredUserList.map(u => (
                                            <label
                                                key={u.id}
                                                className="flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer
                   transition hover:bg-gray-50"
                                            >
                                                {/* CHECKBOX */}
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMembers.includes(u.id)}
                                                    onChange={() => {
                                                        setSelectedMembers(prev =>
                                                            prev.includes(u.id)
                                                                ? prev.filter(id => id !== u.id)
                                                                : [...prev, u.id]
                                                        );
                                                    }}
                                                    className="accent-green-600"
                                                />

                                                {/* CONTENT */}
                                                <div className="flex-1 min-w-0">
                                                    {/* ROW 1 */}
                                                    <div className="flex items-center justify-between gap-4">
                                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                                            {u.nama}
                                                        </p>

                                                        <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                                            {u.role}
                                                        </span>
                                                    </div>

                                                    {/* ROW 2 */}
                                                    <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                                                        <span className="truncate">
                                                            {u.perusahaan}
                                                        </span>
                                                        <span className="shrink-0">
                                                            NIP: {u.nip}
                                                        </span>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}

                                    </div>

                                    {/* ACTION */}
                                    <div className="flex justify-end gap-2 mt-4">
                                        <button
                                            onClick={() => {
                                                setShowAddMember(false);
                                                setSelectedMembers([]);
                                                setSearchMember("");
                                            }}
                                            className="px-4 py-2 text-sm bg-gray-300 rounded hover:bg-gray-400"
                                        >
                                            Batal
                                        </button>

                                        <button
                                            onClick={handleSubmitBatch}
                                            disabled={selectedMembers.length === 0 || submitting}
                                            className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                        >
                                            Tambahkan ({selectedMembers.length})
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* MEMBER LIST */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm text-gray-500">
                                        Anggota Tim
                                    </p>

                                    <p className="text-sm font-medium text-gray-700">
                                        {(groupDetail.member ?? []).length} anggota
                                    </p>
                                </div>


                                {(groupDetail.member ?? []).length === 0 && (
                                    <EmptyState title="Belum Ada Anggota" description="Tim ini belum memiliki anggota." />
                                )}

                                {(groupDetail.member ?? []).length > 0 && (
                                    <ul className="space-y-2">
                                        {(groupDetail.member ?? []).map(m => (
                                            <li key={m.id} className="border rounded-xl p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="min-w-0">
                                                    <p className="font-medium text-sm sm:text-base text-gray-900 truncate">
                                                        {m.nama}
                                                    </p>
                                                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                                                        <span>NIP: {m.nip}</span>
                                                        <span>{m.role}</span>
                                                        <span className="text-gray-500">
                                                            {m.perusahaan}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                                    <select value={m.level} onChange={e => handleUpdateLevel(m, Number(e.target.value))} className="text-xs border rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500">
                                                        <option value={1}>Tim Leader</option>
                                                        <option value={2}>Anggota</option>
                                                    </select>

                                                    <button onClick={() => handleDeleteMember(m.id, m.nama)} title="Hapus Anggota" className="w-8 h-8 flex items-center justify-center bg-red-600 text-white rounded-md hover:bg-red-700 transition">
                                                        <FontAwesomeIcon icon={faTrash} size="sm" />
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default DetailKadiv;
