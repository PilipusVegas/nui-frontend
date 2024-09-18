import React from 'react';

const labels = [
  'Gaji Pokok',
  'Tunjangan Transport',
  'Tunjangan Jabatan',
  'Tunjangan Kehadiran',
  'Upah Lemburan',
  'Upah Uang Makan Lembur',
  'Tunjangan Posisi Proyek',
  'Kinerja Performance'
];

const StepTwo = ({ formData, handleNextStepData }) => {
  const isFormValid = () => numbers.every(num => num !== '' && !isNaN(num));

  const [numbers, setNumbers] = React.useState(labels.map((_, i) => formData[`number${i + 1}`] || ''));
  const totalPenghasilan = numbers.reduce((acc, num) => acc + (parseInt(num, 10) || 0), 0);

  const formatNumber = (value) => {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };
  
  const formatCurrency = (amount) => {
    return amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };  

  const handleNumberChange = (index, value) => {
    const numericValue = value.replace(/\./g, '').replace(/[^0-9]/g, '');
    const newNumbers = [...numbers];
    newNumbers[index] = numericValue;
    setNumbers(newNumbers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid()) {
      const data = {
        gajiPokok: numbers[0],
        tunjanganTransport: numbers[1],
        tunjanganJabatan: numbers[2],
        tunjanganKehadiran: numbers[3],
        upahLemburan: numbers[4],
        upahUangMakanLembur: numbers[5],
        tunjanganPosisiProyek: numbers[6],
        kinerjaPerformance: numbers[7],
        totalPenghasilan: totalPenghasilan.toString()
      };
      console.log('Data:', data);
      handleNextStepData(data);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        {numbers.map((num, index) => (
          <div key={index} style={styles.formGroup}>
            <label htmlFor={`number${index + 1}`} style={styles.label}>{labels[index]}:</label>
            <input type="text" placeholder="0" style={styles.input} id={`number${index + 1}`} value={formatNumber(num)} name={`number${index + 1}`} onChange={(e) => handleNumberChange(index, e.target.value)}/>
          </div>
        ))}
        <div style={styles.formGroup}>
          <div style={styles.totalContainer}>
            <div style={styles.totalLabel}>Total Penghasilan:</div>
            <div style={styles.totalValue}>{formatCurrency(totalPenghasilan)}</div>
          </div>
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
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '1rem',
    borderRadius: '10px',
    boxSizing: 'border-box',
    border: '2px solid #ccc',
  },
  totalContainer: {
    display: 'flex',
    padding: '12px',
    marginTop: '20px',
    alignItems: 'center',
    borderRadius: '10px',
    border: '2px solid #000',
    backgroundColor: '#e9ecef',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: '1rem',
    fontWeight: 'bold',
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
