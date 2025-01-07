import { useEffect, useState } from "react";
import MobileLayout from "../../layouts/mobileLayout";

const StepOne = ({ handleNextStepData }) => {
  const CHAR_LIMIT = 250;
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [tugas, setTugas] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [idLokasi, setIdLokasi] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [locations, setLocations] = useState([]);

  const isFormValid = () => lokasi;

  const handleTugasChange = (e) => {
    const value = e.target.value;
    if (value.length <= CHAR_LIMIT) {
      setTugas(value);
      setCharCount(value.length);
    }
  };

  const handleLokasiChange = (e) => {
    const selectedLokasi = e.target.value;
    const selectedId = locations.find((location) => location.nama === selectedLokasi)?.id || "";
    setLokasi(selectedLokasi);
    setIdLokasi(selectedId.toString());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid()) {
      const formData = {
        userId: localStorage.getItem("userId"),
        username: localStorage.getItem("userName"),
        id_lokasi: idLokasi,
        lokasi,
        tugas,
      };
      handleNextStepData(formData);
    }
  };

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${apiUrl}/lokasi/`);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setLocations(data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchLocations();
  }, [apiUrl]);

  return (
    <MobileLayout title="ABSENSI" className="p-6 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
      <div className="flex justify-center">
        <form className="w-full max-w-xl p-6 border-2 border-gray-300 rounded-lg bg-white" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="lokasi" className="block text-sm font-bold mb-2">
              Lokasi<span className="text-red-500">* </span>:
            </label>
            <input
              list="lokasi-options"
              id="lokasi"
              name="lokasi"
              value={lokasi}
              className="w-full p-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              onChange={handleLokasiChange}
              placeholder="Pilih atau ketik lokasi"
            />
            <datalist id="lokasi-options">
              {locations.map((location) => (
                <option key={location.id} value={location.nama}>
                  {location.nama}
                </option>
              ))}
            </datalist>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="tugas" className="block text-sm font-bold">
                Deskripsi Tugas (opsional):
              </label>
              <div className="text-sm text-gray-500">
                {charCount} / {CHAR_LIMIT}
              </div>
            </div>
            <textarea
              rows="7"
              id="tugas"
              name="tugas"
              value={tugas}
              className="w-full p-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-vertical"
              onChange={handleTugasChange}
            />
          </div>

          <button
            type="submit"
            disabled={!isFormValid()}
            className={`w-full py-2 text-lg font-bold rounded-lg transition-all ${
              isFormValid() ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
           Next ➜
          </button>
        </form>
      </div>
    </MobileLayout>
  );
};

export default StepOne;
