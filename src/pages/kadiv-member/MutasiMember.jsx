// components/mutasiMember.jsx
import { useEffect, useState } from "react";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { toast } from "react-hot-toast";

const MutasiMember = ({ open, onClose, member, apiUrl, onSuccess }) => {
    const [kadivList, setKadivList] = useState([]);
    const [teamList, setTeamList] = useState([]);
    const [targetKadiv, setTargetKadiv] = useState("");
    const [targetTeam, setTargetTeam] = useState("");
    const [targetLevel, setTargetLevel] = useState(2);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;
        (async () => {
            const res = await fetchWithJwt(`${apiUrl}/profil/kadiv-access`);
            const json = await res.json();
            if (json.success) setKadivList(json.data);
        })();
    }, [open]);

    useEffect(() => {
        if (!targetKadiv) return;

        (async () => {
            try {
                const res = await fetchWithJwt(
                    `${apiUrl}/profil/kadiv-access/group/kadiv/${targetKadiv}`
                );
                const json = await res.json();

                if (json.success && json.data) {
                    setTeamList(Array.isArray(json.data) ? json.data : [json.data]);
                } else {
                    setTeamList([]);
                }
            } catch (err) {
                console.error(err);
                setTeamList([]);
            }
        })();
    }, [targetKadiv]);


    if (!open) return null;

    const selectedTeam = teamList.find(
        (t) => t.id === Number(targetTeam)
    );

    const hasLeader = !!selectedTeam?.id_leader;

    const filteredTeamList = teamList.filter(
        (t) => t.id !== member.id_kadiv_group
    );


    const handleSubmit = async () => {
        if (!targetKadiv || !targetTeam) {
            return toast.error("Kadiv dan Tim tujuan wajib dipilih");
        }

        try {
            setLoading(true);

            const payload = {
                id_user: member.id_user,
                id_kadiv: Number(targetKadiv),
                id_kadiv_group: Number(targetTeam),
                level: Number(targetLevel),
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
                toast.success("Anggota berhasil dimutasi");
                onSuccess?.();
            } else {
                toast.error(json.message || "Gagal mutasi anggota");
            }
        } catch (err) {
            console.error(err);
            toast.error("Kesalahan server saat mutasi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-lg">
                <div className="mb-5">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Mutasi Anggota
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Pindahkan anggota ke tim dan peran baru
                    </p>
                </div>
                <div className="mb-5 rounded-xl border bg-gray-50 px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">
                        {member.nama}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                        NIP: {member.nip}
                    </p>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Kadiv Tujuan
                        </label>
                        <select value={targetKadiv} onChange={(e) => { setTargetKadiv(e.target.value); setTargetTeam(""); setTargetLevel(2);}} className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Pilih Kadiv</option>
                            {kadivList.map(k => (
                                <option key={k.id} value={k.id}>
                                    {k.nama} — {k.perusahaan}
                                </option>
                            ))}
                        </select>
                    </div>
                    {targetKadiv && (
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Tim Tujuan
                            </label>
                            <select value={targetTeam} onChange={(e) => setTargetTeam(e.target.value)} disabled={filteredTeamList.length === 0} className="w-full rounded-lg border px-3 py-2 text-sm disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Pilih Tim</option>
                                {filteredTeamList.length === 0 ? (
                                    <option disabled>
                                        Tidak ada tim lain selain tim asal
                                    </option>
                                ) : (
                                    filteredTeamList.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.nama_grup}
                                        </option>
                                    ))
                                )}
                            </select>
                            {filteredTeamList.length === 0 && (
                                <p className="mt-1 text-xs text-gray-500">
                                    Anggota hanya bisa dimutasi ke tim lain.
                                </p>
                            )}
                        </div>
                    )}

                    {/* LEVEL */}
                    {targetTeam && (
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Peran di Tim Baru
                            </label>
                            <select value={targetLevel} onChange={(e) => setTargetLevel(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value={2}>Anggota</option>
                                <option value={1} disabled={hasLeader}>
                                    Tim Leader {hasLeader && "— sudah terisi"}
                                </option>
                            </select>
                            {hasLeader && (
                                <p className="mt-1 text-xs text-gray-500">
                                    Tim ini sudah memiliki Team Leader.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* ACTION */}
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">
                        Batal
                    </button>

                    <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                        Simpan Mutasi
                    </button>
                </div>
            </div>
        </div>
    );

};

export default MutasiMember;
