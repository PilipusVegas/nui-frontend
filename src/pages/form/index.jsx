import React from 'react';
import { useNavigate } from 'react-router-dom';

const ListItem = ({ title, link, description }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(link);
  };

  return (
    <div onClick={handleNavigate} className="group relative cursor-pointer w-full rounded-2xl border hover:border-[#2e4d46] bg-white/90 backdrop-blur-md p-5 transition-all duration-300 hover:border-green-600 hover:shadow-xl hover:scale-[1.02]">
    <div className="space-y-2">
      <h3 className="text-lg sm:text-xl font-semibold text-[#1f2f2b] group-hover:text-[#2e4d46] transition-colors duration-300">
        {title}
      </h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>

    <div className="pt-6 flex justify-end">
      <button onClick={(e) => { e.stopPropagation(); navigate(link);}} className="px-4 py-2 bg-[#2e4d46] text-white text-sm font-medium rounded-md shadow-md hover:bg-green-700 hover:shadow-lg transition duration-300">
        Isi Formulir
      </button>
    </div>
  </div>
  );
};

const FormList = () => {
  return (
    <div className="min-h-screen bg-[#326058] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg px-7 py-10 space-y-10 bg-white shadow-xl border rounded-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-wider text-gray-600">
            PT Nico Urban Indonesia
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Formulir Pengajuan
          </h2>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-6">
          <ListItem title="Form Dinas Keluar Kantor" link="/form-dinas" description="Isi form ini untuk keperluan dinas luar kantor."/>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <a href="/login" className="text-sm text-gray-600  transition">
            Sudah punya akun? <span className="font-medium hover:text-green-600">Login</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default FormList;
