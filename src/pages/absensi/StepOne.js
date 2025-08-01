  import { useEffect, useRef, useState } from "react";
  import MobileLayout from "../../layouts/mobileLayout";
  import { fetchWithJwt, getUserFromToken } from "../../utils/jwtHelper";
  import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
  import { faArrowRight } from "@fortawesome/free-solid-svg-icons";

  const StepOne = ({ handleNextStepData }) => {
    const CHAR_LIMIT = 250;
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const [tugas, setTugas] = useState("");
    const [lokasi, setLokasi] = useState("");
    const [idLokasi, setIdLokasi] = useState("");
    const [charCount, setCharCount] = useState(0);
    const [locations, setLocations] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [errorLokasi, setErrorLokasi] = useState("");
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const dropdownRef = useRef(null);
    const [shiftList, setShiftList] = useState([]);
    const [selectedShift, setSelectedShift] = useState(null);
    const isFormValid = () => lokasi && idLokasi;
    const [userId, setUserId] = useState("");
    const [username, setUsername] = useState("");

    useEffect(() => {
      const user = getUserFromToken();
      if (user) {
        setUserId(user.id_user);
        setUsername(user.nama_user?.trim());
      }
    }, []);


    const handleTugasChange = (e) => {
      const value = e.target.value;
      if (value.length <= CHAR_LIMIT) {
        setTugas(value);
        setCharCount(value.length);
      }
    };

    const handleLokasiChange = (e) => {
      const inputValue = e.target.value;
      setLokasi(inputValue);
      const matches = locations.filter((location) =>
        location.nama.toLowerCase().includes(inputValue.toLowerCase())
      );
      if (matches.length > 0) {
        setFilteredLocations(matches);
        setErrorLokasi("");
      } else {
        setFilteredLocations([]);
        setErrorLokasi("Lokasi tidak ditemukan.");
      }
      setIdLokasi(""); 
      setDropdownVisible(true); 
    };

    const handleInputFocus = () => {
      setFilteredLocations(locations); 
      setDropdownVisible(true);
    };

    const handleInputBlur = (e) => {
      setTimeout(() => {
        if (!dropdownRef.current || !dropdownRef.current.contains(e.relatedTarget)) {
          setDropdownVisible(false);
        }
      }, 200);
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!isFormValid()) {
        setErrorLokasi("Gerai belum ditambahkan atau lokasi tidak valid.");
        return;
      }
      const formData = {
        userId,
        username,
        id_lokasi: idLokasi,
        lokasi,
        tugas,
        id_shift: selectedShift?.id ?? "",
        shift: selectedShift?.nama ?? "",
      };
      handleNextStepData(formData);
    };
    

    useEffect(() => {
      const fetchLocations = async () => {
        try {
          const response = await fetchWithJwt(`${apiUrl}/lokasi/`);
          if (!response.ok) throw new Error("Network response was not ok");
          const data = await response.json();
          setLocations(data.data);
        } catch (error) {
          console.error("Error fetching locations:", error);
        }
      };
      fetchLocations();
    }, [apiUrl]);

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

    
    const handleShiftChange = (e) => {
      const selectedId = parseInt(e.target.value);
      const found = shiftList.find((item) => item.id === selectedId);
      setSelectedShift(found || null);
    };
    useEffect(() => {
      fetchShift();
    }, []);
    

    return (
      <MobileLayout title="Mulai Absensi" className="p-6 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
        <div className="flex justify-center">
          <form className="w-full max-w-xl p-6 border-2 border-gray-300 rounded-lg bg-white" onSubmit={handleSubmit} ref={dropdownRef}>
            {/* Lokasi Input */}
            <div className="mb-4">
              <label htmlFor="lokasi" className="block text-sm font-bold mb-2">
                Lokasi<span className="text-red-500">* </span>
              </label>
              <div className="relative">
                <input type="text" id="lokasi" name="lokasi" autoComplete="off" value={lokasi} className={`w-full p-2 text-sm border-2 tracking-wide rounded-lg focus:outline-none ${ errorLokasi ? "border-red-500" : "border-gray-300 focus:border-blue-500"}`} onChange={handleLokasiChange} onFocus={handleInputFocus} onBlur={handleInputBlur} placeholder="Pilih atau ketik lokasi"/>
                {errorLokasi && <p className="mt-1 text-xs text-red-500">{errorLokasi}</p>}
              </div>

              {/* Dropdown Lokasi */}
              {dropdownVisible && filteredLocations.length > 0 && (
                <ul className="absolute max-2w-full bg-white border-2  border-gray-300 rounded-lg max-h-60 overflow-auto z-10 shadow-lg" tabIndex={-1}>
                  {filteredLocations.map((location) => (
                    <li key={location.id} onClick={() => { setLokasi(location.nama); setIdLokasi(location.id); setDropdownVisible(false); setErrorLokasi("");}} className="p-2 cursor-pointer hover:bg-gray-200">
                      {location.nama}
                    </li>
                  ))}
                  <li onClick={() => { setLokasi('Lainnya'); setIdLokasi('0'); setDropdownVisible(false); setErrorLokasi("");}} className="p-2 cursor-pointer hover:bg-gray-200">
                    Lainnya
                  </li>
                </ul>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Shift<span className="text-red-500">* </span></label>
              <select name="shift" value={selectedShift?.id || ""} onChange={handleShiftChange} className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 tracking-wide">
                <option value="" className="tracking-wide">-- Pilih Shift --</option>
                {shiftList.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.nama}
                  </option>
                ))}
              </select>
              {selectedShift && selectedShift.detail && (
              <div className="mt-2 bg-gray-50 border border-gray-200 rounded-md shadow-sm p-2">
                <h3 className="text-xs font-semibold text-green-700 mb-2">
                  Jadwal Shift: {selectedShift.nama}
                </h3>
                <div className="space-y-1">
                  {selectedShift.detail.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-white px-2 py-1 rounded border border-gray-200 text-xs text-gray-700">
                      <span>{item.hari}</span>
                      <span className="text-gray-500 tracking-wide font-semibold">{item.jam_masuk} - {item.jam_pulang}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>

            {/* Deskripsi Tugas */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="tugas" className="block text-sm font-bold">
                  Deskripsi Tugas (opsional):
                </label>
                <div className="text-sm text-gray-500">
                  {charCount} / {CHAR_LIMIT}
                </div>
              </div>
              <textarea rows="7" id="tugas" name="tugas" value={tugas} className="w-full p-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-vertical" onChange={handleTugasChange}/>
            </div>

            {/* Tombol Next */}
            <button type="submit" className={`w-full py-2 text-lg font-bold rounded-lg transition-all ${ isFormValid() ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-300 text-gray-500 cursor-not-allowed" }`} disabled={!isFormValid()} >
              Next
              <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
            </button>
          </form>
        </div>
      </MobileLayout>
    );
  };

  export default StepOne;
