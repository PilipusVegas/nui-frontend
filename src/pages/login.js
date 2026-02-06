import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { getUserFromToken } from "../utils/jwtHelper";
import { getLockedUserId, lockDeviceToUser } from "../utils/deviceLock";


const Login = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const user = getUserFromToken();
  if (user) {
    return <Navigate to="/home" replace />;
  }
  const EXCLUDED_DEVICE_LOCK_ROLES = [1, 4, 5, 6, 20];


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok || !data.token) {
        toast.error(data?.message || "Username atau password salah.");
        return;
      }
      // simpan token dulu untuk decode
      localStorage.setItem("token", data.token);
      const user = getUserFromToken();
      if (!user || !user.id_user) {
        toast.error("Sesi tidak valid. Silakan login ulang.");
        localStorage.removeItem("token");
        return;
      }
      const lockedUserId = getLockedUserId();
      const isExcludedRole = EXCLUDED_DEVICE_LOCK_ROLES.includes(user.id_role);

      // 🔐 DEVICE LOCK CHECK (kecuali role tertentu)
      if (!isExcludedRole) {
        if (lockedUserId && String(lockedUserId) !== String(user.id_user)) {
          localStorage.removeItem("token");
          toast.error(
            "Login ditolak. Anda tidak bisa login menggunakan akun lain di perangkat ini, silahkan gunakan akun anda pribadi."
          );
          return;
        }

        // jika belum ada lock → kunci device
        if (!lockedUserId) {
          lockDeviceToUser(user.id_user);
        }
      }

      toast.success("Login berhasil! Selamat bekerja.");
      navigate("/home", { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Gagal menghubungi server. Silakan coba beberapa saat lagi.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen px-5 font-poppins" style={{ backgroundImage: "url('/wall.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundAttachment: "fixed", backgroundBlendMode: "overlay", backgroundColor: "rgba(0, 0, 0, 0.25)", }}>
      <div className="w-full max-w-sm px-7 py-8 bg-white/90 rounded-xl shadow-2xl backdrop-blur-sm relative">
        <img src={logo} alt="Logo" className="w-16 mx-auto mb-2 drop-shadow-md" />
        <h5 className="text-xl font-bold tracking-wider text-[#326058] text-center mb-6">
          PT Nico Urban Indonesia
        </h5>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Username */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
            <div className="relative">
              <FontAwesomeIcon icon={faUser} className="absolute left-4 top-3.5 text-green-700 text-sm" />
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Masukkan Username" required className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-green-600  focus:outline-none focus:ring-2 focus:ring-green-700  placeholder:text-gray-500 placeholder:font-semibold  transition duration-200 shadow-sm focus:shadow-md" />
            </div>
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <FontAwesomeIcon icon={faLock} className="absolute left-4 top-3.5 text-green-700 text-sm" />
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan Password" required className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-green-600  focus:outline-none focus:ring-2 focus:ring-green-700  placeholder:text-gray-500 placeholder:font-semibold  transition duration-200 shadow-sm focus:shadow-md" />
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} onClick={togglePasswordVisibility} className="absolute right-3 top-3.5 text-green-700 text-md cursor-pointer hover:scale-110 transition-transform" />
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className={`w-full mt-6 py-2.5 font-bold text-white rounded-lg shadow-md transition-all duration-300  ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-[#326058] to-green-700 hover:brightness-110"}`}>
            {loading ? "Loading..." : "Login"}
          </button>
        </form>

        <div className="pt-6 text-[11px] text-center text-gray-600">
          © {new Date().getFullYear()} <b>PT Nico Urban Indonesia</b>. All rights reserved.<br />
          Solusi Efisien Untuk Pencatatan dan Manajemen Kehadiran Karyawan.
        </div>
      </div>
    </div>
  );
};

export default Login;