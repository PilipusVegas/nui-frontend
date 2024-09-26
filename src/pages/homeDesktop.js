import React, { useState, useEffect } from "react";
import MenuSidebar from "./menuSidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

const HomeDesktop = ({ username, handleLogout, roleId, GetNamaDivisi }) => {
  const [localTime, setLocalTime] = useState("");
  const [employees, setEmployees] = useState([]); // Menyimpan data karyawan

  const updateLocalTime = () => {
    const time = new Date().toLocaleString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    setLocalTime(time);
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch("http://192.168.130.42:3002/profil/");
      const result = await response.json();
      setEmployees(result.data); 
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    updateLocalTime();
    const intervalId = setInterval(updateLocalTime, 1000);
    fetchEmployees();
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="desktop-layout flex min-h-screen bg-gray-100">
      <MenuSidebar handleLogout={handleLogout} />
      <div className="flex-1 px-8 bg-white shadow-lg rounded-lg transition-all duration-300 ease-in-out">
        <div className="mt-6 p-8 bg-gradient-to-br from-green-700 via-green-700 to-green-700 text-white rounded-lg shadow-md relative">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold">Selamat Datang,</h2>
            <h3 className="text-4xl font-extrabold">{username || "User"}</h3>
            <p className="text-gray-200 text-lg mt-2">{localTime}</p>
          </div>
          <div className="absolute top-10 right-8 text-white text-l px-2 py-1 font-bold rounded-lg bg-opacity-30">
            {GetNamaDivisi(roleId)} • Kantor Palem  
          </div>
        </div>

        {/* Tiga kotak hijau di bawah */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          {[
            { label: "Total Karyawan", value: employees.length },
          ].map((item, index) => (
            <div
              key={index}
              className="p-4 bg-white rounded-lg shadow-md text-center transition-transform transform hover:scale-15 hover:shadow-xl"
            >
              <h4 className="text-5xl font-bold text-green-600 mb-3">{item.value}</h4>
              <p className="text-xl font-semibold text-gray-700">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <p className="text-gray-600">Ini adalah konten utama dari dashboard Anda.</p>
        </div>
      </div>
    </div>
  );
};

export default HomeDesktop;