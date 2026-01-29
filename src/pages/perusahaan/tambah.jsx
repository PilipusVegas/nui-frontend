import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faSave, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt } from "../../utils/jwtHelper";
import Select from "react-select";
import swal from "sweetalert2";

const TambahPerusahaan = () => {
  const [nama, setNama] = useState("");
  const [alamat, setAlamat] = useState("");
  const [shiftList, setShiftList] = useState([]);
  const [selectedShifts, setSelectedShifts] = useState([]);

  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  /* ================= FETCH SHIFT ================= */
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const res = await fetchWithJwt(`${apiUrl}/shift`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setShiftList(Array.isArray(data?.data) ? data.data : []);
      } catch {
        swal.fire("Error", "Gagal memuat data shift", "error");
      }
    };

    fetchShifts();
  }, [apiUrl]);


  const isFormComplete = () => {
    if (!nama.trim()) return "Nama perusahaan wajib diisi";
    if (!alamat.trim()) return "Alamat perusahaan wajib diisi";
    if (selectedShifts.length === 0)
      return "Minimal satu shift harus dipilih";
    return null;
  };


  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validate();
    if (error) return swal.fire("Validasi", error, "warning");

    const { isConfirmed } = await swal.fire({
      icon: "question",
      title: "Simpan perusahaan?",
      text: "Shift akan langsung berlaku sebagai jam kerja perusahaan.",
      showCancelButton: true,
      confirmButtonText: "Ya, simpan",
    });

    if (!isConfirmed) return;

    try {
      await savePerusahaan();
      await swal.fire("Berhasil", "Perusahaan berhasil ditambahkan", "success");
      navigate("/perusahaan");
    } catch {
      swal.fire("Gagal", "Terjadi kesalahan saat menyimpan", "error");
    }
  };


  /* ================= NAVIGATION ================= */
  const handleBack = () => navigate("/perusahaan");

  const availableShifts = shiftList.filter(
    (shift) => !selectedShifts.includes(shift.id)
  );

  const handleGoToDataShift = async () => {
    const { isConfirmed, isDenied } = await swal.fire({
      icon: "question",
      title: "Ke Data Shift?",
      text: "Anda bisa menyimpan data terlebih dahulu atau langsung ke Data Shift.",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Simpan dulu",
      denyButtonText: "Langsung ke Data Shift",
    });

    // ❌ Batal
    if (!isConfirmed && !isDenied) return;

    // ➡️ Langsung (tanpa simpan)
    if (isDenied) return navigate("/shift");

    // ✅ Simpan dulu
    const error = validate();
    if (error) return swal.fire("Validasi", error, "warning");

    try {
      await savePerusahaan();
      await swal.fire("Tersimpan", "Data perusahaan berhasil disimpan", "success");
      navigate("/shift");
    } catch {
      swal.fire("Gagal", "Terjadi kesalahan saat menyimpan", "error");
    }
  };


  const savePerusahaan = async () => {
    const res = await fetchWithJwt(`${apiUrl}/perusahaan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama,
        alamat,
        detailShift: selectedShifts.map((id) => ({ id_shift: id })),
      }),
    });

    if (!res.ok) throw new Error();
  };

  const validate = () => {
    if (!nama.trim()) return "Nama perusahaan wajib diisi";
    if (!alamat.trim()) return "Alamat perusahaan wajib diisi";
    if (!selectedShifts.length) return "Minimal satu shift harus dipilih";
    return null;
  };

  const shiftOptions = availableShifts.map((shift) => ({
    value: shift.id,
    label: shift.nama,
  }));


  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="w-full flex items-center pb-4 bg-white shadow-sm border-b">
        <button onClick={handleBack} className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-full mr-2">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Tambah Perusahaan
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex-grow pt-5 sm:p-4 w-full mx-auto space-y-6">
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Nama Perusahaan
          </label>
          <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Alamat Perusahaan
          </label>
          <textarea value={alamat} onChange={(e) => setAlamat(e.target.value)} rows="3" className="w-full px-4 py-2 border rounded-lg" />
        </div>

        <div className="space-y-4">
          {/* Header + Action */}
          <div className="flex items-start justify-between">
            <div>
              <label className="block text-sm font-semibold text-gray-800">
                Shift Perusahaan
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Shift yang dipilih akan menjadi jam kerja resmi perusahaan.
              </p>
            </div>

            {availableShifts.length === 0 && (
              <button type="button" onClick={handleGoToDataShift} className="text-xs font-semibold text-green-700 border border-green-200 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition">
                <FontAwesomeIcon icon={faArrowRight} /> Data Shift
              </button>
            )}
          </div>

          <div className="space-y-2">
            <Select
              options={shiftOptions}
              value={null} // selalu kosong setelah pilih
              onChange={(option) => {
                if (!option) return;
                setSelectedShifts((prev) => [...prev, option.value]);
              }}
              isDisabled={shiftOptions.length === 0}
              isClearable
              placeholder={
                shiftOptions.length === 0
                  ? "Semua shift sudah dipilih"
                  : "Pilih shift perusahaan"
              }
              classNamePrefix="react-select"
              styles={{
                control: (base, state) => ({
                  ...base,
                  minHeight: "44px",
                  borderRadius: "0.5rem",
                  borderColor: state.isFocused ? "#22c55e" : "#d1d5db",
                  boxShadow: state.isFocused ? "0 0 0 1px #22c55e" : "none",
                  "&:hover": {
                    borderColor: "#22c55e",
                  },
                  backgroundColor: state.isDisabled ? "#f3f4f6" : "#ffffff",
                }),
                placeholder: (base) => ({
                  ...base,
                  fontSize: "0.875rem",
                  color: "#6b7280",
                }),
                singleValue: (base) => ({
                  ...base,
                  fontSize: "0.875rem",
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 50,
                }),
              }}
            />
          </div>


          {/* Info saat shift habis */}
          {availableShifts.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-700">
                Semua shift telah dipilih
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Tidak ada shift lain yang tersedia untuk perusahaan ini.
                Gunakan tombol <b>Data Shift</b> di atas untuk menambahkan shift baru.
              </p>
            </div>
          )}
        </div>



        {/* Shift Terpilih + Detail */}
        {selectedShifts.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700">
              Shift Terpilih & Jadwal
            </p>

            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {selectedShifts.map((id) => {
                const shift = shiftList.find((s) => s.id === id);
                if (!shift) return null;

                return (
                  <div key={id} className="bg-white border border-green-200 rounded-2xl p-5 shadow-md space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-green-700">
                        {shift.nama}
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedShifts((prev) =>
                            prev.filter((x) => x !== id)
                          )
                        }
                        className="bg-red-600 text-white px-3 py-1 rounded"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                    <hr className="border-t border-green-100" />
                    <div className="text-sm text-gray-700">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        Jadwal Shift
                      </p>

                      {Array.isArray(shift.detail) &&
                        shift.detail.length > 0 ? (
                        <ul className="space-y-1">
                          {shift.detail.map((jadwal, idx) => (
                            <li key={idx} className="flex justify-between border-b border-dashed pb-1 text-xs">
                              <span className="font-medium">
                                {jadwal.hari}
                              </span>
                              <span className="font-semibold">
                                {jadwal.jam_masuk} – {jadwal.jam_pulang}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="italic text-gray-400">
                          Tidak ada jadwal shift
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <button type="button" onClick={handleBack} className="bg-red-500 text-white px-4 py-2 rounded flex items-center">
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            Batal
          </button>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded flex items-center">
            <FontAwesomeIcon icon={faSave} className="mr-2" />
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
};

export default TambahPerusahaan;
