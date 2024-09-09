import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';
import StepFour from './StepFour';
import logo from './assets/logo.png';
import { useState, useEffect } from 'react';

const AbsensiForm = () => {
  const [step, setStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [formData, setFormData] = useState({form: '', nama: '', tugas: '', divisi: '', lokasi: '', endTime: null, startTime: null});

  const handleChoice = (choice) => {
    const updatedFormData = { ...formData, form: choice };
    setFormData(updatedFormData);
    localStorage.setItem('formData', JSON.stringify(updatedFormData));
    setStep(1);
  };

  const handleReset = () => {
    setStep(0);
    setIsCompleted(false);
    const resetData = {form: '', nama: '', tugas: '', divisi: '', lokasi: '', endTime: null, startTime: null};
    setFormData(resetData);
    localStorage.removeItem('formData');
  };

  const handleNextStepData = (newData) => {
    const updatedData = { ...formData, ...newData };
    setFormData(updatedData);
    if (step === 4) {
      setIsCompleted(true);
    } else if (step < 4) {
      setStep(step + 1);
    }
  };

  useEffect(() => {
    const storedData = localStorage.getItem('formData');
    if (storedData) {setFormData(JSON.parse(storedData))}
  }, []);

  const renderStep = () => {
    if (isCompleted) {
      return (
        <div style={styles.completeMessageContainer}>
          <h1 style={styles.completeMessage}>DATA BERHASIL DI SIMPAN</h1>
          <button style={styles.resetButton} onClick={handleReset}>KEMBALI</button>
        </div>
      );
    }
    switch (step) {
      case 0:
        return (
          <div style={styles.formGroup}>
            <div style={styles.buttonContainer}>
              <button style={styles.button} onClick={() => handleChoice('Absensi')}>ABSEN</button>
              <button style={styles.button} onClick={() => handleChoice('Lembur')}>LEMBUR</button>
            </div>
          </div>
        );
      case 1:
        return <StepOne setStep={setStep} formData={formData} handleNextStepData={handleNextStepData} />;
      case 2:
        return <StepTwo formData={formData} handleNextStepData={handleNextStepData} />;
      case 3:
        return <StepThree formData={formData} handleNextStepData={handleNextStepData} />;
      case 4:
        return <StepFour formData={formData} handleNextStepData={handleNextStepData} />;
      default:
        return <h1 style={styles.completeMessage}>DATA BERHASIL DI SIMPAN</h1>;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        {!isCompleted && <img src={logo} alt="Company Logo" style={styles.logo}/>}
        {renderStep()}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1C',
  },
  formContainer: {
    width: '85%',
    padding: '20px',
    maxWidth: '500px',
    borderRadius: '10px',
    backgroundColor: '#ffffff',
    border: '2px solid #1C1C1C',
  },
  logo: {
    width: '300px',
    margin: '0 auto',
    display: 'block',
    marginBottom: '20px',
  },
  completeMessageContainer: {
    textAlign: 'center',
  },
  completeMessage: {
    padding: '10px',
    color: '#3d6c63',
    fontSize: '1.2rem',
    marginTop: '-10px',
    fontWeight: 'bold',
    borderRadius: '10px',
    marginBottom: '10px',
  },
  resetButton: {
    padding: '10px',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    borderRadius: '10px',
    marginBottom: '-10px',
    backgroundColor: '#3d6c63',
    border: '2px solid #1C1C1C',
  },
  formGroup: {
    marginBottom: '10px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  button: {
    color: '#fff',
    width: '48%',
    padding: '15px',
    cursor: 'pointer',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    borderRadius: '10px',
    marginBottom: '-10px',
    border: '2px solid #000',
    backgroundColor: '#326058',
  },
};

export default AbsensiForm;
