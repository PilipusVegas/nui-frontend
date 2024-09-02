import StepOne from './StepOne';
import StepTwo from './StepTwo';
import { useState } from 'react';
import StepFour from './StepFour';
import StepThree from './StepThree';
import logo from './assets/logo.png';

const AbsensiForm = () => {
  const [step, setStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [formData, setFormData] = useState({form: '', nama: '', tugas: '', divisi: '', lokasi: '', endTime: null, startTime: null});

  const handleNextStepData = (newData) => {
    setFormData((prevData) => ({ ...prevData, ...newData }));
    if (step === 5) {
      setIsCompleted(true);
    } else if (step < 5) {
      setStep(step + 1);
    }
  };

  const renderStep = () => {
    if (isCompleted) {
      return <h2 style={styles.completeMessage}>SELESAI</h2>;
    }
    switch (step) {
      case 1:
        return <StepOne formData={formData} handleNextStepData={handleNextStepData} />;
      case 2:
        return <StepTwo formData={formData} handleNextStepData={handleNextStepData} />;
      case 3:
        return <StepThree formData={formData} handleNextStepData={handleNextStepData} />;
      case 4:
        return <StepFour formData={formData} handleNextStepData={handleNextStepData} />;
      default:
        return <h2 style={styles.completeMessage}>SELESAI</h2>;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <img src={logo} alt="Company Logo" style={styles.logo} />
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
  completeMessage: {
    fontSize: '1.1rem',
    marginTop: '-10px',
    fontWeight: 'bold',
    textAlign: 'center',
  },
};

export default AbsensiForm;
