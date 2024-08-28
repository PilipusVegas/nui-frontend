import { useState } from 'react';

const StepThree = ({ handleNextStepData }) => {
  const [jamPulang, setJamPulang] = useState(null);
  const [jamMasuk, setJamMasuk] = useState(null);
  const [isMasukSelected, setIsMasukSelected] = useState(false);
  const [isPulangSelected, setIsPulangSelected] = useState(false);
  const [titikKoordinatPulang, setTitikKoordinatPulang] = useState({ latitude: null, longitude: null });
  const [titikKoordinatMasuk, setTitikKoordinatMasuk] = useState({ latitude: null, longitude: null });

  const isFormValid = () => (isMasukSelected && jamMasuk && titikKoordinatMasuk) || (isPulangSelected && jamPulang && titikKoordinatPulang);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid()) { handleNextStepData({ jamMasuk, jamPulang, titikKoordinatMasuk, titikKoordinatPulang }); }
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
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        {!isMasukSelected && !isPulangSelected && (
          <div style={styles.formGroup}>
            <div style={styles.buttonContainer}>
              <button type="button" onClick={handleMasuk} style={{ ...styles.button, ...styles.buttonStart }}>MASUK</button>
              <button type="button" onClick={handlePulang} style={{ ...styles.button, ...styles.buttonStop }}>PULANG</button>
            </div>
          </div>
        )}
        {(isMasukSelected || isPulangSelected) && (
          <div>
            {isMasukSelected && (
              <>
                <div style={styles.timeDisplay}>
                  <div style={styles.timeRow}>
                    <div style={styles.label}>Tanggal:</div>
                    <div style={styles.timeValue}>{formatDate(jamMasuk)}</div>
                  </div>
                </div>
                <div style={styles.timeDisplay}>
                  <div style={styles.timeRow}>
                    <div style={styles.label}>Jam:</div>
                    <div style={styles.timeValue}>{formatTime(jamMasuk)}</div>
                  </div>
                </div>
                <div style={styles.timeDisplay}>
                  <div style={styles.timeRow}>
                    <div style={styles.label}>Lokasi:</div>
                    <div style={styles.timeValue}>{`${titikKoordinatMasuk.latitude || ''} ${titikKoordinatMasuk.longitude || ''}`}</div>
                  </div>
                </div>
              </>
            )}
            {isPulangSelected && (
              <>
                <div style={styles.timeDisplay}>
                  <div style={styles.timeRow}>
                    <div style={styles.label}>Tanggal:</div>
                    <div style={styles.timeValue}>{formatDate(jamPulang)}</div>
                  </div>
                </div>
                <div style={styles.timeDisplay}>
                  <div style={styles.timeRow}>
                    <div style={styles.label}>Jam:</div>
                    <div style={styles.timeValue}>{formatTime(jamPulang)}</div>
                  </div>  
                </div>
                <div style={styles.timeDisplay}>
                  <div style={styles.timeRow}>
                    <div style={styles.label}>Lokasi:</div>
                    <div style={styles.timeValue}>{`${titikKoordinatPulang.latitude} ${titikKoordinatPulang.longitude}`}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
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
    color: '#fff',
    width: '45%',
    padding: '16px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    borderRadius: '10px',
    border: '2px solid #1C1C1C',
  },
  buttonStart: {
    backgroundColor: '#28a745',
  },
  buttonStop: {
    backgroundColor: '#FF0000',
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
