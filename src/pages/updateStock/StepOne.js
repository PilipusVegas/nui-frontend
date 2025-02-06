import PropTypes from 'prop-types';
import React, { useState, useCallback } from 'react';

const inOutOptions = [
  { id: '1', name: 'Masuk' },
  { id: '2', name: 'Keluar' },
];

const deviceOptions = [
  { id: '1', name: 'Zigbee Smart Hub Plus THP-12Z' },
  { id: '2', name: 'Temperature Humidity Sensor TH101-Z' },
  { id: '3', name: 'Infared Universal Remote Control UFO-R4Z' },
  { id: '4', name: 'Universal IR Remote 12M BARDI' },
];

const instalasiOptions = [
  { id: '1', name: 'KFC MAXX Karawaci' },
  { id: '2', name: 'KFC Tanjung Duren' },
  { id: '3', name: 'KFC Jalan Panjang' },
  { id: '4', name: 'KFC Cideng' },
  { id: '5', name: 'KFC Cempaka Putih' },
  { id: '6', name: 'KFC Basmar Plaza' },
  { id: '7', name: 'KFC Kemang' },
  { id: '8', name: 'KFC Ciledug Pertukangan' },
  { id: '9', name: 'KFC Balai Pustaka Rawamangun' },
  { id: '10', name: 'KFC Taman Harapan Indah' },
  { id: '11', name: 'KFC Juanda' },
  { id: '12', name: 'KFC Alamanda Karang Satria' },
  { id: '13', name: 'KFC Citralake Sawangan' },
  { id: '14', name: 'KFC Meruyung' },
  { id: '15', name: 'KFC Mayor Oking' },
];

const pemberiOptions = [
  { id: '1', name: 'Abigail Y.' },
  { id: '2', name: 'Helena Y.' },
];

const penerimaOptions = [
  { id: '1', name: 'Rachmadoni P.' },
  { id: '2', name: 'Saja Gojali' },
  { id: '3', name: 'Eka Prastia' },
];

const StepOne = React.memo(({ formData, handleNextStepData }) => {
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setLocalData((prevData) => {
      const updatedData = { ...prevData, [name]: value };
      localStorage.setItem('stepOneData', JSON.stringify(updatedData));
      return updatedData;
    });
  }, []);

  const isFormValid = () => {
    if (localData.inOut === '1') {
      return localData.date && localData.device && localData.jumlah > 0;
    } else if (localData.inOut === '2') {
      return localData.date && localData.device && localData.jumlah > 0 && localData.instalasi && localData.pemberi && localData.penerima;
    }
    return false;
  };

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

  const [localData, setLocalData] = useState(() => {
    try {
      const savedData = localStorage.getItem('stepOneData');
      return savedData ? JSON.parse(savedData) : {
        inOut: formData.inOut || '',
        keterangan: formData.keterangan || '',
        date: formData.date || '',
        device: formData.device || '',
        jumlah: formData.jumlah || '',
        instalasi: formData.instalasi || '',
        pemberi: formData.pemberi || '',
        penerima: formData.penerima || '',
      };
    } catch (error) {
      return {
        inOut: formData.inOut || '',
        keterangan: '',
        date: '',
        device: '',
        jumlah: '',
        instalasi: '',
        pemberi: '',
        penerima: '',
      };
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    if (localData.inOut === '1') {
      const masukData = {
        tanggal: localData.date,
        device: localData.device,
        jumlah: localData.jumlah,
      };
      // console.log('Data Masuk:', masukData);
      localStorage.setItem('masukData', JSON.stringify(masukData));
    } else if (localData.inOut === '2') {
      const keluarData = {
        tanggal: localData.date,
        device: localData.device,
        jumlah: localData.jumlah,
        instalasi: localData.instalasi,
        pemberi: localData.pemberi,
        penerima: localData.penerima,
        keterangan: localData.keterangan,
      };
      // console.log('Data Keluar:', keluarData);
      localStorage.setItem('keluarData', JSON.stringify(keluarData));
    }
    localStorage.removeItem('stepOneData');
    handleNextStepData(localData);
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="inOut" style={styles.label}>Update Stock</label>
          <select id="inOut" name="inOut" style={styles.select} value={localData.inOut} onChange={handleChange}>
            <option value="">Pilih Update Stock</option>
            {inOutOptions.map((option) => (<option key={option.id} value={option.id}>{option.name}</option>))}
          </select>
        </div>
        {localData.inOut && (
          <>
            <div style={styles.formGroup}>
              <label htmlFor="date" style={styles.label}>Tanggal:</label>
              <input type="date" id="date" name="date" style={styles.input} value={localData.date} onChange={handleChange} />
            </div>
            <div style={styles.formGroup}>
              <label htmlFor="device" style={styles.label}>Device:</label>
              <select id="device" name="device" style={styles.select} value={localData.device} onChange={handleChange}>
                <option value="">Pilih Device</option>
                {deviceOptions.map((option) => (<option key={option.id} value={option.id}>{option.name}</option>))}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label htmlFor="jumlah" style={styles.label}>Jumlah:</label>
              <input type="number" id="jumlah" name="jumlah" style={styles.input} value={localData.jumlah} onChange={handleChange} placeholder="0" min="0" />
            </div>
            {localData.inOut === '2' && (
              <>
                <div style={styles.formGroup}>
                  <div style={styles.keteranganContainer}>
                    <label htmlFor="keterangan" style={styles.label}>Keterangan:</label>
                    <div style={styles.charCount}>{(localData.keterangan || '').length} / 250</div>
                  </div>
                  <textarea required rows="4" id="keterangan" name="keterangan" value={localData.keterangan} style={styles.textarea} onChange={handleKeteranganChange} />
                </div>
                <div style={styles.formGroup}>
                  <label htmlFor="instalasi" style={styles.label}>Instalasi:</label>
                  <select id="instalasi" name="instalasi" style={styles.select} value={localData.instalasi} onChange={handleChange}>
                    <option value="">Pilih Lokasi Instalasi</option>
                    {instalasiOptions.map((option) => (<option key={option.id} value={option.id}>{option.name}</option>))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label htmlFor="pemberi" style={styles.label}>Diberikan Oleh:</label>
                  <select id="pemberi" name="pemberi" style={styles.select} value={localData.pemberi} onChange={handleChange}>
                    <option value="">Pilih Pemberi</option>
                    {pemberiOptions.map((option) => (<option key={option.id} value={option.id}>{option.name}</option>))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label htmlFor="penerima" style={styles.label}>Diterima Oleh:</label>
                  <select id="penerima" name="penerima" style={styles.select} value={localData.penerima} onChange={handleChange}>
                    <option value="">Pilih Penerima</option>
                    {penerimaOptions.map((option) => (<option key={option.id} value={option.id}>{option.name}</option>))}
                  </select>
                </div>
              </>
            )}
            <div style={styles.formGroup}>
              <button type="submit" disabled={!isFormValid()} style={isFormValid() ? styles.buttonActive : styles.buttonInactive}>➜</button>
            </div>
          </>
        )}
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
  input: {
    width: '90%',
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
