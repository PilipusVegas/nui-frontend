import React from 'react';
import { useNavigate } from 'react-router-dom';

const MobileLayout = ({ title, children }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1) ? navigate(-1) : navigate('/home');
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <header className="flex items-center justify-between p-3 bg-green-700 text-white shadow-md">
        <button onClick={handleBack} className="text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold">{title}</h1>
        <div className="w-6"></div>
      </header>
      <main className="flex-grow p-3 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default MobileLayout;
