import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useParams, useNavigate } from "react-router-dom";
import PayrollExport from "./payrollExport";

const DetailPenggajian = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const { id_user } = useParams();
  const [dataUser, setDataUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("");
  
  const handleBackClick = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchPayrollDetail = async () => {
      try {
        const response = await fetch(`${apiUrl}/payroll/detail/${id_user}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        setDataUser(result); // Set data user
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayrollDetail();
  }, [apiUrl, id_user]);

  useEffect(() => {
    const calculatePeriod = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      let startDate, endDate;

      if (now.getDate() < 21) {
        startDate = new Date(currentYear, currentMonth - 1, 21);
        endDate = new Date(currentYear, currentMonth, 20);
      } else {
        startDate = new Date(currentYear, currentMonth, 21);
        endDate = new Date(currentYear, currentMonth + 1, 20);
      }
      setPeriod(
        `${startDate.toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })} - ${endDate.toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`
      );
    };

    calculatePeriod();
  }, []);

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
        <div className="ml-auto">
          <PayrollExport />
        </div>
      </div>

      {dataUser && (
        <div className="bg-white shadow-md rounded-lg p-8 mb-2 border border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-3xl pb-3 font-semibold">{dataUser.nama_user}</h1>
            <p className="text-sm">Periode : {period}</p>
          </div>
        </div>
      )}

      {dataUser && <DataTable data={dataUser.data} />}
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
            <tr key={index} className="hover:bg-gray-100 transition duration-200 even:bg-gray-50">
              <td className="py-2 px-4 border-b border-gray-200 text-center">{index + 1}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-center">
                {item.tanggal_absen || item.tanggal_lembur || "-"}
              </td>
              <td className="py-2 px-4 border-b border-gray-200 text-center">{item.absen_mulai || "0:00"}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-center">{item.keterlambatan || "0:00"}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-center">{item.absen_selesai || "0:00"}</td>
              <td className="py-2 px-4 border-b border-gray-200 text-center">{item.lembur || "0:00"}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6" className="text-center py-2">
              Tidak ada data absen untuk pengguna ini.
            </td>
          </tr>
        )}
      </tbody>

      <tfoot className="bg-gray-100 text-gray-700">
        <tr>
          <th colSpan="3" className="py-2 px-4 border-t border-gray-200 text-center">
            Total
          </th>

          <th className="py-2 px-4 border-t border-gray-200 text-center">
            {(() => {
              const totalKeterlambatan = data.reduce((acc, item) => {
                const [hours, minutes] = item.keterlambatan ? item.keterlambatan.split(":").map(Number) : [0, 0];
                return acc + hours * 60 + minutes;
              }, 0);
              const hours = Math.floor(totalKeterlambatan / 60);
              const minutes = totalKeterlambatan % 60;
              return `${hours}:${minutes.toString().padStart(2, "0")}`; // Format HH:MM
            })()}
          </th>

          <th colSpan="1" className="py-2 px-4 border-t border-gray-200 text-center"></th>

          <th className="py-2 px-4 border-t border-gray-200 text-center">
            {(() => {
              const totalLembur = data.reduce((acc, item) => {
                const [hours, minutes] = item.lembur ? item.lembur.split(":").map(Number) : [0, 0];
                return acc + hours * 60 + minutes;
              }, 0);
              const hours = Math.floor(totalLembur / 60);
              const minutes = totalLembur % 60;
              return `${hours}:${minutes.toString().padStart(2, "0")}`; // Format HH:MM
            })()}
          </th>
        </tr>
      </tfoot>
    </table>
  </div>
);

export default DetailPenggajian;
