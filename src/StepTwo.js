import React from 'react';

const StepTwo = ({ formData, handleNextStepData }) => {
  const [tugas, setTugas] = React.useState(formData.tugas || '');
  const [lokasi, setLokasi] = React.useState(formData.lokasi || '');
  const [charCount, setCharCount] = React.useState(formData.tugas?.length || 0);

  const isFormValid = () => lokasi && tugas;
  const handleLokasiChange = (e) => { setLokasi(e.target.value) };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid()) { handleNextStepData({ tugas, lokasi }) }
  };

  const handleTugasChange = (e) => {
    const value = e.target.value;
    if (value.length <= 250) { setTugas(value); setCharCount(value.length) }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form} aria-required="true">
        <div style={styles.formGroup}>
          <label htmlFor="lokasi" style={styles.label}>Lokasi:</label>
          <select id="lokasi" name="lokasi" value={lokasi} style={styles.select} onChange={handleLokasiChange}>
            <option value="">Pilih Lokasi</option>
            <option value="Kantor Palem">Kantor Palem</option>
            <option value="KFC MAXX Karawaci">KFC MAXX Karawaci</option>
            <option value="KFC Tanjung Duren">KFC Tanjung Duren</option>
            <option value="KFC Jalan Panjang">KFC Jalan Panjang</option>
            <option value="KFC Cideng">KFC Cideng</option>
            <option value="KFC Cempaka Putih">KFC Cempaka Putih</option>
            <option value="KFC Basmar Plaza">KFC Basmar Plaza</option>
            <option value="KFC Kemang">KFC Kemang</option>
            <option value="KFC Ciledug Pertukangan">KFC Ciledug Pertukangan</option>
            <option value="KFC Balai Pustaka Rawamangun">KFC Balai Pustaka Rawamangun</option>
            <option value="KFC Taman Harapan Indah">KFC Taman Harapan Indah</option>
            <option value="KFC Juanda">KFC Juanda</option>
            <option value="KFC Alamanda Karang Satria">KFC Alamanda Karang Satria</option>
            <option value="KFC Citralake Sawangan">KFC Citralake Sawangan</option>
            <option value="KFC Meruyung">KFC Meruyung</option>
            <option value="KFC Mayor Oking">KFC Mayor Oking</option>
          </select>
        </div>
        <div style={styles.formGroup}>
          <div style={styles.taskContainer}>
            <label htmlFor="tugas" style={styles.label}>Tugas yang diberikan:</label>
            <div style={styles.charCount}>{charCount} / 250</div>
          </div>
          <textarea required rows="4" id="tugas" name="tugas" value={tugas} style={styles.textarea} onChange={handleTugasChange} />
        </div>
        <div style={styles.formGroup}>
          <button type="submit" disabled={!isFormValid()} style={isFormValid() ? styles.buttonActive : styles.buttonInactive}>➜</button>
        </div>
      </form>
    </div>
  );
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
  taskContainer: {
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

export default StepTwo;
