import PropTypes from 'prop-types';
import { useNavigate } from "react-router-dom"; 
import MobileLayout from "../../layouts/mobileLayout";

const StepThree = ({ formData = {}, handleNextStepData = () => {} }) => {
  const navigate = useNavigate(); 
  const { userId = '', username = '', id_lokasi = '', lokasi = '', tugas = '', jamMulai = null, tanggalMulai = '', koordinatMulai = '', fotoMulai = '', id_absen = '', fotoSelesai = '', tanggalSelesai = '', jamSelesai = '', koordinatSelesai = '' } = formData;

  console.log('Form Data:', formData);

  const summaryItems = [
    { label: 'Nama', value: username },
    { label: 'Lokasi', value: lokasi },
    { label: 'Tugas', value: tugas },
    { label: 'Tanggal Mulai', value: tanggalMulai },
    { label: 'Jam Mulai', value: jamMulai },
    { label: 'Koordinat Mulai', value: koordinatMulai },
    { label: 'Tanggal Selesai', value: tanggalSelesai },
    { label: 'Jam Selesai', value: jamSelesai },
    { label: 'Koordinat Selesai', value: koordinatSelesai },
  ].filter(item => item.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    alert('Data akan dikirim!');
  
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const titikKoordinatMulai = {
      latitude: parseFloat(koordinatMulai.split(',')[0]),
      longitude: parseFloat(koordinatMulai.split(',')[1]),
    };
  
    let data = {
      id_user: userId,
      lokasi: id_lokasi.toString(),
      deskripsi: tugas,
      lat: titikKoordinatMulai ? titikKoordinatMulai.latitude.toString() : '',
      lon: titikKoordinatMulai ? titikKoordinatMulai.longitude.toString() : '',
      foto: fotoMulai,
      tanggal: tanggalMulai,
      jam: jamMulai,
      id_absen: id_absen ? id_absen.toString() : '',
    };
  
    console.log('Data yang dikirim ke API:', data);
  
    try {
      let response;
      if (id_absen) {
        // Log data for absen/selesai
        const selesaiData = {
          ...data,
          foto: fotoSelesai,
          tanggal: tanggalSelesai,
          jam: jamSelesai,
          lat: koordinatSelesai ? parseFloat(koordinatSelesai.split(',')[0]).toString() : '',
          lon: koordinatSelesai ? parseFloat(koordinatSelesai.split(',')[1]).toString() : '',
          id_absen: id_absen.toString(),
        };
        console.log('Data yang dikirim ke absen/selesai:', selesaiData);
  
        response = await fetch(`${apiUrl}/absen/selesai`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selesaiData),
        });
      } else {
        // Log data for absen/mulai
        console.log('Data yang dikirim ke absen/mulai:', data);
  
        response = await fetch(`${apiUrl}/absen/mulai`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }
  
      if (!response.ok) { throw new Error('Gagal mengirim data'); }
      const result = await response.json();
      console.log('Response dari API:', result);
      handleNextStepData(formData);
      navigate('/'); // Kembali ke halaman Home setelah berhasil
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat mengirim data.');
    }
  };  

  return (
    <MobileLayout title="ABSENSI" className="p-6 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
      <div style={styles.container}>
        <form onSubmit={handleSubmit} style={styles.form}>
          {fotoMulai && (
            <div style={styles.photoContainer}>
              <img src={fotoMulai} alt="Foto Mulai" style={styles.fullImage} />
            </div>
          )}
          {fotoSelesai && (
            <div style={styles.photoContainer}>
              <img src={fotoSelesai} alt="Foto Selesai" style={styles.fullImage} />
            </div>
          )}
          {summaryItems.map((item, index) => (
            <div key={index} style={styles.itemWithBorder}>
              <strong style={styles.label}>{item.label}:</strong>
              <span style={styles.value}>{item.value}</span>
            </div>
          ))}
          <button type="submit" style={styles.submitButton}>KIRIM</button>
        </form>
      </div>
    </MobileLayout>
  );
};

StepThree.propTypes = {
  formData: PropTypes.object.isRequired,
  handleNextStepData: PropTypes.func.isRequired,
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },
  form: {
    width: '100%',
    padding: '20px',
    maxWidth: '600px',
    border: '2px solid',
    borderRadius: '10px',
    backgroundColor: '#f9f9f9',
  },
  photoContainer: {
    width: '100%',
    display: 'flex',
    marginBottom: '20px',
    justifyContent: 'center',
  },
  fullImage: {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'cover',
    borderRadius: '10px',
  },
  itemWithBorder: {
    padding: '10px',
    borderRadius: '10px',
    marginBottom: '10px',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
  },
  label: {
    fontSize: '1rem',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  value: {
    color: '#333',
    display: 'block',
    fontSize: '1rem',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
  },
  submitButton: {
    width: '100%',
    padding: '10px',
    cursor: 'pointer',
    marginTop: '10px',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    border: '2px solid',
    borderRadius: '10px',
    backgroundColor: '#28a745',
  },
};

export default StepThree;
