import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserTie,
  faUsers,
  faRightLeft,
  faSearch,
  faPlus,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { LoadingSpinner, ErrorState, EmptyState } from "../../components";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { Modal, SearchBar } from "../../components";

const Show = ({ idGroup, onUpdate }) => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [openMutasi, setOpenMutasi] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [groupKadiv, setGroupKadiv] = useState([]);
  const [targetGroup, setTargetGroup] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openTambahMember, setOpenTambahMember] = useState(false);
  const [profilList, setProfilList] = useState([]);
  const [loadingProfil, setLoadingProfil] = useState(false);
  const [searchProfil, setSearchProfil] = useState("");
  const [addingId, setAddingId] = useState(null);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithJwt(
        `${apiUrl}/profil/kadiv-access/group/${idGroup}`,
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

  const fetchProfil = async () => {
    setLoadingProfil(true);
    try {
      const res = await fetchWithJwt(`${apiUrl}/profil`);
      if (!res.ok) throw new Error("Gagal memuat data user");
      const result = await res.json();
      setProfilList(result.data || []);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoadingProfil(false);
    }
  };

  const fetchGroupKadiv = async () => {
    const user = getUserFromToken();
    const res = await fetchWithJwt(
      `${apiUrl}/profil/kadiv-access/group/kadiv/${user.is_kadiv.id}`,
    );
    const result = await res.json();
    setGroupKadiv(result.data || []);
  };

  const handleTambahMember = async (user) => {
    const kadiv = getUserFromToken();
    try {
      if (!user.id_member) {
        throw new Error("User belum terdaftar sebagai member");
      }
      setAddingId(user.id);
      const res = await fetchWithJwt(
        `${apiUrl}/profil/kadiv-access/member/${user.id_member}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_user: user.id,
            id_kadiv: kadiv.is_kadiv.id,
            id_kadiv_group: idGroup,
            level: 2,
          }),
        },
      );
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message);
      }
      setProfilList((prev) => prev.filter((u) => u.id !== user.id));
      await fetchDetail();
      toast.success(`"${user.nama}" ditambahkan`);
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.message || "Gagal menambahkan anggota");
    } finally {
      setAddingId(null);
    }
  };

  const handleMutasi = async () => {
    const user = getUserFromToken();
    try {
      const res = await fetchWithJwt(
        `${apiUrl}/profil/kadiv-access/member/${selectedMember.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_user: selectedMember.id_user,
            id_kadiv: user.is_kadiv.id,
            id_kadiv_group: Number(targetGroup),
            level: 2, // reset jadi anggota
          }),
        },
      );
      if (!res.ok) throw new Error("Gagal mutasi anggota");
      Swal.fire({
        icon: "success",
        title: "Mutasi Berhasil",
        timer: 1200,
        showConfirmButton: false,
      });
      setOpenMutasi(false);
      fetchDetail();
      if (onUpdate) onUpdate();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const openMutasiModal = (member) => {
    setSelectedMember(member);
    setTargetGroup("");
    setOpenMutasi(true);
    fetchGroupKadiv();
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
        },
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

  const existingMemberIds = new Set([
    ...(data?.member || []).map((m) => m.id_user),
    ...(data?.team_lead ? [data.team_lead.id_user] : []),
  ]);

  const filteredMembers = (data?.member || []).filter((m) => {
    if (!searchQuery) return true;

    const q = searchQuery.toLowerCase();
    return m.nama.toLowerCase().includes(q) || m.nip.toLowerCase().includes(q);
  });

  if (loading) return <LoadingSpinner message="Memuat detail grup..." />;
  if (error)
    return (
      <ErrorState title="Gagal Memuat Detail" message={error} onRetry={fetchDetail}/>
    );
  if (!data)
    return (
      <EmptyState title="Data Tidak Ditemukan" description="Detail grup tidak tersedia."/>
    );

  return (
    <>
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

                <select value={1} disabled={updatingId === data.team_lead.id} onChange={(e) =>
                    handleChangeLevel(data.team_lead, e.target.value)
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
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Anggota Tim ({filteredMembers.length})
              </p>

              <div className="flex items-center gap-2">
                {/* SEARCH */}
                <button onClick={() => setShowSearch((prev) => !prev)} className="p-1 px-2 rounded-md border hover:bg-green-50 text-green-600 transition" title="Cari Anggota">
                  <FontAwesomeIcon icon={faSearch} />
                </button>

                {/* TAMBAH */}
                <button
                  onClick={() => {
                    setOpenTambahMember(true);
                    fetchProfil();
                  }}
                  className="p-1 px-2 rounded-md border hover:bg-green-50 text-green-600 transition"
                  title="Tambah Anggota"
                >
                  <FontAwesomeIcon icon={faUserPlus} />
                </button>
              </div>
            </div>

            {showSearch && (
              <SearchBar
                placeholder="Cari nama atau NIP anggota..."
                onSearch={setSearchQuery}
                className="mb-4"
              />
            )}

            {filteredMembers.length === 0 && (
              <p className="text-sm text-gray-500 italic">
                Anggota tidak ditemukan
              </p>
            )}

            <div className="max-h-[320px] overflow-y-auto pr-1">
              <ul className="space-y-3">
                {filteredMembers.map((m) => {
                  const leaderAlreadyExist =
                    data.team_lead && data.team_lead.id !== m.id;

                  return (
                    <li key={m.id} className="flex justify-between items-center border rounded-lg p-3">
                      <div>
                        <p className="font-medium text-gray-900">{m.nama}</p>
                        <p className="text-xs text-gray-500">NIP {m.nip}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <select value={m.level} disabled={updatingId === m.id} onChange={(e) => handleChangeLevel(m, e.target.value)} className="text-xs px-2 py-1 rounded-md border focus:ring-1 focus:ring-green-500">
                          <option value={2}>Anggota</option>
                          <option value={1} disabled={leaderAlreadyExist && m.level !== 1}>
                            Team Leader
                          </option>
                        </select>

                        <button onClick={() => openMutasiModal(m)} title="Mutasi Anggota" className="p-1 px-2 rounded-md text-xs border hover:bg-green-50 text-green-600 transition">
                          <FontAwesomeIcon icon={faRightLeft} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={openTambahMember}
        onClose={() => setOpenTambahMember(false)}
        title="Tambah Anggota"
        note="Berikut anggota Anda. Klik tambah untuk memasukkan ke grup ini."
        size="sm"
      >
        <div className="space-y-4">
          {/* SEARCH */}
          <SearchBar placeholder="Cari nama atau NIP..." onSearch={setSearchProfil}/>

          {/* LIST */}
          {loadingProfil ? (
            <LoadingSpinner message="Memuat data user..." />
          ) : (
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {profilList
                .filter((u) => !existingMemberIds.has(u.id)) // ⛔ INI KUNCI NYA
                .filter((u) => {
                  if (!searchProfil) return true;
                  const q = searchProfil.toLowerCase();
                  return (
                    u.nama.toLowerCase().includes(q) ||
                    u.nip.toLowerCase().includes(q)
                  );
                })
                .map((u) => (
                  <div key={u.id} className="flex justify-between items-center border rounded-lg p-3 hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">{u.nama}</p>
                      <p className="text-xs text-gray-500">
                        {u.nip} • {u.role}
                      </p>
                    </div>

                    <button
                      onClick={() => handleTambahMember(u)}
                      disabled={addingId === u.id}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 
  bg-green-600 text-white rounded-md 
  hover:bg-green-700 active:scale-95 
  transition disabled:opacity-50"
                    >
                      {addingId === u.id ? (
                        "Menambahkan..."
                      ) : (
                        <>
                          <FontAwesomeIcon
                            icon={faPlus}
                            className="text-[10px]"
                          />
                          Tambah
                        </>
                      )}
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={openMutasi}
        onClose={() => setOpenMutasi(false)}
        title="Mutasi Anggota"
        size="sm"
      >
        <div className="space-y-5">
          {/* INFO CARD */}
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm">
            <p className="text-gray-700">Anda akan memindahkan anggota</p>

            <p className="mt-1 text-base font-semibold text-gray-900">
              {selectedMember?.nama}
            </p>

            <p className="mt-2 text-gray-600">
              ke tim atau grup lain yang berada di bawah tanggung jawab Anda.
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Pastikan Anda memilih{" "}
              <span className="font-medium text-gray-700">grup tujuan</span>{" "}
              yang sesuai sebelum melanjutkan proses mutasi.
            </p>
          </div>

          {/* SELECT GROUP */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Grup Tujuan
            </label>

            <select
              value={targetGroup}
              onChange={(e) => setTargetGroup(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 transition"
            >
              <option value="">— Pilih Grup Tujuan —</option>
              {groupKadiv
                .filter((g) => g.id !== idGroup)
                .map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nama_grup}
                  </option>
                ))}
            </select>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setOpenMutasi(false)}
              className="px-3 py-2 text-sm border rounded-md text-gray-700 hover:bg-gray-50 transition"
            >
              Batal
            </button>

            <button
              onClick={handleMutasi}
              disabled={!targetGroup}
              className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition"
            >
              Mutasi
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Show;
