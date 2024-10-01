import Swal from 'sweetalert2';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom"; 
import MobileLayout from "../../layouts/mobileLayout";

const StepTwo = ({ lemburData = {} }) => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { userId = '', id_lokasi = '', tugas = '', tanggal = '', jamMulai = '', jamSelesai = '' } = lemburData;
  const dataToSend = {id_user: userId, tanggal, id_lokasi, deskripsi: tugas, jam_mulai: jamMulai, jam_selesai: jamSelesai};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log('Data yang akan dikirim:', dataToSend);
    try {
      Swal.fire('Data akan dikirim!', '', 'info');
      const response = await fetch(`${apiUrl}/lembur/simpan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      if (response.ok) {
        const result = await response.json();
        console.log('Data lembur berhasil dikirim:', result);
        Swal.fire('Lembur berhasil!', '', 'success');
        setIsSuccess(true);
      } else {
        const errorResult = await response.json();
        console.error('Gagal mengirim data lembur:', errorResult);
        const errorMessage = errorResult.message || 'Terjadi kesalahan';
        Swal.fire('Gagal mengirim data lembur', errorMessage, 'error');
        console.log('Pesan kesalahan dari API:', errorMessage);
      }
    } catch (error) {
      console.error('Terjadi kesalahan saat mengirim data lembur:', error);
      Swal.fire('Gagal mengirim data lembur', error.message || 'Terjadi kesalahan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const summaryItems = [
    { label: 'Nama', value: userId },
    { label: 'Lokasi', value: id_lokasi },
    { label: 'Deskripsi', value: tugas },
    { label: 'Tanggal', value: tanggal },
    { label: 'Jam Mulai', value: jamMulai },
    { label: 'Jam Selesai', value: jamSelesai },
  ].filter(item => item.value);

  useEffect(() => {
    if (isSuccess) {navigate('/')}
  }, [isSuccess, navigate]);

  return (
    <MobileLayout title="LEMBUR" className="p-6 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
      <div style={styles.container}>
        <form onSubmit={handleSubmit} style={styles.form}>
          {summaryItems.map((item, index) => (
            <div key={index} style={styles.itemWithBorder}>
              <strong style={styles.label}>{item.label}:</strong>
              <span style={styles.value}>{item.value}</span>
            </div>
          ))}
          <button type="submit" style={{ ...styles.submitButton, backgroundColor: loading ? '#ccc' : '#28a745' }} disabled={loading}>
            {loading ? 'Mengirim...' : 'KIRIM'}
          </button>
        </form>
      </div>
    </MobileLayout>
  );
};

StepTwo.propTypes = {
  lemburData: PropTypes.object.isRequired,
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
  },
};

export default StepTwo;
