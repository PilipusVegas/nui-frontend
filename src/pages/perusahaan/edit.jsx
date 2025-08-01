import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt } from "../../utils/jwtHelper";
import Swal from "sweetalert2";

const EditPerusahaan = () => {
  const [nama, setNama] = useState("");
  const [alamat, setAlamat] = useState("");
  const [shiftList, setShiftList] = useState([]);
  const [selectedShifts, setSelectedShifts] = useState([]);
  const [selectedOptionValue, setSelectedOptionValue] = useState("");
  const [perusahaanData, setPerusahaanData] = useState(null);

  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchPerusahaan();
    fetchShiftList();
  }, []);

  useEffect(() => {
    if (shiftList.length > 0 && perusahaanData?.data?.shift) {
      const shiftIds = perusahaanData.data.shift.map((s) => s.id).filter(Boolean);
      setSelectedShifts(shiftIds);
    }
  }, [shiftList, perusahaanData]);


  const fetchPerusahaan = async () => {
    try {
      const res = await fetchWithJwt(`${apiUrl}/perusahaan/${id}`);
      if (!res.ok) throw new Error("Gagal mengambil data perusahaan.");
      const data = await res.json();
      setNama(data?.data?.nama || "");
      setAlamat(data?.data?.alamat || "");


      setPerusahaanData(data);
    } catch (err) {
      console.error("Error:", err);
      alert("Gagal memuat data perusahaan.");
    }
  };

  const fetchShiftList = async () => {
    try {
      const res = await fetchWithJwt(`${apiUrl}/shift`);
      if (!res.ok) throw new Error("Gagal mengambil data shift.");
      const data = await res.json();
      const allShift = Array.isArray(data?.data) ? data.data : [];
      setShiftList(allShift);
    } catch (err) {
      console.error("Error:", err);
      alert("Gagal memuat data shift.");
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // === VALIDASI ===
    if (!nama.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "Nama perusahaan wajib diisi",
        text: "Silakan masukkan nama perusahaan terlebih dahulu.",
      });
    }

    if (!alamat.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "Alamat tidak boleh kosong",
        text: "Mohon isi alamat lengkap perusahaan.",
      });
    }

    if (selectedShifts.length === 0) {
      return Swal.fire({
        icon: "warning",
        title: "Shift belum dipilih",
        text: "Pilih setidaknya satu shift yang akan dikaitkan.",
      });
    }

    // === KONFIRMASI SIMPAN ===
    const confirm = await Swal.fire({
      title: "Yakin ingin menyimpan?",
      text: "Perubahan data perusahaan akan disimpan secara permanen.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, simpan!",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    // === EKSEKUSI SIMPAN ===
    try {
      const bodyData = {
        nama,
        alamat,
        detailShift: selectedShifts.map((id) => ({ id_shift: id })),
      };

      const res = await fetchWithJwt(`${apiUrl}/perusahaan/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) throw new Error("Gagal menyimpan perubahan.");

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data perusahaan berhasil diperbarui.",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/perusahaan");
    } catch (err) {
      console.error("Error saat menyimpan:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan",
        text: "Terjadi kesalahan saat memperbarui data perusahaan.",
      });
    }
  };


  const handleBack = () => navigate("/perusahaan");

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="w-full flex items-center justify-between pb-4 bg-white shadow-sm border-b">
        <div className="flex items-center space-x-2">
          <button onClick={handleBack} className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-full" title="Kembali">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Edit Perusahaan</h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-grow pt-5 sm:p-4 w-full mx-auto space-y-6">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Nama Perusahaan</label>
          <p className="text-xs text-gray-500 mb-2">Masukkan nama resmi perusahaan yang ingin diperbarui.</p>
          <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Alamat</label>
          <p className="text-xs text-gray-500 mb-2">Alamat lengkap kantor perusahaan terbaru.</p>
          <textarea value={alamat} onChange={(e) => setAlamat(e.target.value)} rows="3" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"></textarea>
        </div>

        {/* Pilih Shift */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Pilih Shift</label>
            <p className="text-xs text-gray-500 mb-2">Pilih satu per satu shift yang ingin dikaitkan.</p>
            <select
              value={selectedOptionValue}
              onChange={(e) => {
                const selectedId = parseInt(e.target.value);
                if (!selectedShifts.includes(selectedId)) {
                  setSelectedShifts([...selectedShifts, selectedId]);
                  setSelectedOptionValue("");
                }
              }}
              className="w-full border border-gray-300 rounded-md px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            >
              <option value="" disabled>
                -- Pilih shift --
              </option>
              {shiftList
                .filter((shift) => !selectedShifts.includes(shift.id))
                .map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.nama}
                  </option>
                ))}
            </select>

            {shiftList.length === 0 && (
              <p className="text-sm text-red-600 italic">
                *Tidak ada shift tersedia. Buat shift terlebih dahulu di menu{" "}
                <span
                  className="font-semibold text-green-700 px-3 py-0.5 bg-green-100 rounded-sm cursor-pointer hover:bg-green-200 border border-green-200 text-xs"
                  onClick={() => navigate("/shift")}
                >
                  Shift
                </span>
                .
              </p>
            )}
          </div>

          {/* Daftar Shift Terpilih */}
          {selectedShifts.length > 0 && (
            <div>
              <label className="block mb-1 font-medium text-gray-700 text-sm">Shift Terpilih</label>
              <p className="text-xs text-gray-500 mb-2">Di bawah ini adalah shift yang telah dipilih.</p>
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {selectedShifts.map((shiftId) => {
                  const shift = shiftList.find((s) => s.id === shiftId);
                  if (!shift) return null;

                  return (
                    <div key={shiftId} className="bg-white border border-green-200 rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow duration-200 space-y-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-semibold text-green-700">{shift.nama}</h3>
                        <button
                          type="button"
                          onClick={() => setSelectedShifts(selectedShifts.filter((id) => id !== shiftId))}
                          className="text-sm text-white bg-red-600 hover:bg-red-700 transition px-3 py-1 rounded-md shadow-sm"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                      <hr className="border-t border-green-100" />
                      <div className="text-sm text-gray-700 space-y-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Jadwal Shift
                        </p>
                        {Array.isArray(shift.detail) && shift.detail.length > 0 ? (
                          <ul className="space-y-1">
                            {shift.detail.map((jadwal, idx) => (
                              <li key={idx} className="flex justify-between border-b border-dashed border-gray-200 pb-1 text-xs">
                                <span className="text-gray-600 font-medium">{jadwal.hari}</span>
                                <span className="text-gray-800 font-semibold">
                                  {jadwal.jam_masuk} - {jadwal.jam_pulang}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="italic text-gray-400">Tidak ada jadwal shift.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Tombol Aksi */}
        <div className="flex justify-between space-x-4 pt-4">
          <button type="button" onClick={handleBack} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center shadow">
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            Batal
          </button>
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center shadow">
            <FontAwesomeIcon icon={faSave} className="mr-2" />
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPerusahaan;
