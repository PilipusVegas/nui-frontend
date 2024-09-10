import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from 'react';

const StepFive = React.memo(({ setStep, formData, handleNextStepData }) => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [namaOptions, setNamaOptions] = useState([]);
  const [divisiOptions, setDivisiOptions] = useState([]);

  const resetForm = () => {setLocalData(prevData => ({...prevData, nama: formData.nama || '', divisi: formData.divisi || '', id_nama: formData.id_nama || '', id_lembur: formData.id_lembur || '', id_divisi: formData.id_divisi || ''}))};

  const [localData, setLocalData] = useState(() => {
    const savedData = localStorage.getItem('stepFiveData');
    return savedData ? JSON.parse(savedData) : { form: '', nama: '', divisi: '', id_nama: '', id_lembur: '', id_divisi: '' };
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${apiUrl}/lembur/cek/${localData.id_nama}`)
      .then(response => response.json())
      .then(data => {
        console.log('Data yang diterima dari API:', data);
        if (data.length > 0) {
          const fetchedIdAbsen = data[0].id_lembur;
          setLocalData(prevData => {
            const updatedData = { ...prevData, id_lembur: fetchedIdAbsen };
            localStorage.setItem('stepFiveData', JSON.stringify(updatedData));
            handleNextStepData(updatedData);
            setStep(3);
            return updatedData;
          });
        } else {
          setLocalData(prevData => {
            const updatedData = { ...prevData, id_lembur: '' };
            localStorage.setItem('stepFiveData', JSON.stringify(updatedData));
            handleNextStepData(updatedData);
            setStep(2);
            return updatedData;
          });
        }
      })
      .catch(error => {
        console.error('Terjadi kesalahan saat mem-fetch data:', error);
      });
  };  

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      if (name === 'divisi') {
        const selectedDivisi = divisiOptions.find(divisi => divisi.id === parseInt(value));
        setLocalData(prevData => {
          const updatedData = {
            ...prevData,
            divisi: selectedDivisi ? selectedDivisi.name : '',
            id_divisi: selectedDivisi ? selectedDivisi.id : ''
          };
          localStorage.setItem('stepFiveData', JSON.stringify(updatedData));
          return updatedData;
        });
      } else if (name === 'nama') {
        const selectedNama = namaOptions.find(nama => nama.id === parseInt(value));
        setLocalData(prevData => {
          const updatedData = {
            ...prevData,
            nama: selectedNama ? selectedNama.name : '',
            id_nama: selectedNama ? selectedNama.id : ''
          };
          localStorage.setItem('stepFiveData', JSON.stringify(updatedData));
          return updatedData;
        });
      }
    },
    [divisiOptions, namaOptions]
  );

  useEffect(() => {
    resetForm();
  }, [formData]);

  useEffect(() => {
    if (!localData.id_lembur) { setStep(1); }
  }, [localData.id_lembur, setStep]);

  useEffect(() => {
    fetch(`${apiUrl}/karyawan/divisi`)
      .then(response => response.json())
      .then(data => {
        const transformedData = data.map(item => ({ id: item.id, name: item.nama }));
        setDivisiOptions(transformedData);
      });
  }, []);

  useEffect(() => {
    if (localData.id_divisi) {
      fetch(`${apiUrl}/karyawan/divisi/${localData.id_divisi}`)
        .then(response => response.json())
        .then(data => {
          const transformedData = data.map(item => ({ id: item.id, name: item.nama }));
          setNamaOptions(transformedData);
        });
    } else {
      setNamaOptions([]);
    }
  }, [localData.id_divisi]);

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="divisi" style={styles.label}>Divisi:</label>
          <select id="divisi" name="divisi" style={styles.select} onChange={handleChange} value={localData.id_divisi}>
            <option value="">Pilih Divisi</option>
            {divisiOptions.map(divisi => (<option key={divisi.id} value={divisi.id}>{divisi.name}</option>))}
          </select>
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="nama" style={styles.label}>Nama:</label>
          <select id="nama" name="nama" style={styles.select} onChange={handleChange} value={localData.id_nama} disabled={!localData.id_divisi}>
            <option value="">Pilih Nama</option>
            {namaOptions.map(nama => (<option key={nama.id} value={nama.id}>{nama.name}</option>))}
          </select>
        </div>
        <div style={styles.formGroup}>
          <button type="submit" disabled={!localData.id_nama || !localData.id_divisi} style={localData.id_nama && localData.id_divisi ? styles.buttonActive : styles.buttonInactive}>➜</button>
        </div>
      </form>
    </div>
  );
});

StepFive.propTypes = {
  setStep: PropTypes.func.isRequired,
  formData: PropTypes.shape({
    nama: PropTypes.string,
    divisi: PropTypes.string,
    id_nama: PropTypes.number,
    id_lembur: PropTypes.string,
    id_divisi: PropTypes.number,
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
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    fontSize: '1rem',
    fontWeight: 'bold',
    marginBottom: '2px',
  },
  select: {
    width: '100%',
    padding: '12px',
    fontSize: '1rem',
    appearance: 'none',
    borderRadius: '10px',
    border: '2px solid #ccc',
  },
  buttonActive: {
    width: '100%',
    padding: '10px',
    marginTop: '5px',
    cursor: 'pointer',
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
    marginTop: '5px',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    borderRadius: '10px',
    cursor: 'not-allowed',
    marginBottom: '-10px',
    backgroundColor: '#b0b0b0',
    border: '2px solid #000000',
  },
};

export default StepFive;