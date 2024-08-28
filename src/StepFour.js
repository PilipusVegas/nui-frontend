import PropTypes from 'prop-types';

const StepFour = ({ formData, handleNextStepData }) => {
  const { nama, divisi, tugas, lokasi, jamMasuk, jamPulang, titikKoordinatMasuk, titikKoordinatPulang } = formData;
  
  const formatDateTime = (date) => {
    if (!date) return { tanggal: '', jam: '' };
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const tanggal = `${day}-${month}-${year}`;
    const jam = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    return { tanggal, jam };
  };

  const summaryItems = [
    jamMasuk && { label: 'Tanggal', value: formatDateTime(jamMasuk).tanggal },
    jamPulang && { label: 'Tanggal', value: formatDateTime(jamPulang).tanggal },
    { label: 'Divisi', value: divisi },
    { label: 'Nama', value: nama },
    { label: 'Lokasi', value: lokasi },
    titikKoordinatMasuk?.latitude != null && titikKoordinatMasuk?.longitude != null && { label: '📍', value: `${titikKoordinatMasuk.latitude} ${titikKoordinatMasuk.longitude}` },
    titikKoordinatPulang?.latitude != null && titikKoordinatPulang?.longitude != null && { label: '📍', value: `${Math.abs(titikKoordinatPulang.latitude)} ${Math.abs(titikKoordinatPulang.longitude)}` },
    jamMasuk && { label: 'Jam Masuk', value: formatDateTime(jamMasuk).jam },
    jamPulang && { label: 'Jam Pulang', value: formatDateTime(jamPulang).jam },
    { label: 'Tugas', value: tugas, isSpecial: true },
  ].filter(Boolean);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedJamMasuk = jamMasuk ? formatDateTime(jamMasuk) : null;
    const formattedJamPulang = jamPulang ? formatDateTime(jamPulang) : null;
    if (jamMasuk && !jamPulang) {
      const dataMasuk = {
        nama,
        divisi,
        tugas,
        lokasi,
        tanggalMasuk: formattedJamMasuk ? formattedJamMasuk.tanggal : '',
        jamMasuk: formattedJamMasuk ? formattedJamMasuk.jam : '',
        titikKoordinatMasuk: titikKoordinatMasuk ? `${titikKoordinatMasuk.latitude} ${titikKoordinatMasuk.longitude}` : '',
      };
      console.log('Data masuk yang dikirim:', dataMasuk);
      // Panggil API untuk data masuk di sini
    } else if (jamPulang && !jamMasuk) {
      const dataPulang = {
        nama,
        divisi,
        tugas,
        lokasi,
        tanggalPulang: formattedJamPulang ? formattedJamPulang.tanggal : '',
        jamPulang: formattedJamPulang ? formattedJamPulang.jam : '',
        titikKoordinatPulang: titikKoordinatPulang ? `${Math.abs(titikKoordinatPulang.latitude)} ${Math.abs(titikKoordinatPulang.longitude)}` : '',
      };
      console.log('Data pulang yang dikirim:', dataPulang);
      // Panggil API untuk data pulang di sini
    } else {
      console.log('Error: Data tidak valid untuk pengiriman.');
    }
    handleNextStepData(formData);
  };

  return (
    <div style={styles.container}>
      <div style={styles.form}>
        <form onSubmit={handleSubmit}>
          <div style={styles.summary}>
            {summaryItems.map(({ label, value, isSpecial }) => (
              <div key={label} style={isSpecial ? styles.specialSummaryItem : styles.summaryItem}>
                <div style={styles.label}>{label}:</div>
                <div style={styles.value}>{value}</div>
              </div>
            ))}
          </div>
          <div style={styles.formGroup}>
            <button type="submit" style={styles.button}>OK</button>
          </div>
        </form>
      </div>
    </div>
  );
};

StepFour.propTypes = {
  formData: PropTypes.shape({
    nama: PropTypes.string,
    divisi: PropTypes.string,
    tugas: PropTypes.string,
    lokasi: PropTypes.string,
    jamMasuk: PropTypes.instanceOf(Date),
    jamPulang: PropTypes.instanceOf(Date),
    titikKoordinatMasuk: PropTypes.shape({
      latitude: PropTypes.number,
      longitude: PropTypes.number,
    }),
    titikKoordinatPulang: PropTypes.shape({
      latitude: PropTypes.number,
      longitude: PropTypes.number,
    }),
  }).isRequired,
  handleNextStepData: PropTypes.func.isRequired,
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
  summary: {
    display: 'flex',
    flexDirection: 'column',
  },
  summaryItem: {
    display: 'flex',
    padding: '10px',
    borderBottom: '2px solid #ddd',
    justifyContent: 'space-between',
  },
  specialSummaryItem: {
    display: 'flex',
    padding: '10px',
    flexDirection: 'column',
    borderBottom: '2px solid #ddd',
  },
  label: {
    fontSize: '1rem',
    fontWeight: 'bold',
    marginBottom: '2px',
  },
  value: {
    fontSize: '1rem',
    textAlign: 'justify',
    wordWrap: 'break-word',
  },
  button: {
    width: '100%',
    padding: '10px',
    cursor: 'pointer',
    marginTop: '20px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    borderRadius: '10px',
    backgroundColor: '#28a745',
    border: '2px solid #1C1C1C',
  },
};

export default StepFour;
