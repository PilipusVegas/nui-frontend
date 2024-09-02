import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from 'react';

const StepOne = React.memo(({ formData, handleNextStepData }) => {
  const [namaOptions, setNamaOptions] = useState([]);
  const [form, setForm] = useState(formData.form || '');
  const [namaOptionsMap, setNamaOptionsMap] = useState({});
  const [divisiOptionsMap, setDivisiOptionsMap] = useState({});

  const isFormValid = () => localData.divisi && localData.nama && form;

  const [localData, setLocalData] = useState(() => {
    try {
      const savedData = localStorage.getItem('stepOneData');
      return savedData ? JSON.parse(savedData) : { nama: formData.nama || '', divisi: formData.divisi || '' };
    } catch (error) {
      console.error("Failed to parse local storage data:", error);
      return { nama: formData.nama || '', divisi: formData.divisi || '' };
    }
  });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === 'form') {
      setForm(value);
    } else {
      setLocalData((prevData) => {
        const updatedData = { ...prevData, [name]: value };
        localStorage.setItem('stepOneData', JSON.stringify(updatedData));
        return updatedData;
      });
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedNama = namaOptionsMap[localData.nama] || localData.nama;
    const selectedDivisi = divisiOptionsMap[localData.divisi] || localData.divisi;
    const updatedData = {
      ...localData,
      form,
      nama: selectedNama,
      divisi: selectedDivisi,
    };
    localStorage.removeItem('stepOneData');
    handleNextStepData(updatedData);
  };

  const divisiOptions = [
    { id: '1', name: 'Personal Assistant' },
    { id: '2', name: 'Project' },
    { id: '3', name: 'Teknisi' }
  ];

  useEffect(() => {
    const namaData = {
      1: [
        { id: '1', name: 'Abigail Y.' },
        { id: '2', name: 'Helena H. Y.' }
      ],
      2: [
        { id: '1', name: 'Yongki K. J.' }
      ],
      3: [
        { id: '1', name: 'Eef Syahrani' },
        { id: '2', name: 'Eka Prastia' },
        { id: '3', name: 'Rachmadoni P.' },
        { id: '4', name: 'Saja Gojali' },
        { id: '5', name: 'Solihin' },
        { id: '6', name: 'Wachyudi' }
      ],
    };
    const divisiMap = divisiOptions.reduce((acc, item) => {
      acc[item.id] = item.name;
      return acc;
    }, {});
    setDivisiOptionsMap(divisiMap);
    const options = namaData[localData.divisi] || [];
    setNamaOptions(options);
    const optionsMap = options.reduce((acc, item) => {
      acc[item.id] = item.name;
      return acc;
    }, {});
    setNamaOptionsMap(optionsMap);
  }, [localData.divisi]);

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="form" style={styles.label}>Form:</label>
          <select id="form" name="form" style={styles.select} onChange={handleChange} value={form}>
            <option value="">Pilih Form</option>
            <option value="absensi">Absensi</option>
            <option value="overtime">Overtime</option>
          </select>
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="divisi" style={styles.label}>Divisi:</label>
          <select id="divisi" name="divisi" style={styles.select} onChange={handleChange} value={localData.divisi}>
            <option value="">Pilih Divisi</option>
            {divisiOptions.map((divisi) => (<option key={divisi.id} value={divisi.id}>{divisi.name}</option>))}
          </select>
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="nama" style={styles.label}>Nama:</label>
          <select id="nama" name="nama" style={styles.select} value={localData.nama} onChange={handleChange} disabled={!localData.divisi}>
            <option value="">Pilih Nama</option>
            {namaOptions.map((nama) => (<option key={nama.id} value={nama.id}>{nama.name}</option>))}
          </select>
        </div>
        <div style={styles.formGroup}>
          <button type="submit" disabled={!isFormValid()} style={isFormValid() ? styles.buttonActive : styles.buttonInactive}>➜</button>
        </div>
      </form>
    </div>
  );
});

StepOne.propTypes = {
  formData: PropTypes.shape({
    nama: PropTypes.string,
    divisi: PropTypes.string,
    form: PropTypes.string
  }).isRequired,
  handleNextStepData: PropTypes.func.isRequired
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
    cursor: 'pointer',
    marginTop: '5px',
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

export default StepOne;
