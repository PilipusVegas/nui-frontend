import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import { fetchWithJwt } from "../../utils/jwtHelper";
const hariList = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const EditShift = () => {
  const [nama, setNama] = useState("");
  const [detail, setDetail] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchWithJwt(`${apiUrl}/shift/${id}`);
        const resData = await res.json();
        const data = resData.data; 
        setNama(data.nama || "");
        const detailData = hariList.map(hari => {
        const existing = data.detail?.find((d) => d.hari === hari);
          return {
            hari,
            jam_masuk: existing?.jam_masuk || "",
            jam_pulang: existing?.jam_pulang || "",
          };
        });
        setDetail(detailData);
      } catch (err) {
        console.error("Gagal mengambil data shift:", err);
        alert("Gagal memuat data shift.");
      }
    };
    fetchData();
  }, [apiUrl, id]);

  const handleDetailChange = (index, field, value) => {
    const updated = [...detail];
    updated[index][field] = value;
    setDetail(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithJwt(`${apiUrl}/shift/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, detail }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan perubahan.");
      navigate("/shift");
    } catch (err) {
      console.error("Error:", err);
      alert("Gagal memperbarui shift.");
    }
  };

  return (
    <div className="bg-white flex flex-col">
      <div className="w-full flex items-center justify-between pb-4 bg-white shadow-sm border-b">
        <div className="flex items-center space-x-2">
          <button onClick={() => navigate("/shift")} className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 sm:p-3 sm:px-4 rounded-full" title="Kembali">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h1 className="text-xl sm:text-3xl font-bold text-gray-800 mb-1">Edit Shift</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-grow p-2 sm:p-6 w-full mx-auto space-y-6">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Nama Shift</label>
          <p className="text-xs text-gray-500 mb-2">Contoh: Shift Pagi, Shift Malam, Setengah Hari</p>
          <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
        </div>
        {detail.map((item, index) => (
        <div key={item.hari} className="mb-4">
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-4 items-center">
            <label className="font-semibold text-gray-700">{item.hari}</label>
            <input type="time" value={item.jam_masuk} onChange={(e) => handleDetailChange(index, "jam_masuk", e.target.value)} required className="border px-3 py-2 rounded-lg"/>
            <input type="time" value={item.jam_pulang} onChange={(e) => handleDetailChange(index, "jam_pulang", e.target.value)} required className="border px-3 py-2 rounded-lg"/>
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

export default EditShift;
