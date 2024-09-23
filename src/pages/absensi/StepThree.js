import PropTypes from 'prop-types';
import { useNavigate } from "react-router-dom"; 
import { useState, useEffect } from 'react';
import MobileLayout from "../../layouts/mobileLayout";

const StepThree = ({ formData = {} }) => {
  const navigate = useNavigate(); 

  const [isSuccess, setIsSuccess] = useState(false);
  const { userId = '', username = '', id_lokasi = '', lokasi = '', tugas = '', jamMulai = null, tanggalMulai = '', koordinatMulai = '', fotoMulai = '', id_absen = '', fotoSelesai = '', tanggalSelesai = '', jamSelesai = '', koordinatSelesai = '' } = formData;

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
    let formDataToSend = new FormData();
    if (fotoMulai && fotoMulai.startsWith('blob:')) {
      const response = await fetch(fotoMulai);
      const blob = await response.blob();
      const file = new File([blob], 'fotoMulai.jpg', { type: blob.type });
      formDataToSend.append('foto', file);
    } else if (fotoMulai && fotoMulai instanceof File) {formDataToSend.append('foto', fotoMulai)}
    const titikKoordinatMulai = koordinatMulai ? {latitude: parseFloat(koordinatMulai.split(',')[0]), longitude: parseFloat(koordinatMulai.split(',')[1])} : null;
    const titikKoordinatSelesai = koordinatSelesai ? {latitude: parseFloat(koordinatSelesai.split(',')[0]), longitude: parseFloat(koordinatSelesai.split(',')[1])} : null;
    let endpoint;
    if (id_absen) {
      endpoint = '/absen/selesai';
      formDataToSend.append('id_absen', id_absen);
      if (fotoSelesai && fotoSelesai.startsWith('blob:')) {
        const response = await fetch(fotoSelesai);
        const blob = await response.blob();
        const file = new File([blob], 'fotoSelesai.jpg', { type: blob.type });
        formDataToSend.append('foto', file);
      } else if (fotoSelesai && fotoSelesai instanceof File) {
        formDataToSend.append('foto', fotoSelesai);
      }
      if (userId) formDataToSend.append('id_user', userId.toString());
      if (titikKoordinatSelesai) {
        formDataToSend.append('lat', titikKoordinatSelesai.latitude.toString());
        formDataToSend.append('lon', titikKoordinatSelesai.longitude.toString());
      }
      console.log('Mengirim data ke API:', endpoint);
      console.log('Data yang dikirim untuk absen/selesai:', Array.from(formDataToSend.entries()));
    } else {
      endpoint = '/absen/mulai';
      if (userId) formDataToSend.append('id_user', userId.toString());
      if (tugas) formDataToSend.append('deskripsi', tugas);
      if (id_lokasi) formDataToSend.append('lokasi', id_lokasi);
      if (titikKoordinatMulai) {
        formDataToSend.append('lat', titikKoordinatMulai.latitude.toString());
        formDataToSend.append('lon', titikKoordinatMulai.longitude.toString());
      }
      if (!formDataToSend.has('foto')) {
        if (fotoMulai && fotoMulai instanceof File) {
          formDataToSend.append('foto', fotoMulai);
        }
      }
      console.log('Mengirim data ke API:', endpoint);
      console.log('Data yang dikirim untuk absen/mulai:', Array.from(formDataToSend.entries()));
    }
    try {
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        body: formDataToSend,
      });
      if (!response.ok) {
        throw new Error('Gagal mengirim data');
      }
      const result = await response.json();
      console.log('Response dari API:', result);
      if (result.message.includes("berhasil disimpan")) {
        setIsSuccess(true);
        alert('Absen berhasil!');
      }
    } catch (error) {
      alert('Terjadi kesalahan saat mengirim data.');
      console.error(error);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      navigate('/');
    }
  }, [isSuccess, navigate]);

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
