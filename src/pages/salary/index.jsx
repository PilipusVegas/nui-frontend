import { useState } from "react";

import StepOne from './StepOne';
import StepTwo from './StepTwo';  
import StepThree from './StepThree';
import StepFour from './StepFour';  

const Salary = () => {
  const [currentStep, setCurrentStep] = useState('stepOne');
  const [salaryData, setSalaryData] = useState({ 
    userId: "", 
    username: "", 
    salaryId: "",
    // Initialize properties for step two
    number1: '',
    number2: '',
    number3: '',
    number4: '',
    number5: '',
    number6: '',
    number7: '',
    number8: ''
  });

  const handleNextStepData = (data) => {
    setSalaryData(prev => ({ ...prev, ...data }));
    handleNextStep();
  };

  const handleNextStep = () => {
    const steps = ['stepOne', 'stepTwo', 'stepThree', 'stepFour'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex >= 0 && currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'stepOne':
        return <StepOne userId={salaryData.userId} username={salaryData.username} salaryData={salaryData} handleNextStepData={handleNextStepData} />;
      case 'stepTwo':
        return <StepTwo formData={salaryData} handleNextStepData={handleNextStepData} />;
      case 'stepThree':
        return <StepThree salaryData={salaryData} handleNextStepData={handleNextStepData} />;
      case 'stepFour':
        return <StepFour salaryData={salaryData} />;
      default:
        return null;
    }
  };

  return (
    <div>
      {renderStep()}
    </div>
  );
};

export default Salary;
