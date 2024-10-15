import React from "react";
import { useNavigate } from "react-router-dom";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const DekstopLayout = ({ title, header, body }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1) ? navigate(-1) : navigate('/home');
  };

  return (
    <div className="min-h-screen flex flex-col justify-start p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FontAwesomeIcon
            icon={faArrowLeft}
            title="Back to Home"
            onClick={handleBack}
            className="mr-2 cursor-pointer text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out rounded-full p-3 shadow-lg"
          />
          <h2 className="text-3xl font-bold text-gray-800 pb-1">{title}</h2>
        </div>
        <div className="flex items-center space-x-2"></div>
      </div>

      <div className="rounded-lg shadow-md overflow-hidden">
        <table className="table-auto w-full border-collapse rounded-lg">
          <thead>
            <tr className="bg-green-500 text-white">{header}</tr>
          </thead>
          <tbody>
            {body.length > 0 ? (
              body 
            ) : (
              <tr>
                <td colSpan={6} className="text-center px-4 py-2">
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DekstopLayout;



//SAMPLE PEMAKAIAN DATA LAYOUT

{/* <DekstopLayout
  title="Data Absensi"
  header={header}
  body={absenData.map((absen, index) => (
    <tr key={absen.id_user} className="border-t hover:bg-gray-50 transition-colors duration-150">
      <td className="text-center px-4 py-2">{index + 1}</td>
      <td className="text-center px-4 py-2">{absen.nama_user}</td>
      <td className="text-center px-4 py-2">{absen.divisi}</td>
      <td className="text-center px-4 py-2">{absen.total_absen} Hari</td>
      <td className="text-center text-red-600 font-bold px-4 py-2">{absen.unapproved} Unapproved</td>
      <td className="text-center px-4 py-2">
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-150">
          Detail
        </button>
      </td>
    </tr>
  ))}
/> */}
