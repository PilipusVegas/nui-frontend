import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import logo from "../assets/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faUser, faLock } from "@fortawesome/free-solid-svg-icons";
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
        localStorage.setItem("roleId", dataUser.id_role);
        localStorage.setItem("isLoggedIn", "true");
        onLoginSuccess();
        Swal.fire({ icon: "success",title: "Login Berhasil!", text: "Selamat Datang!",})
        .then(() => {
          navigate("/home");
        });
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

  return (
    <div style={styles.container}>
      <img src={logo} alt="Logo" style={styles.logo} />
      <div style={styles.inputContainer}>
        <FontAwesomeIcon icon={faUser} style={styles.iconLeft} />
        <input
          type="text"
          value={username}
          style={styles.input}
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div style={styles.inputContainer}>
        <FontAwesomeIcon icon={faLock} style={styles.iconLeft} />
        <input
          value={password}
          style={styles.input}
          placeholder="Password"
          type={showPassword ? "text" : "password"}
          onChange={(e) => setPassword(e.target.value)}
        />
        <FontAwesomeIcon
          icon={showPassword ? faEyeSlash : faEye}
          onClick={togglePasswordVisibility}
          style={styles.iconRight}
        />
      </div>
      <button onClick={handleLogin} style={styles.button}>
        LOGIN
      </button>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    padding: "0 20px",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "#f4f4f4",
  },
  logo: {
    width: "100px",
    marginBottom: "20px",
  },
  inputContainer: {
    width: "100%",
    margin: "10px 0",
    maxWidth: "280px",
    position: "relative",
  },
  input: {
    width: "100%",
    outline: "none",
    padding: "10px",
    fontSize: "1rem",
    paddingLeft: "35px",
    borderRadius: "5px",
    paddingRight: "40px",
    boxSizing: "border-box",
    border: "1px solid #ccc",
    transition: "border-color 0.3s ease",
  },
  iconLeft: {
    position: "absolute",
    top: "50%",
    left: "10px",
    color: "#999",
    fontSize: "1.2rem",
    transform: "translateY(-50%)",
  },
  iconRight: {
    position: "absolute",
    top: "50%",
    right: "10px",
    color: "#999",
    cursor: "pointer",
    fontSize: "1.2rem",
    transform: "translateY(-50%)",
  },
  button: {
    color: "#fff",
    width: "100%",
    border: "none",
    padding: "10px",
    fontSize: "1rem",
    cursor: "pointer",
    maxWidth: "280px",
    marginTop: "20px",
    borderRadius: "5px",
    backgroundColor: "#326058",
    transition: "background-color 0.3s ease",
  },
  error: {
    color: "red",
    marginTop: "10px",
    textAlign: "center",
  },
};

export default Login;
