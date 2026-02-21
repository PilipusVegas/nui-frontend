import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserTie, faUsers } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { LoadingSpinner, ErrorState, EmptyState } from "../../components";
import Swal from "sweetalert2";

const Show = ({ idGroup }) => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const fetchDetail = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchWithJwt(
                `${apiUrl}/profil/kadiv-access/group/${idGroup}`
            );
            if (!res.ok) throw new Error("Gagal memuat detail grup");
            const result = await res.json();
            setData(result.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (idGroup) fetchDetail();
    }, [idGroup]);

    const handleChangeLevel = async (member, newLevel) => {
        const user = getUserFromToken();

        try {
            setUpdatingId(member.id);

            const res = await fetchWithJwt(
                `${apiUrl}/profil/kadiv-access/member/${member.id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id_user: member.id_user,
                        id_kadiv: user.is_kadiv.id,
                        id_kadiv_group: idGroup,
                        level: Number(newLevel),
                    }),
                }
            );

            if (!res.ok) throw new Error("Gagal memperbarui status");

            Swal.fire({
                icon: "success",
                title: "Berhasil",
                text: "Status berhasil diperbarui",
                timer: 1200,
                showConfirmButton: false,
            });

            fetchDetail();
        } catch (err) {
            Swal.fire("Error", err.message, "error");
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) return <LoadingSpinner message="Memuat detail grup..." />;
    if (error)
        return (
            <ErrorState
                title="Gagal Memuat Detail"
                message={error}
                onRetry={fetchDetail}
            />
        );
    if (!data)
        return (
            <EmptyState
                title="Data Tidak Ditemukan"
                description="Detail grup tidak tersedia."
            />
        );


    return (
        <div className="border rounded-2xl shadow-sm bg-white overflow-hidden">
            {/* HEADER CARD */}
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                    {data.nama_grup}
                </h3>

                <div className="mt-1 text-sm text-gray-600">
                    <span className="font-medium">{data.nama_kadiv}</span>
                    <span className="mx-1 text-gray-400">•</span>
                    <span>NIP {data.nip_kadiv}</span>
                </div>

                <p className="text-sm text-gray-500 mt-0.5">
                    {data.perusahaan_kadiv}
                </p>
            </div>

            {/* BODY */}
            <div className="p-6 space-y-6">
                {/* TEAM LEADER SECTION */}
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Team Leader
                    </p>

                    {data.team_lead ? (
                        <div className="flex justify-between items-center border rounded-lg p-3 bg-green-50">
                            <div>
                                <p className="font-medium text-gray-900">
                                    {data.team_lead.nama}
                                </p>
                                <p className="text-xs text-gray-500">
                                    NIP {data.team_lead.nip}
                                </p>
                            </div>

                            <select
                                value={1}
                                disabled={updatingId === data.team_lead.id}
                                onChange={(e) =>
                                    handleChangeLevel(
                                        data.team_lead,
                                        e.target.value
                                    )
                                }
                                className="text-xs px-2 py-1 rounded-md border
                            focus:ring-1 focus:ring-green-500"
                            >
                                <option value={1}>Team Leader</option>
                                <option value={2}>Anggota</option>
                            </select>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic">
                            Belum ada Team Leader
                        </p>
                    )}
                </div>

                {/* MEMBERS SECTION */}
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Anggota Tim ({data.member.length})
                    </p>

                    <ul className="space-y-3">
                        {data.member.map((m) => {
                            const isLeader = m.level === 1;
                            const leaderAlreadyExist =
                                data.team_lead && data.team_lead.id !== m.id;

                            return (
                                <li
                                    key={m.id}
                                    className="flex justify-between items-center border rounded-lg p-3"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {m.nama}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            NIP {m.nip}
                                        </p>
                                    </div>

                                    <select
                                        value={m.level}
                                        disabled={updatingId === m.id}
                                        onChange={(e) =>
                                            handleChangeLevel(
                                                m,
                                                e.target.value
                                            )
                                        }
                                        className="text-xs px-2 py-1 rounded-md border
                                    focus:ring-1 focus:ring-green-500"
                                    >
                                        <option value={2}>Anggota</option>
                                        <option
                                            value={1}
                                            disabled={
                                                leaderAlreadyExist && !isLeader
                                            }
                                        >
                                            Team Leader
                                        </option>
                                    </select>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Show;