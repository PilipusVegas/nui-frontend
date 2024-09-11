import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faHome, faBell, faUser, faClock, faCalendarCheck, faMoneyBillWave, faSyncAlt } from '@fortawesome/free-solid-svg-icons';

import AbsensiStepOne from './absensi/StepOne';
import AbsensiStepTwo from './absensi/StepTwo';
import AbsensiStepThree from './absensi/StepThree';
import AbsensiStepFour from './absensi/StepFour';

import OvertimeStepOne from './overtime/StepOne';
import OvertimeStepTwo from './overtime/StepTwo';
import OvertimeStepThree from './overtime/StepThree';
import OvertimeStepFour from './overtime/StepFour';

import SalaryStepOne from './salary/StepOne';
import SalaryStepTwo from './salary/StepTwo';
import SalaryStepThree from './salary/StepThree';
import SalaryStepFour from './salary/StepFour';

import UpdateStockStepOne from './updateStock/StepOne';

const FormNicoUrbanIndonesia = ({ onLogout }) => {
  const [step, setStep] = useState(0);
  const [formType, setFormType] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [formData, setFormData] = useState({form: '', nama: '', tugas: '', divisi: '', lokasi: '', endTime: null, startTime: null});

  const handleLogout = () => {onLogout()};

  const handleChoice = (choice) => {
    const updatedFormData = { ...formData, form: choice };
    setFormType(choice);
    setFormData(updatedFormData);
    localStorage.setItem('formData', JSON.stringify(updatedFormData));
    setStep(1);
  };

  const handleReset = () => {
    setStep(0);
    setFormType('');
    setIsCompleted(false);
    const resetData = {form: '', nama: '', tugas: '', divisi: '', lokasi: '', endTime: null, startTime: null};
    setFormData(resetData);
    localStorage.removeItem('formData');
  };

  const handleNextStepData = (newData) => {
    const updatedData = { ...formData, ...newData };
    setFormData(updatedData);
    if ((formType === 'Absensi' && step === 4) || (formType === 'Lembur' && step === 8) || (formType === 'Penggajian' && step === 4)
    ) {
      setIsCompleted(true);
    } else if (step < (formType === 'Absensi' ? 4 : formType === 'Lembur' ? 8 : 4)) {
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
    if (formType === 'Absensi') {
      switch (step) {
        case 1:
          return <AbsensiStepOne setStep={setStep} formData={formData} handleNextStepData={handleNextStepData} />;
        case 2:
          return <AbsensiStepTwo formData={formData} handleNextStepData={handleNextStepData} />;
        case 3:
          return <AbsensiStepThree formData={formData} handleNextStepData={handleNextStepData} />;
        case 4:
          return <AbsensiStepFour formData={formData} handleNextStepData={handleNextStepData} />;
        default:
          return <h1 style={styles.completeMessage}>DATA BERHASIL DI SIMPAN</h1>;
      }
    } else if (formType === 'Lembur') {
      switch (step) {
        case 1:
          return <OvertimeStepOne setStep={setStep} formData={formData} handleNextStepData={handleNextStepData} />;
        case 2:
          return <OvertimeStepTwo formData={formData} handleNextStepData={handleNextStepData} />;
        case 3:
          return <OvertimeStepThree formData={formData} handleNextStepData={handleNextStepData} />;
        case 4:
          return <OvertimeStepFour formData={formData} handleNextStepData={handleNextStepData} />;
        default:
          return <h1 style={styles.completeMessage}>DATA BERHASIL DI SIMPAN</h1>;
      }
    } else if (formType === 'Penggajian') {
      switch (step) {
        case 1:
          return <SalaryStepOne formData={formData} handleNextStepData={handleNextStepData} />;
        case 2:
          return <SalaryStepTwo formData={formData} handleNextStepData={handleNextStepData} />;
        case 3:
          return <SalaryStepThree formData={formData} handleNextStepData={handleNextStepData} />;
        case 4:
          return <SalaryStepFour formData={formData} handleNextStepData={handleNextStepData} />;
        default:
          return <h1 style={styles.completeMessage}>DATA BERHASIL DI SIMPAN</h1>;
      }
    } else if (formType === 'Update Stock') {
      switch (step) {
        case 1:
          return <UpdateStockStepOne formData={formData} handleNextStepData={handleNextStepData} />;
        default:
          return <h1 style={styles.completeMessage}>DATA BERHASIL DI SIMPAN</h1>;
      }
    } else {
      return (
        <div style={styles.formGroup}>
          <div style={styles.buttonContainer}>
            <button style={styles.button} onClick={() => handleChoice('Absensi')}>
              <div style={styles.buttonContent}>
                <FontAwesomeIcon icon={faCalendarCheck} style={styles.icon} />
                <span style={styles.buttonText}>Absensi</span>
              </div>
            </button>
            <button style={styles.button} onClick={() => handleChoice('Lembur')}>
              <div style={styles.buttonContent}>
                <FontAwesomeIcon icon={faClock} style={styles.icon} />
                <span style={styles.buttonText}>Lembur</span>
              </div>
            </button>
            <button style={styles.button} onClick={() => handleChoice('Penggajian')}>
              <div style={styles.buttonContent}>
                <FontAwesomeIcon icon={faMoneyBillWave} style={styles.icon} />
                <span style={styles.buttonText}>Penggajian</span>
              </div>
            </button>
            <button style={styles.button} onClick={() => handleChoice('Update Stock')}>
              <div style={styles.buttonContent}>
                <FontAwesomeIcon icon={faSyncAlt} style={styles.icon} />
                <span style={styles.buttonText}>Update</span>
              </div>
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.topContainer}>
        <FontAwesomeIcon icon={faSignOutAlt} style={styles.iconLogout} onClick={handleLogout} />
      </div>
      <div style={styles.formContainer}>{renderStep()}</div>
      <div style={styles.bottomContainer}>
        <button style={styles.iconButton}>
          <FontAwesomeIcon icon={faHome} style={styles.icon} />
          <span style={styles.iconText}>Home</span>
        </button>
        <button style={styles.iconButton}>
          <FontAwesomeIcon icon={faBell} style={styles.icon} />
          <span style={styles.iconText}>Notification</span>
        </button>
        <button style={styles.iconButton}>
          <FontAwesomeIcon icon={faUser} style={styles.icon} />
          <span style={styles.iconText}>Profile</span>
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    flexDirection: 'column',
    backgroundColor: '#326058',
  },
  topContainer: {
    height: '20%',
    display: 'flex',
    padding: '0 20px',
    position: 'relative',
    alignItems: 'center',
    backgroundColor: '#326058',
    justifyContent: 'space-between',
  },
  logoutButton: {
    border: 'none',
    display: 'flex',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  iconLogout: {
    top: '20px',
    right: '20px',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '1.5rem',
    position: 'absolute',
  },
  logoutText: {
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  formContainer: {
    height: '70%',
    display: 'flex',
    padding: '20px',
    position: 'relative',
    flexDirection: 'column',
    backgroundColor: '#fff',
    borderRadius: '10px 10px 0 0',
  },
  bottomContainer: {
    height: '10%',
    display: 'flex',
    padding: '10px',
    alignItems: 'center',
    backgroundColor: '#26413c',
    justifyContent: 'space-around',
  },
  footerText: {
    color: '#ffffff',
    fontSize: '1rem',
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  button: {
    width: '30%',
    color: '#fff',
    display: 'flex',
    padding: '10px',
    cursor: 'pointer',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    alignItems: 'center',
    borderRadius: '10px',
    marginBottom: '10px',
    flexDirection: 'column',
    border: '2px solid #000',
    justifyContent: 'center',
    backgroundColor: '#326058',
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },
  icon: {
    fontSize: '2rem',
    fontSize: '24px',
  },
  iconText: {
    marginTop: '5px',
    fontSize: '14px',
  },
  buttonText: {
    marginTop: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
  }, 
  iconButton: {
    border: 'none',
    display: 'flex',
    color: '#ffffff',
    background: 'none',
    alignItems: 'center',
    flexDirection: 'column',
  },
};

export default FormNicoUrbanIndonesia;
