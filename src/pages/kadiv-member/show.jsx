// components/DetailKadiv.jsx
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserTie, faBuilding, faUsers, faUserShield } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { LoadingSpinner, ErrorState, EmptyState } from "../../components";
import { toast } from "react-hot-toast";

const DetailKadiv = ({ data }) => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;

    const [teams, setTeams] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [groupDetail, setGroupDetail] = useState(null);
    const [loadingGroup, setLoadingGroup] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);
    const [userList, setUserList] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [loadingAdd, setLoadingAdd] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [submitting, setSubmitting] = useState(false);



    /* ===============================
        INIT TEAMS
    =============================== */
    useEffect(() => {
        if (data?.teams) {
            setTeams(data.teams);
        }
    }, [data]);


    const loadUserList = async () => {
        try {
            const res = await fetchWithJwt(`${apiUrl}/profil`);
            const json = await res.json();

            if (json.success) {
                // OPTIONAL: filter user yang belum jadi member
                const filtered = json.data.filter(u => !u.is_member);
                setUserList(filtered);
            }
        } catch {
            toast.error("Gagal memuat daftar user");
        }
    };



    /* ===============================
        LOAD GROUP DETAIL
    =============================== */
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
            <ErrorState
                message="Data Kadiv tidak ditemukan"
                detail="Silakan muat ulang halaman."
            />
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




    return (
        <div className="space-y-6">

            {/* ===============================
                INFORMASI KADIV
            =============================== */}
            <div className="bg-white border rounded-xl p-5 shadow-sm">
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

            {/* ===============================
                DAFTAR TEAM
            =============================== */}
            <div className="bg-white border rounded-xl p-5 shadow-sm">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <FontAwesomeIcon icon={faUsers} className="text-green-600" />
                    Daftar Team
                </h3>

                {teams.length === 0 && (
                    <EmptyState
                        title="Belum Ada Team"
                        description="Kadiv ini belum memiliki team."
                    />
                )}

                {teams.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teams.map(team => (
                            <button
                                key={team.id_group}
                                onClick={() => loadGroupDetail(team.id_group)}
                                className={`text-left border rounded-lg p-4 shadow-sm hover:shadow-md transition
                                    ${selectedGroupId === team.id_group
                                        ? "border-green-600 bg-green-50"
                                        : "border-gray-200 bg-white"
                                    }`}
                            >
                                <p className="text-xs text-gray-500 mb-1">
                                    Nama Team
                                </p>
                                <p className="font-semibold text-gray-900">
                                    {team.nama_grup}
                                </p>

                                {team.team_lead && (
                                    <p className="text-xs text-gray-600 mt-2">
                                        Team Leader:{" "}
                                        <span className="font-medium">
                                            {team.team_lead.nama}
                                        </span>
                                    </p>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ===============================
                DETAIL GROUP
            =============================== */}
            {selectedGroupId && (
                <div className="bg-white border rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <FontAwesomeIcon icon={faUserShield} className="text-green-600" />
                            Detail Team
                        </h3>

                        <button onClick={() => { setShowAddMember(true); loadUserList(); }} className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">
                            + Anggota
                        </button>
                    </div>



                    {loadingGroup && (
                        <LoadingSpinner message="Memuat detail team..." />
                    )}

                    {!loadingGroup && groupDetail && (
                        <>
                            {/* TEAM INFO */}
                            <div className="mb-4">
                                <p className="text-sm text-gray-500">Nama Team</p>
                                <p className="font-semibold text-gray-900">
                                    {groupDetail.nama_grup}
                                </p>
                            </div>

                            {/* TEAM LEADER */}
                            {groupDetail.team_lead && (
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500 mb-1">
                                        Team Leader
                                    </p>
                                    <div className="border rounded-lg p-3 bg-gray-50">
                                        <p className="font-semibold">
                                            {groupDetail.team_lead.nama}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            NIP: {groupDetail.team_lead.nip}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {showAddMember && (
                                <div className="border rounded-lg p-4 mb-4 bg-gray-50">
                                    <p className="text-sm font-medium mb-3">
                                        Tambah Anggota (Per Batch)
                                    </p>

                                    <div className="max-h-64 overflow-y-auto border rounded mb-3 bg-white">
                                        {userList.length === 0 && (
                                            <p className="text-sm text-gray-500 p-3">
                                                Tidak ada user yang bisa ditambahkan
                                            </p>
                                        )}

                                        {userList.map(u => (
                                            <label
                                                key={u.id}
                                                className="flex items-start gap-3 px-3 py-2 border-b last:border-b-0 cursor-pointer hover:bg-gray-100"
                                            >
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
                                                />

                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {u.nama}
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        NIP: {u.nip}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {u.perusahaan}
                                                    </p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSubmitBatch}
                                            disabled={selectedMembers.length === 0 || submitting}
                                            className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                        >
                                            Tambahkan ({selectedMembers.length})
                                        </button>

                                        <button
                                            onClick={() => {
                                                setShowAddMember(false);
                                                setSelectedMembers([]);
                                            }}
                                            className="px-4 py-2 text-sm bg-gray-300 rounded hover:bg-gray-400"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </div>
                            )}



                            {/* MEMBER LIST */}
                            <div>
                                <p className="text-sm text-gray-500 mb-2">
                                    Anggota Team
                                </p>

                                {groupDetail.member.length === 0 && (
                                    <EmptyState
                                        title="Belum Ada Anggota"
                                        description="Team ini belum memiliki anggota."
                                    />
                                )}

                                {groupDetail.member.length > 0 && (
                                    <ul className="space-y-2">
                                        {groupDetail.member.map(m => (
                                            <li
                                                key={m.id}
                                                className="border rounded-lg p-3"
                                            >
                                                <p className="font-medium">
                                                    {m.nama}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    NIP: {m.nip}
                                                </p>
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
