import PropTypes from 'prop-types';
import React, { useState, useCallback } from 'react';

const months = [
  { id: '1', name: 'Januari' },
  { id: '2', name: 'Februari' },
  { id: '3', name: 'Maret' },
  { id: '4', name: 'April' },
  { id: '5', name: 'Mei' },
  { id: '6', name: 'Juni' },
  { id: '7', name: 'Juli' },
  { id: '8', name: 'Agustus' },
  { id: '9', name: 'September' },
  { id: '10', name: 'Oktober' },
  { id: '11', name: 'November' },
  { id: '12', name: 'Desember' },
];

const years = [
  { id: '2', name: (new Date().getFullYear() - 1).toString() },
  { id: '1', name: new Date().getFullYear().toString() },
  { id: '3', name: (new Date().getFullYear() + 1).toString() },
];

const names = [
  { id: '1', name: 'Agus Mujiono' },
  { id: '2', name: 'Arya Maulana' },
  { id: '3', name: 'Dedi Wibowo' },
  { id: '4', name: 'Eef Syahrani' },
  { id: '5', name: 'Eka Prastia' },
  { id: '6', name: 'Latif Gopur' },
  { id: '7', name: 'Muhammad Arfan' },
  { id: '8', name: 'Oktavianus Sutandi' },
  { id: '9', name: 'Rachmadoni P.' },
  { id: '10', name: 'Saja Gojali' },
  { id: '11', name: 'Solihin' },
  { id: '12', name: 'Suparmin' },
  { id: '13', name: 'Wachyudi' },
];

const positions = [
  { id: '1', name: 'Senior Teknisi' },
  { id: '2', name: 'Staff Teknisi' },
];

const statuses = [
  { id: '1', name: 'Karyawan Tetap' },
  { id: '2', name: 'Karyawan Kontrak' },
];

const StepOne = React.memo(({ formData, handleNextStepData }) => {
  const isFormValid = () => localData.nama && localData.jabatan && localData.status && localData.bulan && localData.tahun && localData.keterangan;

  const getNameById = (id, array) => {
    const item = array.find((el) => el.id === id);
    return item ? item.name : '';
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setLocalData((prevData) => {
      const updatedData = { ...prevData, [name]: value };
      localStorage.setItem('stepOneData', JSON.stringify(updatedData));
      return updatedData;
    });
  }, []);

  const [localData, setLocalData] = useState(() => {
    try {
      const savedData = localStorage.getItem('stepOneData');
      return savedData ? JSON.parse(savedData) : {bulan: formData.bulan || '', tahun: formData.tahun || '', nama: formData.nama || '', jabatan: formData.jabatan || '', status: formData.status || '', keterangan: formData.keterangan || ''};
    } catch (error) {
      return {bulan: formData.bulan || '', tahun: formData.tahun || '', nama: formData.nama || '', jabatan: formData.jabatan || '', status: formData.status || '', keterangan: ''};
    }
  });

  const handleKeteranganChange = (e) => {
    const { value } = e.target;
    if (value.length <= 250) {
      setLocalData((prevData) => {
        const updatedData = { ...prevData, keterangan: value };
        localStorage.setItem('stepOneData', JSON.stringify(updatedData));
        return updatedData;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    console.log('Data:', {
      ...localData, 
      nama: getNameById(localData.nama, names), 
      jabatan: getNameById(localData.jabatan, positions), 
      status: getNameById(localData.status, statuses), 
      bulan: getNameById(localData.bulan, months), 
      keterangan: localData.keterangan
    });
    localStorage.removeItem('stepOneData');
    handleNextStepData({
      ...localData, 
      nama: getNameById(localData.nama, names), 
      jabatan: getNameById(localData.jabatan, positions), 
      status: getNameById(localData.status, statuses), 
      bulan: getNameById(localData.bulan, months), 
      keterangan: localData.keterangan
    });
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <div style={styles.row}>
            <div style={styles.column}>
              <label htmlFor="bulan" style={styles.label}>Bulan:</label>
              <select id="bulan" name="bulan" style={styles.select} value={localData.bulan} onChange={handleChange}>
                <option value="">Pilih Bulan</option>
                {months.map((month) => (<option key={month.id} value={month.id}>{month.name}</option>))}
              </select>
            </div>
            <div style={styles.column}>
              <label htmlFor="tahun" style={styles.label}>Tahun:</label>
              <select id="tahun" name="tahun" style={styles.select} value={localData.tahun} onChange={handleChange}>
                <option value="">Pilih Tahun</option>
                {years.map((year) => (<option key={year.id} value={year.name}>{year.name}</option>))}
              </select>
            </div>
          </div>
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="nama" style={styles.label}>Nama:</label>
          <select id="nama" name="nama" style={styles.select} value={localData.nama} onChange={handleChange}>
            <option value="">Pilih Nama</option>
            {names.map((name) => (<option key={name.id} value={name.id}>{name.name}</option>))}
          </select>
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="jabatan" style={styles.label}>Jabatan:</label>
          <select id="jabatan" name="jabatan" style={styles.select} value={localData.jabatan} onChange={handleChange}>
            <option value="">Pilih Jabatan</option>
            {positions.map((position) => (<option key={position.id} value={position.id}>{position.name}</option>))}
          </select>
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="status" style={styles.label}>Status:</label>
          <select id="status" name="status" style={styles.select} value={localData.status} onChange={handleChange}>
            <option value="">Pilih Status</option>
            {statuses.map((status) => (<option key={status.id} value={status.id}>{status.name}</option>))}
          </select>
        </div>
        <div style={styles.formGroup}>
          <div style={styles.keteranganContainer}>
            <label htmlFor="keterangan" style={styles.label}>Keterangan:</label>
            <div style={styles.charCount}>{(localData.keterangan || '').length} / 250</div>
          </div>
          <textarea required rows="4" id="keterangan" name="keterangan" value={localData.keterangan} style={styles.textarea} onChange={handleKeteranganChange} />
        </div>
        <div style={styles.formGroup}>
          <button type="submit" disabled={!isFormValid()} style={isFormValid() ? styles.buttonActive : styles.buttonInactive}>➜</button>
        </div>
      </form>
    </div>
  );
});

StepOne.propTypes = {
  formData: PropTypes.object.isRequired,
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
    marginBottom: '10px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  column: {
    flex: '1',
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
  keteranganContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    fontSize: '1rem',
    resize: 'vertical',
    borderRadius: '10px',
    boxSizing: 'border-box',
    border: '1px solid #1C1C1C',
  },
  charCount: {
    color: '#808080',
    fontSize: '1rem',
    marginTop: '-10px',
    marginRight: '10px',
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

export default StepOne;
