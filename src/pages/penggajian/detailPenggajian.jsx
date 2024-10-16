import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const DetailPenggajian = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const { id_user } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleBackClick = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchPayrollDetail = async () => {
      try {
        const response = await fetch(`${apiUrl}/payroll/detail/${id_user}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        setData(result.data || []); // Assuming the absensi data is under result.data
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayrollDetail();
  }, [apiUrl, id_user]);

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error fetching data: {error.message}</p>;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <FontAwesomeIcon
            icon={faArrowLeft}
            title="Back to Home"
            onClick={handleBackClick}
            className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"
          />
          <h1 className="text-3xl font-bold text-gray-800">Detail Penggajian Bulanan</h1>
        </div>
      </div>

      <DataTable data={data} />
    </div>
  );
};

const DataTable = ({ data }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
      <thead className="bg-green-500 text-white">
        <tr>
          {["No.", "Tanggal", "IN", "L", "OUT", "T"].map((header, index) => (
            <th key={index} title="header" className="py-2 px-4 font-semibold text-center">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="text-gray-700">
        {data.length > 0 ? (
          data.map((item, index) => (
            <tr key={item.id_absen} className="hover:bg-gray-100 transition duration-200 even:bg-gray-50">
              <td className="py-2 px-4 border-b border-gray-200 text-center">{index + 1}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-center">{item.tanggal_absen || "0:00"}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-center">{item.absen_mulai || "0:00"}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-center">{item.keterlambatan || "0:00"}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-center">{item.absen_selesai || "0:00"}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-center">{item.lembur || "0:00"}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="8" className="text-center py-2">
              Tidak ada data absen untuk pengguna ini.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default DetailPenggajian;
