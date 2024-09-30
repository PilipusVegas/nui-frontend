import Swal from 'sweetalert2';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom"; 
import MobileLayout from "../../layouts/mobileLayout";

const StepTwo = ({ lemburData = {} }) => {
  const navigate = useNavigate();

  const [isSuccess, setIsSuccess] = useState(false);
  const { username = '', lokasi = '', tugas = '', tanggal = '', jamMulai = '', jamSelesai = '' } = lemburData;

  console.log('Form Data:', lemburData);

  const handleSubmit = (e) => {
    e.preventDefault();
    Swal.fire('Data akan dikirim!', '', 'info');
    setIsSuccess(true);
    Swal.fire('Lembur berhasil!', '', 'success').then(() => {
      console.log('Data lembur telah berhasil dikirim:', lemburData);
    });
  }; 

  const summaryItems = [
    { label: 'Nama', value: username },
    { label: 'Lokasi', value: lokasi },
    { label: 'Tugas', value: tugas },
    { label: 'Tanggal', value: tanggal },
    { label: 'Jam Mulai', value: jamMulai },
    { label: 'Jam Selesai', value: jamSelesai },
  ].filter(item => item.value); 

  useEffect(() => {
    if (isSuccess) {
      navigate('/');
    }
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
          <button type="submit" style={styles.submitButton}>KIRIM</button>
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
    backgroundColor: '#28a745',
  },
};

export default StepTwo;
