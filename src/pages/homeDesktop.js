import React, { useState, useEffect } from "react";
import MenuSidebar from "./menuSidebar";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const HomeDesktop = ({ username, handleLogout, roleId, GetNamaDivisi }) => {
  const [localTime, setLocalTime] = useState("");
  const [employees, setEmployees] = useState([]);
  const [displayedEmployees, setDisplayedEmployees] = useState(0);
  const navigate = useNavigate(); // Initialize navigate
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

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
      // Use backticks here for template literals
      const response = await fetch(`${apiUrl}/profil/`);
      const result = await response.json();
      setEmployees(result.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    updateLocalTime();
    const intervalId = setInterval(updateLocalTime, 1000);
    fetchEmployees(); // Fetch employees when component mounts
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (employees.length === 0) return;

    let start = 0;
    const end = employees.length;
    const duration = 1500; // Increase duration for better animation
    const incrementTime = Math.abs(Math.floor(duration / end));

    const timer = setInterval(() => {
      start += 1;
      setDisplayedEmployees(start);
      if (start >= end) clearInterval(timer); // Ensure no extra increments
    }, incrementTime);

    return () => clearInterval(timer); // Clear the timer when component unmounts
  }, [employees]);

  const handleCardClick = () => {
    navigate("/data-karyawan"); // Navigate to the DataKaryawan route
  };

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

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div
            className="p-4 bg-white rounded-lg shadow-md text-center transition-transform transform hover:shadow-xl cursor-pointer"
            onClick={handleCardClick}
          >
            <h4 className="text-5xl font-bold text-green-600 mb-3 transition duration-500 ease-in-out">
              {displayedEmployees}
            </h4>
            <p className="text-xl font-semibold text-gray-700">Total Karyawan</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-gray-600"></p>
        </div>
      </div>
    </div>
  );
};

export default HomeDesktop;
