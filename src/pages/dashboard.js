import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import HomeMobile from "../layouts/homeMobile";
import HomeDesktop from "../layouts/homeDesktop";

const Home = ({ onLogout }) => {
  const navigate = useNavigate();
  const username = localStorage.getItem("nama");
  const roleId = localStorage.getItem("roleId");

  const handleLogout = () => {
    const isConfirmed = window.confirm("Apakah Anda yakin ingin logout?");
    if (isConfirmed) {
      onLogout();
    }
  };

  const GetNamaDivisi = (id) => {
    let role = "";
    switch (id) {
      case "1":
        role = "Admin";
        break;
      case "2":
        role = "IT";
        break;
      case "3":
        role = "Teknisi";
        break;
      case "4":
        role = "HRD";
        break;
      case "5":
        role = "PA";
        break;
      default:
        role = "Divisi Tidak Diketahui";
    }
    return <span className="bg-yellow-500 px-3 py-0 rounded-full text-xs text-primary font-bold">{role}</span>;
  };

  const renderViewBasedOnRole = () => {
    if (roleId === "4" || roleId === "5") {   
      return (
        <HomeDesktop username={username} roleId={roleId} GetNamaDivisi={GetNamaDivisi} handleLogout={handleLogout} />
      );
    } else {
      return (
        <HomeMobile username={username} roleId={roleId} handleLogout={handleLogout} GetNamaDivisi={GetNamaDivisi} 
        />
      );
    }
};


  return <div>{renderViewBasedOnRole()}</div>;
};

export default Home;
