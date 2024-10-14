import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const DetailPenggajian = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const { id_user } = useParams();
  const [data, setData] = useState({ absen: [], lembur: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("absen");
  const handleBackClick = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiUrl}/payroll/detail/${id_user}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        const absenData = result.data.filter((item) => item.id_absen !== undefined && item.absen_status === 1);
        const lemburData = result.data.filter((item) => item.id_lembur !== undefined && item.lembur_status === 3);
        setData({ absen: absenData, lembur: lemburData });
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, id_user]);

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error fetching data: {error.message}</p>;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex items-center mb-6">
        <FontAwesomeIcon
          icon={faArrowLeft}
          title="Back to Home"
          onClick={handleBackClick}
          className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"
        />
        <h1 className="text-3xl font-bold text-gray-800">Data Penggajian Bulanan</h1>
      </div>
      <div className="flex space-x-4 mb-4">
        <button
          className={`px-4 py-2 rounded-md transition duration-200 ${
            activeTab === "absen" ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700 hover:bg-gray-400"
          }`}
          onClick={() => setActiveTab("absen")}
        >
          Absen
        </button>
        <button
          className={`px-4 py-2 rounded-md transition duration-200 ${
            activeTab === "lembur" ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700 hover:bg-gray-400"
          }`}
          onClick={() => setActiveTab("lembur")}
        >
          Lembur
        </button>
      </div>

      {activeTab === "absen" ? <DataTableAbsen data={data.absen} /> : <DataTableLembur data={data.lembur} />}
    </div>
  );
};

const DataTableAbsen = ({ data }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
        <thead className="bg-green-500 text-white"> {/* Changed to bg-green-500 */}
          <tr>
            <th className="py-3 px-4 text-left">No.</th>
            <th className="py-3 px-4 text-left">Nama</th>
            <th className="py-3 px-4 text-left">Absen Mulai</th>
            <th className="py-3 px-4 text-left">Absen Selesai</th>
            <th className="py-3 px-4 text-left">Deskripsi</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr key={item.id_absen} className="hover:bg-gray-100 transition duration-200 even:bg-gray-50">
                <td className="py-2 px-4 border-b border-gray-200">{index + 1}</td>
                <td className="py-2 px-4 border-b border-gray-200">{item.nama_user}</td>
                <td className="py-2 px-4 border-b border-gray-200">{new Date(item.absen_mulai).toLocaleString()}</td>
                <td className="py-2 px-4 border-b border-gray-200">
                  {item.absen_selesai ? new Date(item.absen_selesai).toLocaleString() : "Kosong"}
                </td>
                <td className="py-2 px-4 border-b border-gray-200">{item.deskripsi}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-2">
                Tidak ada data absen untuk pengguna ini.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
  
  const DataTableLembur = ({ data }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
        <thead className="bg-green-500 text-white"> {/* Changed to bg-green-500 */}
          <tr className="bg-green-500 text-white">
                {["No.","Nama","Tanggal","Mulai","Selesai","Tugas lembur","Total Jam"].map((header, index) => (
                  <th key={index} className="py-2 px-4 font-semibold text-center">
                    {header}
                  </th>
                ))}
              </tr>
        </thead>
        <tbody className="text-gray-700">
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr key={item.id_lembur} className="hover:bg-gray-100 transition duration-200 even:bg-gray-50">
                <td className="py-2 px-4 border-b border-gray-200">{index + 1}</td>
                <td className="py-2 px-4 border-b border-gray-200">{item.nama_user}</td>
                <td className="py-2 px-4 border-b border-gray-200">{new Date(item.lembur_tanggal).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b border-gray-200">{item.lembur_mulai}</td>
                <td className="py-2 px-4 border-b border-gray-200">{item.lembur_selesai}</td>
                <td className="py-2 px-4 border-b border-gray-200">{item.tugas_lembur}</td>
                <td className="py-2 px-4 border-b border-gray-200">{item.total_jam_lembur}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center py-2">
                Tidak ada data lembur untuk pengguna ini.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

export default DetailPenggajian;
