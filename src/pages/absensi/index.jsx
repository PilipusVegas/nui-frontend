import { useState, useEffect } from "react";

import StepOne from './StepOne';
import StepTwoMulai from './StepTwoMulai';
import StepTwoSelesai from './StepTwoSelesai';
import StepThree from './StepThree';

const Absensi = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const [currentStep, setCurrentStep] = useState('stepOne');
  const [isSelesaiFlow, setIsSelesaiFlow] = useState(false);
  const [attendanceData, setAttendanceData] = useState({ userId: "", username: "", id_absen: "" });

  const handleNextStepData = (data) => {
    setAttendanceData(prev => ({ ...prev, ...data }));
    handleNextStep();
  };

  const handleNextStep = () => {
    if (isSelesaiFlow) {
      const stepsSelesaiFlow = ['stepTwoSelesai', 'stepThree'];
      const currentIndex = stepsSelesaiFlow.indexOf(currentStep);
      if (currentIndex >= 0 && currentIndex < stepsSelesaiFlow.length - 1) {setCurrentStep(stepsSelesaiFlow[currentIndex + 1])}
    } else {
      const stepsNormalFlow = ['stepOne', 'stepTwoMulai', 'stepThree'];
      const currentIndex = stepsNormalFlow.indexOf(currentStep);
      if (currentIndex >= 0 && currentIndex < stepsNormalFlow.length - 1) {setCurrentStep(stepsNormalFlow[currentIndex + 1])}
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'stepOne':
        return <StepOne userId={attendanceData.userId} username={attendanceData.username} attendanceData={attendanceData} handleNextStepData={handleNextStepData} />;
      case 'stepTwoMulai':
        return <StepTwoMulai attendanceData={attendanceData} handleNextStepData={handleNextStepData} />;
      case 'stepThree':
        return <StepThree formData={attendanceData} />;
      case 'stepTwoSelesai':
        return <StepTwoSelesai attendanceData={attendanceData} handleNextStepData={handleNextStepData} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedUsername = localStorage.getItem("username");
    if (storedUserId) {
      setAttendanceData({ userId: storedUserId, username: storedUsername || "" });
      const checkAttendance = async () => {
        try {
          const response = await fetch(`${apiUrl}/absen/cek/${storedUserId}`);
          const data = await response.json();
          if (response.ok) {
            if (Array.isArray(data) && data.length > 0) {
              const { id_absen } = data[0];
              setAttendanceData(prev => ({ ...prev, id_absen }));
              setIsSelesaiFlow(true);
              setCurrentStep('stepTwoSelesai');
            } else {
              setIsSelesaiFlow(false);
              setCurrentStep('stepOne');
            }
          } else {
            setIsSelesaiFlow(false);
            setCurrentStep('stepOne');
          }
        } catch (error) {
          setIsSelesaiFlow(false);
          setCurrentStep('stepOne');
        }
      };      
      checkAttendance();
    } else {
      setIsSelesaiFlow(false);
      setCurrentStep('stepOne');
    }
  }, [apiUrl]);

  return (
    <div>
      {renderStep()}
    </div>
  );
};

export default Absensi;
