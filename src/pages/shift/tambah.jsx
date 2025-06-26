import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";

const hariList = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const TambahShift = () => {
  const [nama, setNama] = useState("");
  const [autoField, setAutoField] = useState(false);
  const [detail, setDetail] = useState(
    hariList.map(hari => ({
      hari,
      jam_masuk: "",
      jam_pulang: "",
    }))
  );

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
      const res = await fetch(`${apiUrl}/shift`, {
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
    <div className="min-h-screen bg-white flex flex-col">
      <div className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b">
        <div className="flex items-center space-x-2">
          <button onClick={() => navigate("/shift")} className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-full" title="Kembali">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Tambah Shift</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-grow p-10 w-full mx-auto space-y-6">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Nama Shift</label>
          <p className="text-xs text-gray-500 mb-2">Contoh: Shift Pagi, Shift Malam, Setengah Hari</p>
          <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
        </div>

        {detail[0].jam_masuk && detail[0].jam_pulang && (
  <label
    htmlFor="autoField"
    className="mt-6 block rounded-xl border border-yellow-300 bg-yellow-50 p-4 shadow-sm cursor-pointer transition hover:bg-yellow-100"
  >
    <div className="flex items-start space-x-3">
      <input
        type="checkbox"
        id="autoField"
        checked={autoField}
        onChange={(e) => {
          setAutoField(e.target.checked);
          if (e.target.checked) {
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
          }
        }}
        className="mt-1 accent-yellow-500 w-5 h-5"
      />
      <div>
        <span className="text-sm font-medium text-gray-800">
          Samakan Jadwal <span className="text-green-600 font-semibold">Selasa - Jumat</span> dengan <span className="text-green-600 font-semibold">Senin</span>
        </span>
        <p className="text-xs text-gray-600 mt-1 italic leading-snug">
          Fitur <strong className="text-yellow-700">autoField</strong> ini membantu kamu menghemat waktu.
          Cukup isi Senin sekali, centang, dan jadwal lainnya langsung mengikuti!
        </p>
      </div>
    </div>
  </label>
)}



        {detail.map((item, index) => (
          <div key={item.hari}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <label className="block font-semibold text-gray-700">{item.hari}</label>
              <input type="time" value={item.jam_masuk} onChange={(e) => handleDetailChange(index, "jam_masuk", e.target.value)} required className="border px-3 py-2 rounded-lg" placeholder="Jam Masuk"/>
              <input type="time" value={item.jam_pulang} onChange={(e) => handleDetailChange(index, "jam_pulang", e.target.value)} required className="border px-3 py-2 rounded-lg" placeholder="Jam Pulang"/>
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
            Simpan Shift
          </button>
        </div>
      </form>
    </div>
  );
};

export default TambahShift;
