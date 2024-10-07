import Swal from 'sweetalert2';
import { useEffect, useState } from "react";
import "sweetalert2/dist/sweetalert2.min.css";
import { useNavigate, useLocation } from "react-router-dom";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const DetailDataLembur = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const navigate = useNavigate();
  const location = useLocation();
  const lembur = location.state;
  const { id_user } = lembur || {};
  const [isLoading, setIsLoading] = useState(true);
  const [lemburData, setLemburData] = useState([]);
  const [totalLembur, setTotalLembur] = useState(0);
  const [selectedTask, setSelectedTask] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalJamLembur, setTotalJamLembur] = useState(0);
  
  const handleBackClick = () => navigate("/data-lembur");
  const handleCloseModal = () => {setIsModalOpen(false); setSelectedTask("")};
  const handleOpenModal = (tugas) => {setSelectedTask(tugas); setIsModalOpen(true)};

  const calculateHours = (start, end) => {
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);
    const startTime = startHour + startMinute / 60;
    const endTime = endHour + endMinute / 60;
    return endTime - startTime;
  };

  const handleStatusChange = async (index, id_lembur) => {
    try {
      const response = await fetch(`${apiUrl}/lembur/hrd/approve/${id_lembur}`, { method: "GET" });
      if (response.ok) {
        setLemburData((prevData) => {
          const updatedData = [...prevData];
          updatedData[index].status = 3;
          return updatedData;
        });
        Swal.fire({icon: 'success', title: 'Berhasil!', text: 'Anda sudah berhasil menyetujui lembur.', confirmButtonText: 'OK'});
      } else {
        const errorData = await response.json();
        Swal.fire({icon: 'error', title: 'Gagal!', text: `Tidak dapat memperbarui status lembur: ${errorData.message}`, confirmButtonText: 'OK'});
      }
    } catch (error) {
      Swal.fire({icon: 'error', title: 'Kesalahan!', text: 'Terjadi kesalahan saat memproses permintaan.', confirmButtonText: 'OK'});
    }
  };

  useEffect(() => {
    if (!lembur) {
      return;
    }
    const fetchLemburData = async () => {
      try {
        const response = await fetch(`${apiUrl}/lembur/hrd/detail/${id_user}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          const formattedData = data.map(item => ({
            id_user: item.id_user || 'ID User tidak tersedia',
            nama: item.nama || 'Nama tidak tersedia',
            divisi: item.divisi || 'Divisi tidak tersedia',
            tanggal: new Date(item.tanggal).toLocaleDateString('id-ID', {day: '2-digit', month: '2-digit', year: 'numeric'}),
            lokasi: item.lokasi || 'Lokasi tidak tersedia',
            deskripsi: item.deskripsi,
            jam_mulai: item.jam_mulai.slice(0, 5),
            jam_selesai: item.jam_selesai.slice(0, 5),
            status: item.status_lembur,
            id_lembur: item.id_lembur
          }));
          setLemburData(formattedData);
          const totalHours = formattedData.reduce((total, item) => {
            const jamLembur = calculateHours(item.jam_mulai, item.jam_selesai);
            return total + jamLembur;
          }, 0);
          const totalLemburCount = formattedData.length;
          setTotalJamLembur(Math.floor(totalHours));
          setTotalLembur(totalLemburCount);
        }
        setIsLoading(false);
      } catch (error) {
      }
    };    
    fetchLemburData();
  }, [id_user, apiUrl]);  

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <FontAwesomeIcon title="Kembali" icon={faArrowLeft} onClick={handleBackClick} className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg" />
            <h1 className="text-4xl font-bold text-gray-800 pb-1">DETAIL DATA LEMBUR</h1>
          </div>
        </div>
        {lembur && (
          <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{lembur.nama} - {lembur.divisi}</h2>
              <p className="text-gray-600">Total lembur {totalLembur} || Total jam {totalJamLembur}</p>
            </div>
          </div>
        )}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">Loading...</div>
        ) : (
          <div className="mb-8">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
              <thead className="bg-green-800 text-white uppercase text-sm leading-normal sticky top-0">
                <tr>
                  <th className="py-3 px-4 text-left">No.</th>
                  <th className="py-3 px-4 text-left">Tanggal</th>
                  <th className="py-3 px-4 text-left">Tugas</th>
                  <th className="py-3 px-4 text-left">Jam Mulai</th>
                  <th className="py-3 px-4 text-left">Jam Selesai</th>
                  <th className="py-3 px-4 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {lemburData.length > 0 ? (
                  lemburData.map((lembur, index) => (
                    <tr key={lembur.id_lembur} className="border-b border-gray-300 hover:bg-gray-100">
                      <td className="py-3 px-4 text-left">{index + 1}.</td>
                      <td className="py-3 px-4 text-left">{lembur.tanggal}</td>
                      <td className="py-3 px-4 text-left">
                        <button onClick={() => handleOpenModal(lembur.deskripsi)} className="bg-blue-500 text-white py-1 px-4 rounded-md shadow hover:bg-blue-600 transition duration-200 ease-in-out">Detail</button>
                      </td>
                      <td className="py-3 px-4 text-left">{lembur.jam_mulai}</td>
                      <td className="py-3 px-4 text-left">{lembur.jam_selesai}</td>
                      <td className="py-3 px-4 text-left">
                        {lembur.status === 1 && (<button onClick={() => handleStatusChange(index, lembur.id_lembur)} className="py-1 px-4 rounded-md shadow transition duration-200 ease-in-out bg-red-500 text-white hover:bg-red-600">Belum Disetujui</button>)}
                        {lembur.status === 3 && (<span className="text-green-500">Disetujui</span>)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-3">Data lembur tidak tersedia.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-5 shadow-md w-[40rem] h-[20rem] max-w-full relative">
            <h2 className="text-2xl font-bold mb-4">Detail Tugas</h2>
            <p className="text-lg">{selectedTask}</p>
            <div className="absolute bottom-5 right-5">
              <button onClick={handleCloseModal} className="bg-blue-500 text-white py-2 px-6 rounded-md">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailDataLembur;
