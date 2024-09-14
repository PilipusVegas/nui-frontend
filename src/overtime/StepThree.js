import PropTypes from 'prop-types';

const StepThree = ({ formData, handleNextStepData }) => {
  const { form, userId, username, id_lokasi, lokasi, tugas, id_lembur, jamMasuk, jamPulang, titikKoordinatMasuk, titikKoordinatPulang } = formData;

  console.log('formData:', formData);

  const formatDateTime = (date) => {
    if (!date) return { tanggal: '', jam: '' };
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const tanggal = `${day}-${month}-${year}`;
    const jam = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    return { tanggal, jam };
  };

  console.log('jamMasuk:', jamMasuk);
  console.log('jamPulang:', jamPulang);

  const summaryItems = [
    { label: 'Form', value: form },
    { label: 'Nama', value: username },
    { label: 'Lokasi', value: lokasi },
    { label: 'Tugas', value: tugas, isSpecial: true },
    jamMasuk && { label: 'Jam Masuk', value: formatDateTime(jamMasuk).jam },
    jamMasuk && { label: 'Tanggal Masuk', value: formatDateTime(jamMasuk).tanggal },
    jamPulang && { label: 'Jam Pulang', value: formatDateTime(jamPulang).jam },
    jamPulang && { label: 'Tanggal Pulang', value: formatDateTime(jamPulang).tanggal },
    titikKoordinatMasuk?.latitude != null && titikKoordinatMasuk?.longitude != null && { label: '📍 Masuk', value: `${titikKoordinatMasuk.latitude} ${titikKoordinatMasuk.longitude}` },
    titikKoordinatPulang?.latitude != null && titikKoordinatPulang?.longitude != null && { label: '📍 Pulang', value: `${Math.abs(titikKoordinatPulang.latitude)} ${Math.abs(titikKoordinatPulang.longitude)}` },
  ].filter(Boolean);

  console.log('summaryItems:', summaryItems); // Cek daftar summaryItems

  const handleSubmit = async (e) => {
    e.preventDefault();
    let response;
    const apiUrl = process.env.REACT_APP_API_BASE_URL;

    if (jamMasuk && !jamPulang) {
      const dataMasuk = {
        id_user: userId,
        lokasi: id_lokasi?.toString(),
        deskripsi: tugas,
        lat: titikKoordinatMasuk ? titikKoordinatMasuk.latitude?.toString() : '',
        lon: titikKoordinatMasuk ? titikKoordinatMasuk.longitude?.toString() : '',
      };
      console.log('Data masuk yang dikirim:', dataMasuk); // Cek dataMasuk sebelum dikirim
      response = await fetch(`${apiUrl}/lembur/mulai`, {
        method: 'POST',
        body: JSON.stringify(dataMasuk),
        headers: { 'Content-Type': 'application/json' },
      });
    } else if (jamPulang) {
      const dataPulang = {
        id_lembur: id_lembur?.toString(),
        id_user: userId,
        lat: titikKoordinatPulang ? titikKoordinatPulang.latitude?.toString() : '',
        lon: titikKoordinatPulang ? titikKoordinatPulang.longitude?.toString() : '',
      };
      console.log('Data pulang yang dikirim:', dataPulang); // Cek dataPulang sebelum dikirim
      response = await fetch(`${apiUrl}/lembur/selesai`, {
        method: 'POST',
        body: JSON.stringify(dataPulang),
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return;
    }

    if (response.ok) {
      console.log('Data berhasil dikirim');
    } else {
      const errorData = await response.json();
      console.error('Terjadi kesalahan saat mengirim data:', errorData);
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
          <div>
            <button type="submit" style={styles.button}>OK</button>
          </div>
        </form>
      </div>
    </div>
  );
};


StepThree.propTypes = {
  formData: PropTypes.shape({
    form: PropTypes.string,
    username: PropTypes.string,
    lokasi: PropTypes.string,
    tugas: PropTypes.string,
    jamMasuk: PropTypes.instanceOf(Date),
    jamPulang: PropTypes.instanceOf(Date),
    titikKoordinatMasuk: PropTypes.shape({latitude: PropTypes.number, longitude: PropTypes.number}),
    titikKoordinatPulang: PropTypes.shape({latitude: PropTypes.number, longitude: PropTypes.number}),
    id_lembur: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
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

export default StepThree;
