import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faHome, faBell, faUser, faCalendarCheck, faClock } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

import AbsensiStepOne from './absensi/StepOne';
import AbsensiStepTwo from './absensi/StepTwo';
import AbsensiStepThree from './absensi/StepThree';

import OvertimeStepOne from './overtime/StepOne';
import OvertimeStepTwo from './overtime/StepTwo';
import OvertimeStepThree from './overtime/StepThree';

const FormNicoUrbanIndonesia = ({ onLogout, menu }) => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [formType, setFormType] = useState('');
  const [username, setUsername] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [formData, setFormData] = useState({ form: '', userId: '', username: '', id_absen: '' });

  const handleLogout = () => {
    const isConfirmed = window.confirm("Apakah Anda yakin ingin logout?");
    if (isConfirmed) {
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      onLogout();
    }
  };

  const handleReset = () => {
    setStep(0);
    setFormType('');
    setIsCompleted(false);
    const resetData = { userId: '', username: '', form: '', id_absen: '' };
    setFormData(resetData);
    localStorage.removeItem('formData');
  };

  const handleNextStepData = (newData) => {
    const updatedData = { ...formData, ...newData };
    setFormData(updatedData);
    if ((formType === 'Absensi' || formType === 'Overtime') && step === 2) {
      setIsCompleted(true);
    } else if (step < 2) {
      setStep(step + 1);
    }
  };

  const handleChoice = async (choice) => {
    const updatedFormData = { ...formData, form: choice, username };
    setFormType(choice);
    setFormData(updatedFormData);
    localStorage.setItem('formData', JSON.stringify(updatedFormData));
  
    if (choice === 'Absensi') {
      try {
        const userId = localStorage.getItem('userId');
        const response = await fetch(`${apiUrl}/absen/cek/${userId}`);
        if (!response.ok) { throw new Error('Network response was not ok'); }
        const result = await response.json();
        if (Array.isArray(result) && result.length > 0) {
          const { id_absen } = result[0];
          const newFormData = { ...updatedFormData, id_absen };
          setFormData(newFormData);
          localStorage.setItem('formData', JSON.stringify(newFormData));
          setStep(1);
        } else {
          setStep(0);
        }
      } catch (error) {
        console.error('Error fetching absensi data:', error);
      }
    } else if (choice === 'Overtime') {
      try {
        const userId = localStorage.getItem('userId');
        const response = await fetch(`${apiUrl}/lembur/cek/${userId}`);
        if (!response.ok) { throw new Error('Network response was not ok'); }
        const result = await response.json();
        if (Array.isArray(result) && result.length > 0) {
          const { id_lembur } = result[0];
          const newFormData = { ...updatedFormData, id_lembur };
          setFormData(newFormData);
          localStorage.setItem('formData', JSON.stringify(newFormData));
          setStep(1);
        } else {
          setStep(0);
        }
      } catch (error) {
        console.error('Error fetching overtime data:', error);
      }
    }
  };  

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
          return <AbsensiStepTwo formData={formData} handleNextStepData={handleNextStepData} />;
        case 2:
          return <AbsensiStepThree formData={formData} handleNextStepData={handleNextStepData} />;
        default:
          return <AbsensiStepOne setStep={setStep} formData={formData} handleNextStepData={handleNextStepData} />;
      }
    } else if (formType === 'Overtime') {
      switch (step) {
        case 1:
          return <OvertimeStepTwo formData={formData} handleNextStepData={handleNextStepData} />;
        case 2:
          return <OvertimeStepThree formData={formData} handleNextStepData={handleNextStepData} />;
        default:
          return <OvertimeStepOne setStep={setStep} formData={formData} handleNextStepData={handleNextStepData} />;
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
            <button style={styles.button} onClick={() => handleChoice('Overtime')}>
              <div style={styles.buttonContent}>
                <FontAwesomeIcon icon={faClock} style={styles.icon} />
                <span style={styles.buttonText}>Overtime</span>
              </div>
            </button>
            <button style={styles.button} onClick={handleLogout}>
              <div style={styles.buttonContent}>
                <FontAwesomeIcon icon={faSignOutAlt} style={styles.icon} />
                <span style={styles.buttonText}>Log Out</span>
              </div>
            </button>
          </div>
        </div>
      );
    }
  };

  useEffect(() => {
    const storedData = localStorage.getItem('formData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setFormData(parsedData);
    }
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
      setFormData(prevData => ({ ...prevData, username: storedUsername }));
    }
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setFormData(prevData => ({ ...prevData, userId: storedUserId }));
    }
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.topContainer}>
        <div style={styles.greeting}>
          <h2 style={styles.greetingText}>Halo, {username || 'User'}</h2>
        </div>
      </div>
      <div style={styles.formContainer}>{renderStep()}</div>
      <div style={styles.bottomContainer}>
        <button style={styles.iconButton}>
          <FontAwesomeIcon onClick={() => navigate('/home')} icon={faHome} style={styles.icon} />
          <span style={styles.iconText}>Home</span>
        </button>
        <button style={styles.iconButton}>
          <FontAwesomeIcon onClick={() => navigate('/notification')} icon={faBell} style={styles.icon} />
          <span style={styles.iconText}>Notification</span>
        </button>
        <button style={styles.iconButton}>
          <FontAwesomeIcon onClick={() => navigate('/profile')} icon={faUser} style={styles.icon} />
          <span style={styles.iconText}>Profile</span>
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
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
  greeting: {
    color: '#ffffff',
    fontSize: '1.2rem',
    marginLeft: '20px',
  },
  greetingText: {
    margin: 0,
    fontWeight: 'bold',
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
