import { useEffect, useState } from 'react';
import MobileLayout from "../../layouts/mobileLayout";

const StepOne = ({ handleNextStepData }) => {
  const CHAR_LIMIT = 250;
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  
  const [tugas, setTugas] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [idLokasi, setIdLokasi] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [locations, setLocations] = useState([]);

  const isFormValid = () => lokasi && tugas;

  const handleTugasChange = (e) => {
    const value = e.target.value;
    if (value.length <= CHAR_LIMIT) {setTugas(value); setCharCount(value.length)}
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
      const formData = { userId: localStorage.getItem("userId"), username: localStorage.getItem("userName"), id_lokasi: idLokasi, lokasi, tugas };
      handleNextStepData(formData);
    }
  };

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${apiUrl}/lokasi/`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setLocations(data);
      } catch (error) {
      }
    };
    fetchLocations();
  }, [apiUrl]);

  return (
    <MobileLayout title="ABSENSI" className="p-6 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
      <div style={styles.container}>
        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="lokasi" style={styles.label}>Lokasi:</label>
            <select id="lokasi" name="lokasi" value={lokasi} style={styles.select} onChange={handleLokasiChange}>
              <option value="">Pilih Lokasi</option>
              {locations.map(location => (<option key={location.id} value={location.nama}>{location.nama}</option>))}
            </select>
          </div>
          <div style={styles.formGroup}>
            <div style={styles.taskContainer}>
              <label htmlFor="tugas" style={styles.label}>Tugas yang diberikan:</label>
              <div style={styles.charCount}>{charCount} / {CHAR_LIMIT}</div>
            </div>
            <textarea required rows="4" id="tugas" name="tugas" value={tugas} style={styles.textarea} onChange={handleTugasChange}/>
          </div>
          <button type="submit" disabled={!isFormValid()} style={isFormValid() ? styles.buttonActive : styles.buttonInactive}>➜</button>
        </form>
      </div>
    </MobileLayout>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
  },
  form: {
    width: '100%',
    padding: '20px',
    maxWidth: '600px',
    border: '2px solid',
    borderRadius: '10px',
    backgroundColor: '#f9f9f9',
  },
  formGroup: {
    marginBottom: '10px',
  },
  label: {
    fontSize: '1rem',
    fontWeight: 'bold',
    marginBottom: '2px',
  },
  select: {
    width: '100%',
    padding: '10px',
    fontSize: '1rem',
    appearance: 'none',
    borderRadius: '10px',
    border: '2px solid #ccc',
  },
  taskContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  charCount: {
    fontSize: '1rem',
    marginRight: '10px',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    fontSize: '1rem',
    resize: 'vertical',
    borderRadius: '10px',
    border: '2px solid #ccc',
  },
  buttonActive: {
    width: '100%',
    padding: '10px',
    cursor: 'pointer',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    borderRadius: '10px',
    backgroundColor: '#28a745',
    border: '2px solid #000000',
  },
  buttonInactive: {
    width: '100%',
    padding: '10px',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    borderRadius: '10px',
    cursor: 'not-allowed',
    backgroundColor: '#b0b0b0',
    border: '2px solid #000000',
  },
};

export default StepOne;
