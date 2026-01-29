import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt } from "../../utils/jwtHelper";
import toast from "react-hot-toast";
import {SectionHeader} from "../../components";

const hariList = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const TambahShift = () => {
  const [nama, setNama] = useState("");
  const [autoField, setAutoField] = useState(false);
  const [detail, setDetail] = useState(hariList.map(hari => ({ hari, jam_masuk: "", jam_pulang: "", })));
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const handleDetailChange = (index, field, value) => {
    const updated = [...detail];
    updated[index][field] = value;
    setDetail(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithJwt(`${apiUrl}/shift`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, detail }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan shift.");
      navigate("/shift");
    } catch (err) {
      console.error("Gagal simpan:", err);
      alert("Terjadi kesalahan saat menyimpan.");
    }
  };

  return (
    <div className="bg-white flex flex-col">
      <SectionHeader title="Tambah Shift" subtitle="Buat jadwal shift karyawan baru." onBack={() => navigate(-1)} />
      <form onSubmit={handleSubmit} className="flex-grow p-4 w-full mx-auto space-y-6">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Nama Shift</label>
          <p className="text-xs text-gray-500 mb-2">Contoh: Shift Pagi, Shift Malam, Shift Sore</p>
          <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
        </div>

        {detail[0].jam_masuk && detail[0].jam_pulang && (
          <label htmlFor="autoField" className="mt-6 block cursor-pointer rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm transition-all duration-200 hover:bg-green-100">
            <div className="flex items-start space-x-4">
              <input type="checkbox" id="autoField" checked={autoField}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setAutoField(isChecked);
                  if (isChecked) {
                    const senin = detail[0];
                    const newDetail = detail.map(item => {
                      if (["Selasa", "Rabu", "Kamis", "Jumat"].includes(item.hari)) {
                        return {
                          ...item,
                          jam_masuk: senin.jam_masuk,
                          jam_pulang: senin.jam_pulang
                        };
                      }
                      return item;
                    });
                    setDetail(newDetail);
                  } else {
                    const newDetail = detail.map(item => {
                      if (["Selasa", "Rabu", "Kamis", "Jumat"].includes(item.hari)) {
                        return {
                          ...item,
                          jam_masuk: "",
                          jam_pulang: ""
                        };
                      }
                      return item;
                    });
                    setDetail(newDetail);
                  }
                }}
                className="mt-1 w-5 h-5 accent-green-600"
              />

              <div className="text-sm">
                <span className="block font-semibold text-green-800">
                  Samakan Jadwal <span className="text-green-600">Selasa - Jumat</span> dengan <span className="text-green-600">Senin</span>
                </span>
                <p className="mt-1 text-gray-600 text-xs leading-relaxed italic">
                  Fitur <strong className="text-green-700">autoField</strong> ini membantu kamu menghemat waktu.
                  Cukup isi Senin satu kali, lalu centang untuk menyalin ke hari lainnya.
                </p>
              </div>
            </div>
          </label>
        )}

        {detail.map((item, index) => (
          <div key={item.hari}>
            <div className="grid grid-cols-[90px_1fr_1fr] gap-2 items-center">
              <div className="flex items-center">
                <label className="font-semibold text-gray-700 text-sm">
                  {item.hari}
                </label>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Jam Masuk</span>
                <input type="time" value={item.jam_masuk} onChange={(e) => handleDetailChange(index, "jam_masuk", e.target.value)} className="border px-3 py-2 rounded-lg" required/>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Jam Pulang</span>
                <input type="time" value={item.jam_pulang} onChange={(e) => handleDetailChange(index, "jam_pulang", e.target.value)} className="border px-3 py-2 rounded-lg" required/>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-between space-x-4 pt-4">
          <button type="button" onClick={() => navigate("/shift")} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center shadow">
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            Batal
          </button>
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center shadow">
            <FontAwesomeIcon icon={faSave} className="mr-2" />
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
};

export default TambahShift;
