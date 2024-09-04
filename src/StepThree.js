import { useState } from 'react';

const StepThree = ({ handleNextStepData }) => {
  const [jamMasuk, setJamMasuk] = useState(null);
  const [jamPulang, setJamPulang] = useState(null);
  const [isMasukSelected, setIsMasukSelected] = useState(false);
  const [isPulangSelected, setIsPulangSelected] = useState(false);
  const [titikKoordinatMasuk, setTitikKoordinatMasuk] = useState({ latitude: null, longitude: null });
  const [titikKoordinatPulang, setTitikKoordinatPulang] = useState({ latitude: null, longitude: null });

  const isFormValid = () => (isMasukSelected && jamMasuk && titikKoordinatMasuk) || (isPulangSelected && jamPulang && titikKoordinatPulang);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid()) {handleNextStepData({ jamMasuk, jamPulang, titikKoordinatMasuk, titikKoordinatPulang })}
  };

  const handleMasuk = () => {
    setJamMasuk(new Date());
    setIsMasukSelected(true);
    getLocation(setTitikKoordinatMasuk);
  };

  const handlePulang = () => {
    setJamPulang(new Date());
    setIsPulangSelected(true);
    getLocation(setTitikKoordinatPulang);
  };

  const formatTime = (date) => {
    if (!date) return '';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getLocation = (setLocation) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude })},
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const TimeDisplay = ({ date, time, coordinates }) => (
    <div style={styles.formGroup}>
      <div style={styles.timeDisplay}>
        <div style={styles.timeRow}>
          <div style={styles.label}>Tanggal:</div>
          <div style={styles.timeValue}>{formatDate(date)}</div>
        </div>
      </div>
      <div style={styles.timeDisplay}>
        <div style={styles.timeRow}>
          <div style={styles.label}>Jam:</div>
          <div style={styles.timeValue}>{formatTime(time)}</div>
        </div>
      </div>
      <div style={styles.timeDisplay}>
        <div style={styles.timeRow}>
          <div style={styles.label}>Lokasi:</div>
          <div style={styles.timeValue}>{`${coordinates.latitude || ''} ${coordinates.longitude || ''}`}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        {!isMasukSelected && !isPulangSelected && (
          <div style={styles.formGroup}>
            <div style={styles.buttonContainer}>
              <button type="button" onClick={handleMasuk} style={{ ...styles.button, ...styles.buttonStart }}>MULAI</button>
              <button type="button" onClick={handlePulang} style={{ ...styles.button, ...styles.buttonEnd }}>SELESAI</button>
            </div>
          </div>
        )}
        {isMasukSelected && (<TimeDisplay date={jamMasuk} time={jamMasuk} coordinates={titikKoordinatMasuk} />)}
        {isPulangSelected && (<TimeDisplay date={jamPulang} time={jamPulang} coordinates={titikKoordinatPulang} />)}
        <div style={styles.formGroup}>
          <button type="submit" disabled={!isFormValid()} style={isFormValid() ? styles.buttonActive : styles.buttonInactive}>➜</button>
        </div>
      </form>
    </div>
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
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  button: {
    width: '48%',
    padding: '15px',
    cursor: 'pointer',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    borderRadius: '10px',
    marginBottom: '-10px',
  },
  buttonStart: {
    border: '2px solid',
    backgroundColor: '#28a745',
  },
  buttonEnd: {
    border: '2px solid',
    backgroundColor: '#007bff',
  },
  timeDisplay: {
    padding: '12px',
    fontSize: '1rem',
    marginBottom: '10px',
    borderRadius: '10px',
    backgroundColor: '#f9f9f9',
    border: '2px solid #1C1C1C',
  },
  timeRow: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  label: {
    display: 'block',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  timeValue: {
    textAlign: 'right',
  },
  buttonActive: {
    width: '100%',
    padding: '10px',
    cursor: 'pointer',
    marginTop: '10px',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    borderRadius: '10px',
    marginBottom: '-10px',
    backgroundColor: '#28a745',
    border: '2px solid #000000',
  },
  buttonInactive: {
    width: '100%',
    padding: '10px',
    marginTop: '10px',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    borderRadius: '10px',
    cursor: 'not-allowed',
    marginBottom: '-10px',
    backgroundColor: '#b0b0b0',
    border: '2px solid #000000',
  },
};

export default StepThree;
