import { useEffect, useState } from 'react';
import MobileLayout from "../../layouts/mobileLayout";

const StepOne = ({ handleNextStepData }) => {
  const CHAR_LIMIT = 250;
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const [tugas, setTugas] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [idLokasi, setIdLokasi] = useState('');
  const [NamaLokasi, setNamaLokasi] = useState('');
  const [jamMulai, setJamMulai] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [locations, setLocations] = useState([]);
  const [jamSelesai, setJamSelesai] = useState('');

  const isFormValid = () => lokasi && tugas && tanggal && jamMulai && jamSelesai;

  const handleTugasChange = (e) => {
    const value = e.target.value;
    if (value.length <= CHAR_LIMIT) { setTugas(value); setCharCount(value.length); }
  };

  const handleLokasiChange = (e) => {
    const selectedLokasi = e.target.value;
    const selectedId = locations.find(location => location.nama === selectedLokasi)?.id || '';
    setLokasi(selectedLokasi);
    setIdLokasi(selectedId.toString());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid()) {
      const lemburData = {userId: localStorage.getItem("userId"), username: localStorage.getItem("userName"), id_lokasi: idLokasi, lokasi, tugas, tanggal, jamMulai, jamSelesai};
      console.log('Data to be sent:', lemburData);
      handleNextStepData(lemburData);
    }
  };  

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${apiUrl}/lokasi`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setLocations(data.data);
      } catch (error) {
      }
    };
    fetchLocations();
  }, [apiUrl]);

  return (
    <MobileLayout title="LEMBUR" className="p-6 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
      <div className="flex justify-center">
        <form className="w-full p-5 max-w-lg border-2 rounded-lg bg-gray-50" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="tanggal" className="block text-lg font-bold mb-2">Tanggal:</label>
            <input type="date" id="tanggal" name="tanggal" value={tanggal} className="w-full p-2 text-lg border-2 rounded-lg" onChange={(e) => setTanggal(e.target.value)} />
          </div>
          <div className="mb-4">
            <label htmlFor="lokasi" className="block text-lg font-bold mb-2">Lokasi:</label>
            <select id="lokasi" name="lokasi" value={lokasi} className="w-full p-2 text-lg border-2 rounded-lg" onChange={handleLokasiChange}>
              <option value="">Pilih Lokasi</option>
              {locations.map(location => (<option key={location.id} value={location.nama}>{location.nama}</option>))}
            </select>
          </div>
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <label htmlFor="tugas" className="block text-lg font-bold mb-2">Tugas yang diberikan:</label>
              <div className="text-sm">{charCount} / {CHAR_LIMIT}</div>
            </div>
            <textarea required rows="4" id="tugas" name="tugas" value={tugas} className="w-full p-2 text-lg border-2 rounded-lg resize-vertical" onChange={handleTugasChange} />
          </div>
          <div className="mb-4">
            <label htmlFor="jamMulai" className="block text-lg font-bold mb-2">Jam Mulai:</label>
            <input type="time" id="jamMulai" name="jamMulai" value={jamMulai} className="w-full p-2 text-lg border-2 rounded-lg" onChange={(e) => setJamMulai(e.target.value)} />
          </div>
          <div className="mb-4">
            <label htmlFor="jamSelesai" className="block text-lg font-bold mb-2">Jam Selesai:</label>
            <input type="time" id="jamSelesai" name="jamSelesai" value={jamSelesai} className="w-full p-2 text-lg border-2 rounded-lg" onChange={(e) => setJamSelesai(e.target.value)} />
          </div>
          <button type="submit" disabled={!isFormValid()} className={`w-full p-3 text-lg font-bold rounded-lg border-2 ${isFormValid() ? 'bg-green-500 border-green-700' : 'bg-gray-400 border-gray-600 cursor-not-allowed'}`}>➜</button>
        </form>
      </div>
    </MobileLayout>
  );
};

export default StepOne;
