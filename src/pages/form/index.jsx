import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeadset, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const ListItem = ({ title, link, description, available = true }) => {
  const isDisabled = !available;

  return (
    <div
      className={`relative w-full rounded-2xl border shadow-sm transition-all duration-300 ${
        isDisabled
          ? 'bg-gray-100 border-gray-200 opacity-70 cursor-default'
          : 'bg-white border-gray-200 hover:shadow-md hover:border-green-500'
      }`}
    >
      {/* Label "Tidak Tersedia" */}
      {isDisabled && (
        <span className="absolute top-3 right-3 bg-gray-300 text-white text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full">
          Tidak Tersedia
        </span>
      )}

      <div className="p-4 sm:p-5 md:p-6 space-y-2 sm:space-y-3">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-xs sm:text-sm text-gray-500">{description}</p>

        {/* Tombol */}
        <div className="pt-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <a
            href={`https://wa.me/phone_number?text=Halo, saya ingin konsultasi mengenai ${title}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm flex items-center gap-2 text-green-700 hover:text-green-600 ${
              isDisabled ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            <FontAwesomeIcon icon={faHeadset} className="text-base" />
            <span>Customer Service</span>
          </a>

          {isDisabled ? (
            <span className="text-sm text-gray-400">Form Belum Tersedia</span>
          ) : (
            <a
              href={link}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-all duration-300 w-fit"
            >
              Isi Formulir
            </a>
          )}
        </div>
      </div>
    </div>
  );
};


const FormList = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center px-4 sm:px-6 md:px-8 py-10">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-lg p-5 sm:p-8 md:p-10 space-y-6">
        <div className="space-y-1">
          <div className="text-[10px] sm:text-xs uppercase text-gray-400 tracking-widest">
            PT Nico Urban Indonesia
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
            Formulir Pengajuan
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <ListItem
            title="Form Dinas Keluar"
            link="/form-dinas"
            description="Isi form ini untuk keperluan dinas luar kantor."
            available={true}
          />
          <ListItem
            title="Form Pengajuan Cuti"
            link="#"
            description="Formulir ini belum tersedia. Harap menunggu informasi selanjutnya."
            available={false}
          />
        </div>

        <div className="pt-4 flex justify-center">
          <a
            href="/login"
            className="inline-flex items-center text-sm sm:text-base md:text-lg rounded-lg transition"
          >
            Sudah punya akun?{' '}
            <span className="text-green-600 font-medium pl-1">Login</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default FormList;
