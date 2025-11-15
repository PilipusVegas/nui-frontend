import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus, faInfoCircle, faSortUp, faSortDown, faSort, faPhone, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
import { LoadingSpinner, EmptyState, ErrorState, Pagination, SearchBar, SectionHeader, Modal } from "../../components/";
import Select from "react-select";

const DataKaryawan = () => {
  const [editable] = useState(() => getUserFromToken());
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPerusahaan, setSelectedPerusahaan] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortOrder, setSortOrder] = useState(null);

  const handleSortStatus = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    const sortedUsers = [...users].sort((a, b) => {
      if (sortOrder === "asc") {
        return b.status - a.status;
      } else {
        return a.status - b.status;
      }
    });
    setUsers(sortedUsers);
  };

  const canEditOrDelete = (user) => {
    if (editable?.id_role === 1) return true;
    if (editable?.id_role === 4) return true;
    if (editable?.id_role === 6 && [5, 6, 7, 8, 9, 10, 11, 12, 13].includes(user.id_perusahaan)) {
      return true;
    }
    return false;
  };

  const fetchData = async (endpoint) => {
    try {
      const res = await fetchWithJwt(`${apiUrl}${endpoint}`);
      const json = await res.json();
      if (res.ok && (json.data || Array.isArray(json))) {
        return json.data || json;
      } else {
        throw new Error(json.message || "Gagal mengambil data.");
      }
    } catch (err) {
      throw new Error(err.message || "Terjadi kesalahan koneksi.");
    }
  };

  const fetchKaryawan = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const users = await fetchData("/profil");
      const filteredUsers = editable?.id_role === 1
        ? users
        : users.filter((user) => user.id_role !== 4);
      setUsers(filteredUsers);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKaryawan();
  }, [apiUrl, editable?.id_role]);

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    const matchSearch =
      (user?.nama?.toLowerCase().includes(query) ||
        user?.nip?.toLowerCase().includes(query) ||
        user?.perusahaan?.toLowerCase().includes(query) ||
        user?.role?.toLowerCase().includes(query) ||
        (user?.shift || "").toLowerCase().includes(query) ||
        (user?.status === 1 ? "aktif" : "nonaktif").includes(query));
    const matchPerusahaan = !selectedPerusahaan || user.perusahaan?.toLowerCase() === selectedPerusahaan.toLowerCase();
    const matchStatus = selectedStatus === "" || user.status?.toString() === selectedStatus;
    return matchSearch && matchPerusahaan && matchStatus;
  });

  const totalItems = filteredUsers.length;
  const itemsPerPage = 10;
  const indexOfFirstUser = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfFirstUser + itemsPerPage);


  const handleDelete = (id) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        setLoadingAction(true);
        const res = await fetchWithJwt(`${apiUrl}/profil/${id}`, { method: "DELETE" });
        const json = await res.json();
        if (json.success) {
          Swal.fire("Berhasil!", json.message, "success");
          setUsers((prev) => prev.filter((user) => user.id !== id));
        } else {
          Swal.fire("Gagal", json.message, "error");
        }
      } catch {
        Swal.fire("Gagal", "Terjadi kesalahan saat menghapus data.", "error");
      } finally {
        setLoadingAction(false);
      }
    });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedPerusahaan, selectedStatus]);

  return (
    <div className="flex flex-col">
      <div className="flex-grow">
        <SectionHeader title="Kelola Karyawan" subtitle="Halaman Untuk Menampilkan Data Karyawan." onBack={() => navigate("/home")} actions={
          <button onClick={() => navigate("/karyawan/tambah")} className="flex items-center justify-center px-3 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 ease-in-out active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2">
            <FontAwesomeIcon icon={faPlus} className="text-base sm:mr-2" />
            <span className="hidden sm:inline">Tambah Karyawan</span>
          </button>
        }
        />

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
          <div className="w-full sm:flex-[2.5]">
            <SearchBar onSearch={setSearchQuery} placeholder="Cari karyawan berdasarkan nama, role, atau perusahaan..." className="text-sm" />
          </div>

          <div className="w-full sm:flex-[1]">
            <label htmlFor="filter-perusahaan" className="text-[10px] sm:text-xs font-medium text-gray-600 mb-0.5 block">
              Perusahaan
            </label>
            <Select inputId="filter-perusahaan" className="text-xs sm:text-sm"
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: 36,
                  borderRadius: 8,
                }),
              }}
              options={[
                { value: "", label: "Semua" },
                ...[...new Set(users.map((u) => u.perusahaan).filter(Boolean))].map((p) => ({
                  value: p,
                  label: p,
                })),
              ]}
              value={
                selectedPerusahaan
                  ? { value: selectedPerusahaan, label: selectedPerusahaan }
                  : { value: "", label: "Semua" }
              }
              onChange={(opt) => setSelectedPerusahaan(opt?.value ?? "")}
              isClearable
              placeholder="Pilih perusahaan…"
            />
          </div>
        </div>

        {/* Kondisi Utama */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : errorMessage ? (
          <ErrorState message={"Terjadi kesalahan saat memuat data karyawan."} onRetry={fetchKaryawan} retryText="Coba Muat Ulang" />
        ) : users.length === 0 ? (
          <EmptyState title="Belum Ada Data Karyawan" description="Tambahkan karyawan baru atau cek kembali filter pencarian." actionLabel="Tambah Karyawan" onAction={() => navigate("/karyawan/tambah")} />
        ) : (
          <>
            <div className="relative hidden lg:block">
              {loadingAction && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
                  <LoadingSpinner size="lg" />
                </div>
              )}

              <table className="min-w-full table-auto bg-white border-collapse shadow-md rounded-lg">
                <thead>
                  <tr className="bg-green-500 text-white text-sm">
                    <th className="px-4 py-3 font-semibold text-center rounded-tl-lg">No.</th>
                    <th className="px-4 py-3 font-semibold text-center">NIP</th>
                    <th className="px-4 py-3 font-semibold text-center">Nama Karyawan</th>
                    <th className="px-4 py-3 font-semibold text-center">Divisi</th>
                    <th className="px-4 py-3 font-semibold text-center">Perusahaan</th>
                    <th className="px-4 py-3 font-semibold text-center">Shift</th>

                    <th className="px-4 py-3 font-semibold text-center cursor-pointer select-none" onClick={handleSortStatus} title={`Urutkan Status (${sortOrder === "asc" ? "Aktif dulu" : "Nonaktif dulu"})`}>
                      <div className="flex items-center justify-center gap-2">
                        <span>Status</span>
                        <FontAwesomeIcon icon={ sortOrder === "asc" ? faSortUp : sortOrder === "desc" ? faSortDown : faSort} className={`text-base transition-transform duration-200 ${sortOrder ? "text-white" : "text-white/70"}`}
                        />
                      </div>
                    </th>

                    <th className="px-4 py-3 font-semibold text-center rounded-tr-lg">Menu</th>
                  </tr>
                </thead>

                <tbody className="text-gray-800 text-sm">
                  {Array.isArray(currentUsers) && currentUsers.length > 0 ? (
                    currentUsers.map((user, index) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition duration-150 border-b border-gray-200">
                        <td className="px-4 py-2 text-center">{indexOfFirstUser + index + 1}</td>

                        <td className="px-4 py-2 text-center">
                          <span className={user.nip ? "" : "text-gray-400 italic text-xs"}>
                            {user.nip || "N/A"}
                          </span>
                        </td>

                        <td className="px-4 py-2 text-left font-semibold capitalize">
                          {user.nama || "Unknown Name"}
                        </td>

                        <td className="px-4 py-2 text-center text-sm text-gray-700">
                          {user.role || <span className="italic text-gray-400 text-xs">N/A</span>}
                        </td>

                        <td className="px-4 py-2 text-center text-[12px] text-gray-700 uppercase">
                          {user.perusahaan || "N/A"}
                        </td>

                        <td className="px-4 py-2 text-center">
                          <span className={user.shift ? "" : "text-gray-400 italic text-xs"}>
                            {user.shift || "N/A"}
                          </span>
                        </td>

                        <td className="px-4 py-2 text-center">
                          <span className={`px-3 py-0.5 text-xs font-semibold rounded-full ${user.status === 1 ? "bg-emerald-500 text-white" : "bg-gray-500 text-white"}`}>
                            {user.status === 1 ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>

                        {/* Menu */}
                        <td className="px-4 py-2 text-center">
                          <div className="flex justify-center gap-1.5">
                            <button onClick={() => navigate(`/karyawan/show/${user.id}`)} className={`px-2.5 py-1.5 font-medium rounded text-white text-xs flex items-center justify-center ${canEditOrDelete(user) ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"}`} disabled={!canEditOrDelete(user)} title="Detail">
                              <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                              Detail
                            </button>

                            <button
                              onClick={() => navigate(`/karyawan/edit/${user.id}`)}
                              className={`px-2.5 py-1.5 font-medium rounded text-white text-xs flex items-center justify-center ${canEditOrDelete(user)
                                ? "bg-yellow-500 hover:bg-yellow-600"
                                : "bg-gray-400 cursor-not-allowed"
                                }`}
                              disabled={!canEditOrDelete(user)}
                              title="Edit"
                            >
                              <FontAwesomeIcon icon={faEdit} className="mr-1" />
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(user.id)}
                              className={`px-2.5 py-1.5 font-medium rounded text-white text-xs flex items-center justify-center ${canEditOrDelete(user)
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-gray-400 cursor-not-allowed"
                                }`}
                              disabled={!canEditOrDelete(user)}
                              title="Hapus"
                            >
                              <FontAwesomeIcon icon={faTrash} className="mr-1" />
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center text-gray-500 py-4 italic text-sm">
                        Tidak ada data karyawan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>


            <div className="lg:hidden">
              {Array.isArray(currentUsers) && currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <div key={user.id} className="bg-white border border-gray-100 rounded-xl shadow-sm mb-3 text-[11.5px] text-gray-700 overflow-hidden transition-all hover:shadow-md hover:-translate-y-[2px]">
                    {/* Header */}
                    <div className="flex justify-between items-start px-4 pt-3 pb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-[13px] truncate">
                          {user.nama || "Tanpa Nama"}
                        </h3>

                        <div className="flex flex-wrap gap-1 mt-1 text-[10.5px] text-gray-500">
                          <span>
                            <span className="text-gray-400">NIP:</span>{" "}
                            <span className={user.nip ? "text-gray-700" : "italic text-gray-400"}>
                              {user.nip || "N/A"}
                            </span>
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-medium rounded-md border border-emerald-100">
                            {user.role || "N/A"}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${user.status === 1
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-gray-50 text-gray-500 border-gray-200"
                          }`}
                      >
                        {user.status === 1 ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>

                    {/* Detail */}
                    <div className="px-4 pb-3 text-[11px] text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Perusahaan</span>
                        <span className="font-medium text-gray-700">
                          {user.perusahaan || <span className="italic text-gray-400">N/A</span>}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Shift</span>
                        <span className="font-medium text-gray-700">
                          {user.shift || <span className="italic text-gray-400">N/A</span>}
                        </span>
                      </div>
                    </div>

                    {/* Footer Aksi */}
                    <div className="flex border-t border-gray-100 text-[11px] font-medium bg-gray-50">
                      <button
                        onClick={() => navigate(`/karyawan/show/${user.id}`)}
                        className={`flex-1 py-2 transition-colors ${[1, 4].includes(editable?.id_role)
                            ? "text-sky-700 hover:bg-sky-50"
                            : "text-gray-400 cursor-not-allowed"
                          }`}
                      >
                        Detail
                      </button>
                      <div className="w-px bg-gray-200" />
                      <button
                        onClick={() => [1, 4].includes(editable?.id_role) && navigate(`/karyawan/edit/${user.id}`)}
                        className={`flex-1 py-2 transition-colors ${[1, 4].includes(editable?.id_role)
                            ? "text-amber-600 hover:bg-amber-50"
                            : "text-gray-400 cursor-not-allowed"
                          }`}
                      >
                        Edit
                      </button>
                      <div className="w-px bg-gray-200" />
                      <button
                        onClick={() => [1, 4].includes(editable?.id_role) && handleDelete(user.id)}
                        className={`flex-1 py-2 transition-colors ${[1, 4].includes(editable?.id_role)
                            ? "text-rose-600 hover:bg-rose-50"
                            : "text-gray-400 cursor-not-allowed"
                          }`}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 mt-10 italic">
                  Tidak ada karyawan ditemukan
                </div>
              )}
            </div>
          </>
        )}


        <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} className="mt-10" />
      </div>
    </div>
  );
};

export default DataKaryawan;
