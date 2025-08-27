import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPlus, faTimes, faEdit, faClock, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import {SectionHeader} from "../../components";

const ShiftTable = () => {
  const [shiftList, setShiftList] = useState([]);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const [expandedShiftId, setExpandedShiftId] = useState(null);

  const toggleDetail = (id) => {
    setExpandedShiftId((prevId) => (prevId === id ? null : id));
  };

  const fetchShift = async () => {
    try {
      const res = await fetchWithJwt(`${apiUrl}/shift`);
      const data = await res.json();
      const result = Array.isArray(data) ? data : data.data ?? [];
      setShiftList(result);
    } catch (err) {
      console.error("Gagal memuat data shift:", err);
    }
  };

  useEffect(() => {
    fetchShift();
  }, []);

  const handleBackClick = () => {
    navigate("/");
  };

  return (
    <div className="w-full mx-auto">
      <SectionHeader title="Jam Kerja / Shift" subtitle="Kelola jadwal shift karyawan dengan mudah." onBack={() => navigate(-1)}
        actions={
          <button onClick={() => navigate("/shift/tambah")} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2">
            <FontAwesomeIcon icon={faPlus} />
            <span className="inline sm:hidden text-sm">Tambah</span>
            <span className="hidden sm:inline">Tambah Shift</span>
          </button>
        }
      />

      <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="px-6 py-2 text-center">Jadwal Shift</th>
              <th className="px-6 py-2 text-center">Menu</th>
            </tr>
          </thead>
          <tbody>
            {shiftList.length === 0 ? (
              <tr>
                <td colSpan="3">
                  <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                    <FontAwesomeIcon icon={faClock} className="text-6xl text-gray-400 mb-4" />
                    <span className="text-lg font-medium text-center">
                      Belum ada data shift yang tersedia. Coba tambahkan terlebih dahulu, ya!
                    </span>
                  </div>
                </td>
              </tr>
            ) : shiftList.map((item) => (
              <React.Fragment key={item.id}>
                <tr className="border-t hover:bg-gray-50 transition text-sm">
                  <td className="px-4 py-3 sm:text-center align-top font-semibold w-full sm:w-auto">
                    <div className="flex flex-col sm:block text-center">
                      <span className="block text-gray-800 text-base font-semibold">{item.nama}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-left sm:text-center w-full sm:w-auto">
                    <div className="flex flex-col sm:flex-row gap-2 sm:justify-center">
                      <button onClick={() => toggleDetail(item.id)} className={`${expandedShiftId === item.id ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"} text-white px-3 py-1 rounded text-xs shadow flex items-center justify-center`}>
                        <FontAwesomeIcon icon={expandedShiftId === item.id ? faEyeSlash : faEye} className="mr-1" />
                        <span>{expandedShiftId === item.id ? "Tutup" : "Detail"}</span>
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Detail Baris */}
                {expandedShiftId === item.id && (
                  <tr className="border-b transition-all">
                    <td colSpan="2" className="px-6 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2 sm:gap-2">
                        {item.detail.map((d, idx) => (
                          <div key={idx} className="bg-gradient-to-tr from-white to-gray-50 border border-gray-200 rounded-lg shadow-sm px-4 py-1.5 flex justify-between items-center hover:shadow-md transition">
                            <div className="font-semibold text-gray-800">{d.hari}</div>
                            <div className="text-sm text-gray-600 font-medium">
                              {d.jam_masuk} - {d.jam_pulang}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShiftTable;
