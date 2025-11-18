import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus, faInfoCircle, faSortUp, faSortDown, faSort, faCheckCircle, faExclamationCircle, faUserCheck, faEye } from "@fortawesome/free-solid-svg-icons";
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
  const [openInfo, setOpenInfo] = useState(false);
  const [selectedUserInfo, setSelectedUserInfo] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

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

    const matchPerusahaan =
      !selectedPerusahaan ||
      user.perusahaan?.toLowerCase() === selectedPerusahaan.toLowerCase();

    const matchStatus =
      selectedStatus === "" ||
      user.status?.toString() === selectedStatus;

    const matchRole =
      !selectedRole ||
      user.role?.toLowerCase() === selectedRole.toLowerCase();

    return matchSearch && matchPerusahaan && matchStatus && matchRole;
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
  }, [searchQuery, selectedPerusahaan, selectedStatus, selectedRole]);

  const requiredFields = {
    nik: "NIK",
    nip: "NIP",
    npwp: "NPWP",
    no_rek: "No Rekening",
    telp: "Nomor Telepon",
    status_nikah: "Status Nikah",
    id_shift: "Shift"
  };

  const getIncompleteFields = (user) => {
    if (!user || typeof user !== "object") return ["DATA KOSONG / ERROR"];

    const missing = [];

    Object.keys(requiredFields).forEach((key) => {
      const value = user[key];

      // khusus shift, nilai harus > 0
      if (key === "id_shift") {
        if (!value || value <= 0) missing.push(requiredFields[key]);
        return;
      }

      if (value === null || value === undefined || value === "") {
        missing.push(requiredFields[key]);
      }
    });

    return missing;
  };

  const isDataComplete = (user) => {
    return getIncompleteFields(user).length === 0;
  };


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
          <div className="w-full sm:flex-1">
            <SearchBar onSearch={setSearchQuery} placeholder="Cari karyawan berdasarkan nama, role, atau perusahaan..." className="text-sm" />
          </div>
          <div className="w-full sm:w-[200px]">
            <label className="text-[10px] sm:text-xs font-medium text-gray-600 mb-0.5 block">
              Perusahaan
            </label>
            <Select className="text-xs sm:text-sm"
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
              placeholder="Semua"
            />
          </div>

          {/* Filter Role */}
          <div className="w-full sm:w-[200px]">
            <label className="text-[10px] sm:text-xs font-medium text-gray-600 mb-0.5 block">
              Divisi / Role
            </label>
            <Select
              className="text-xs sm:text-sm"
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: 36,
                  borderRadius: 8,
                }),
              }}
              options={[
                { value: "", label: "Semua" },
                ...[...new Set(users.map((u) => u.role).filter(Boolean))].map((r) => ({
                  value: r,
                  label: r,
                })),
              ]}
              value={
                selectedRole
                  ? { value: selectedRole, label: selectedRole }
                  : { value: "", label: "Semua" }
              }
              onChange={(opt) => setSelectedRole(opt?.value ?? "")}
              isClearable
              placeholder="Semua"
            />
          </div>
        </div>

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
                        <FontAwesomeIcon icon={sortOrder === "asc" ? faSortUp : sortOrder === "desc" ? faSortDown : faSort} className={`text-base transition-transform duration-200 ${sortOrder ? "text-white" : "text-white/70"}`}
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

                        <td className="px-4 py-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 truncate">
                              <span className="font-semibold capitalize truncate max-w-[250px]">
                                {user.nama || "N/A"}
                              </span>
                            </div>

                            {!isDataComplete(user) && (
                              <FontAwesomeIcon icon={faExclamationCircle} className="text-red-500 text-lg cursor-pointer flex-shrink-0 animate-bounce"
                                onClick={() => {
                                  setSelectedUserInfo(user);
                                  setOpenInfo(true);
                                }}
                                title={`Data belum lengkap:\n- ${getIncompleteFields(user).join("\n- ")}`}
                              />
                            )}
                          </div>
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

                        <td className="px-4 py-2 text-center">
                          <div className="flex justify-center gap-1.5">
                            <button onClick={() => navigate(`/karyawan/show/${user.id}`)} className="px-2.5 py-1.5 font-medium rounded text-white text-xs flex items-center justify-center bg-blue-500 hover:bg-blue-600" title="Detail">
                              <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                              Detail
                            </button>
                            <button onClick={() => navigate(`/karyawan/edit/${user.id}`)} className="px-2.5 py-1.5 font-medium rounded text-white text-xs flex items-center justify-center bg-yellow-500 hover:bg-yellow-600" title="Edit">
                              <FontAwesomeIcon icon={faEdit} className="mr-1" />
                              Edit
                            </button>
                            <button onClick={() => handleDelete(user.id)} className="px-2.5 py-1.5 font-medium rounded text-white text-xs flex items-center justify-center bg-red-600 hover:bg-red-700" title="Hapus">
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
                  <div key={user.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-5 overflow-hidden">
                    <div className="px-4 pt-5 pb-3 flex justify-between items-start">
                      <div className="flex-1 min-w-0 space-y-1">
                        <h3 className="font-semibold text-gray-900 text-[17px] leading-tight">
                          {user.nama || "Tanpa Nama"}
                        </h3>

                        <div className="flex flex-wrap gap-2 mt-1 text-[13px] text-gray-700">
                          <span className="flex items-center gap-1">
                            <span className="text-gray-400">NIP:</span>
                            <span className={user.nip ? "text-gray-700" : "italic text-gray-400"}>
                              {user.nip || "N/A"}
                            </span>
                          </span>

                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-medium rounded-md flex items-center gap-1 border border-indigo-100">
                            <i className="fa-solid fa-briefcase text-[9px]" />
                            {user.role || "N/A"}
                          </span>
                        </div>
                      </div>

                      <span className={`ml-3 px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1 border ${user.status === 1 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                        <i className={`fa-solid ${user.status === 1 ? "fa-circle-check" : "fa-circle-xmark"} text-[12px]`} />
                        {user.status === 1 ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>

                    <div className="px-4 pb-3 text-[14px] text-gray-800 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 flex items-center gap-1">
                          <i className="fa-solid fa-building text-[11px]" />
                          Perusahaan
                        </span>
                        <span className="font-semibold text-gray-900 max-w-[60%] text-right truncate">
                          {user.perusahaan || <span className="italic text-gray-400">N/A</span>}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 flex items-center gap-1">
                          <i className="fa-solid fa-clock text-[11px]" />
                          Shift
                        </span>
                        <span className="font-semibold text-gray-900">
                          {user.shift || <span className="italic text-gray-400">N/A</span>}
                        </span>
                      </div>
                    </div>

                    <div className="px-4 py-3 border-t border-gray-200 bg-white flex justify-end gap-1.5">

                      <button onClick={() => navigate(`/karyawan/show/${user.id}`)} className="px-3 py-1.5 text-[12px] font-medium rounded text-white  flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600">
                        <FontAwesomeIcon icon={faEye} />
                        Detail
                      </button>

                      <button onClick={() => navigate(`/karyawan/edit/${user.id}`)} className="px-3 py-1.5 text-[12px] font-medium rounded text-white  flex items-center justify-center gap-1 bg-yellow-500 hover:bg-yellow-600">
                        <FontAwesomeIcon icon={faEdit} />
                        Edit
                      </button>

                      <button onClick={() => handleDelete(user.id)} className="px-3 py-1.5 text-[12px] font-medium rounded text-white  flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700">
                        <fontAwesomeIcon icon={faTrash} />
                        Hapus
                      </button>

                    </div>

                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 mt-10 italic">Tidak ada karyawan ditemukan</div>
              )}
            </div>
          </>
        )}
        <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} className="mt-10" />
      </div>

      <Modal isOpen={openInfo} onClose={() => setOpenInfo(false)} title="Kelengkapan Data" size="md" note={selectedUserInfo?.nama}
        footer={
          <div className="flex justify-between items-center gap-2 w-full">

            <button onClick={() => setOpenInfo(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded text-sm font-medium shadow-sm transition">
              Tutup
            </button>

            {!isDataComplete(selectedUserInfo) && (
              <button onClick={() => { setOpenInfo(false); navigate(`/karyawan/edit/${selectedUserInfo?.id}`); }}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm font-semibold shadow-md"
              >
                <FontAwesomeIcon icon={faEdit} className="text-white text-sm" />
                Perbaiki Data
              </button>
            )}
          </div>
        }
      >

        {selectedUserInfo && (
          <div className="text-[15px] leading-relaxed">
            {isDataComplete(selectedUserInfo) ? (
              <div className="p-4 rounded-lg bg-green-100 border border-green-300 shadow-sm">
                <p className="text-green-800 font-semibold flex items-center gap-2 text-[15px]">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-lg" />
                  Data karyawan ini sudah lengkap
                </p>
                <p className="text-green-800 mt-2">
                  Terima kasih! Seluruh informasi sudah sesuai dan siap digunakan untuk proses administrasi.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 shadow-[0_2px_6px_rgba(255,0,0,0.08)]">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <FontAwesomeIcon icon={faExclamationCircle} className="text-red-500 text-xl" />
                    </div>

                    <div>
                      <p className="font-semibold text-red-700 text-[16px] mb-1">
                        Beberapa data masih perlu dilengkapi
                      </p>

                      <ul className="list-disc pl-5 text-red-700 text-[15px] space-y-1">
                        {getIncompleteFields(selectedUserInfo).map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 shadow-[0_2px_6px_rgba(0,0,255,0.08)]">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        className="text-blue-500 text-lg"
                      />
                    </div>

                    <div>
                      <p className="text-blue-800 text-[15px] leading-relaxed font-medium">
                        Kelengkapan data sangat penting agar absensi, payroll, dan validasi karyawan
                        dapat berjalan tanpa kendala.
                      </p>

                      <p className="text-blue-800 text-[14px] mt-2">
                        Mohon lengkapi bagian yang masih kosong untuk memastikan data tersimpan dengan
                        benar dan akurat.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
};

export default DataKaryawan;
