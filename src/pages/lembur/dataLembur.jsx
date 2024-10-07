import { useEffect, useState } from "react";
import "sweetalert2/dist/sweetalert2.min.css";
import { useNavigate } from "react-router-dom";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const DataLembur = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [lemburData, setLemburData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleBackClick = () => {navigate("/home")};
  const handleDetailClick = (lembur) => {navigate(`/detail-data-lembur/${lembur.id_user}`, { state: lembur })};

  const filteredLembur = lemburData.filter((lembur) => {
    return lembur.nama.toLowerCase().includes(searchQuery.toLowerCase());
  });

  useEffect(() => {
    const fetchLemburData = async () => {
      try {
        const response = await fetch(`${apiUrl}/lembur/hrd`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        const formattedData = result.map((item) => ({id_user: item.id_user, nama: item.nama, divisi: item.divisi, total: item.total}));
        formattedData.sort((a, b) => a.nama.localeCompare(b.nama));
        setLemburData(formattedData);
        setIsLoading(false);
      } catch (error) {
        setErrorMessage("Gagal mengambil data lembur. Silakan coba lagi.");
        setIsLoading(false);
      }
    };
    fetchLemburData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faArrowLeft} title="Back to Home" onClick={handleBackClick} className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"/>
            <h1 className="text-4xl font-bold text-gray-800 pb-1">DATA LEMBUR</h1>
          </div>
        </div>
        <div className="flex mb-4 items-center space-x-4">
          <input type="text" value={searchQuery} placeholder="Cari Nama Karyawan..." className="border p-2 rounded-md w-full flex-grow" onChange={(e) => {setSearchQuery(e.target.value)}}/>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">Loading...</div>
        ) : errorMessage ? (
          <p className="text-red-500 text-center">{errorMessage}</p>
        ) : (
          <div className="mb-8">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
              <thead className="bg-green-800 text-white uppercase text-sm leading-normal sticky top-0">
                <tr>
                  <th className="py-3 px-4 text-left">No.</th>
                  <th className="py-3 px-4 text-left">Nama</th>
                  <th className="py-3 px-4 text-left">Divisi</th>
                  <th className="py-3 px-4 text-left">Total Lembur</th>
                  <th className="py-3 px-4 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {filteredLembur.length > 0 ? (
                  filteredLembur.map((lembur, index) => (
                    <tr key={lembur.id_user} className="border-b border-gray-300 hover:bg-gray-100">
                      <td className="py-3 px-4 text-left">{index + 1}.</td>
                      <td className="py-3 px-4 text-left">{lembur.nama}</td>
                      <td className="py-3 px-4 text-left">{lembur.divisi}</td>
                      <td className="py-3 px-4 text-left">{lembur.total}</td>
                      <td className="py-3 px-4 text-left"><button onClick={() => handleDetailClick(lembur)} className="bg-blue-500 text-white py-1 px-4 rounded-md shadow hover:bg-blue-600 transition duration-200 ease-in-out">DETAIL</button></td>
                    </tr>
                  ))
                ) : (
                  <tr colSpan="5" className="py-3 px-4 text-center">Tidak ada data</tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataLembur;
