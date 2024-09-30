import { useState, useEffect } from "react";
import StepOne from './lemburStepOne';
import StepTwo from './lemburStepTwo';

const Lembur = () => {
  const [currentStep, setCurrentStep] = useState('stepOne');
  const [lemburData, setLemburData] = useState({ userId: "", username: "", tugas: "", lokasi: "", tanggal: "", jamMulai: "", jamSelesai: "" });

  const handleNextStep = () => {
    if (currentStep === 'stepOne') {setCurrentStep('stepTwo')}
  };

  const handleNextStepData = (data) => {
    setLemburData(prev => ({ ...prev, ...data }));
    handleNextStep();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'stepOne':
        return <StepOne handleNextStepData={handleNextStepData} />;
      case 'stepTwo':
        return <StepTwo lemburData={lemburData} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedUsername = localStorage.getItem("userName");
  }, [lemburData]);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedUsername = localStorage.getItem("userName");
    if (storedUserId) {
      setLemburData(prev => ({...prev, userId: storedUserId, username: storedUsername || ""}));
      setCurrentStep('stepOne');
    } else {
      setCurrentStep('stepOne');
    }
  }, []);

  return (
    <div>
      {renderStep()}
    </div>
  );
};

export default Lembur;
