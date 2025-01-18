import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faUser,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Swal.fire({
        icon: "error",
        title: "Login Gagal",
        text: "Pastikan username dan password telah diisi dengan benar.",
      });
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.message === "Login berhasil") {
        const dataUser = data.data;
        localStorage.setItem("userId", dataUser.id);
        localStorage.setItem("nama", dataUser.name);
        localStorage.setItem("userName", dataUser.username);
        localStorage.setItem("isLoggedIn", "true");
  
        if (dataUser.id === 16) {
          // Jika id adalah 16, tampilkan dialog untuk memilih role
          Swal.fire({
            title: "Selamat Datang",
            text: "Login sebagai Teknisi atau PA?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Teknisi",
            cancelButtonText: "PA",
            customClass: {
              confirmButton: "btn-confirm",
              cancelButton: "btn-warning",
            },
          }).then((result) => {
            if (result.isConfirmed) {
              // Jika user memilih Teknisi
              localStorage.setItem("roleId", "3");
            } else {
              // Jika user memilih PA
              localStorage.setItem("roleId", "5");
            }
            onLoginSuccess();
            Swal.fire({
              icon: "success",
              title: "Login Berhasil!",
              text: "Selamat Datang!",
            }).then(() => {
              navigate("/home");
            });
          });
        } else {
          // Jika id bukan 16, login seperti biasa
          localStorage.setItem("roleId", dataUser.id_role);
          onLoginSuccess();
          Swal.fire({
            icon: "success",
            title: "Login Berhasil!",
            text: "Selamat Datang!",
          }).then(() => {
            navigate("/home");
          });
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: "Username atau password tidak valid!",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Kesalahan!",
        text: "Terjadi kesalahan saat login. Silakan coba lagi nanti.",
      });
    }
  };
  

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div
      className="flex items-center justify-center h-screen px-7 font-poppins"
      style={{
        backgroundImage: "url('/wall.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        backgroundBlendMode: "overlay",
        backgroundColor: "rgba(0, 0, 0, 0.25)", // Tambahkan warna overlay gelap
      }}
    >
      <div className="w-full max-w-md px-7 py-10 bg-white rounded-lg shadow-lg">
        <img src={logo} alt="Logo" className="w-16 mx-auto mb-2" />
        <h5 className="text-xl font-bold text-[#326058] text-center mb-4 transition-all duration-300 cursor-pointer">
          PT Nico Urban Indonesia
        </h5>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="space-y-2 pt-7 pb-10"
        >
          <label className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <div className="relative">
            <FontAwesomeIcon
              icon={faUser}
              className="absolute top-1/2 left-3 text-gray-500 -translate-y-1/2"
            />
            <input
              type="text"
              value={username}
              className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#326058]"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <FontAwesomeIcon
              icon={faLock}
              className="absolute top-1/2 left-3 text-gray-500 -translate-y-1/2"
            />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#326058]"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <FontAwesomeIcon
              icon={showPassword ? faEyeSlash : faEye}
              onClick={togglePasswordVisibility}
              className="absolute top-1/2 right-3 text-gray-500 cursor-pointer -translate-y-1/2"
            />
          </div>
        </form>
        <button
          type="submit"
          onClick={handleLogin}
          className="w-full py-2 font-bold text-white bg-[#326058] rounded-md hover:bg-green-900 transition-all duration-300"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
