import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faHome, faBell, faUser, faCalendarCheck, faClock } from "@fortawesome/free-solid-svg-icons";

const Home = ({ onLogout }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  const handleLogout = () => {
    const isConfirmed = window.confirm("Apakah Anda yakin ingin logout?");
    if (isConfirmed) {
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
      onLogout();
    }
  };

  const renderStep = () => {
    return (
      <div style={styles.buttonGrid}>
        <ActionButton icon={faCalendarCheck} label="Absensi" onClick={() => navigate("/absensi")} />
        <ActionButton icon={faClock} label="Overtime" onClick={() => navigate("/overtime")} />
        <ActionButton icon={faSignOutAlt} label="Log Out" onClick={handleLogout} />
      </div>
    );
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {setUsername(storedUsername)}
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.topContainer}>
        <div style={styles.greeting}>
          <h2 style={styles.greetingText}>Halo, {username || "User"}</h2>
        </div>
      </div>
      <div style={styles.formContainer}>{renderStep()}</div>
      <div style={styles.bottomContainer}>
        <IconButton icon={faHome} label="Home" onClick={() => navigate("/home")} />
        <IconButton icon={faBell} label="Notification" onClick={() => navigate("/notification")} />
        <IconButton icon={faUser} label="Profile" onClick={() => navigate("/profile")} />
      </div>
    </div>
  );
};

const ActionButton = ({ icon, label, onClick }) => (
  <button onClick={onClick} aria-label={label} style={styles.button}>
    <div style={styles.buttonContent}>
      <FontAwesomeIcon icon={icon} style={styles.icon} />
      <span style={styles.buttonText}>{label}</span>
    </div>
  </button>
);

const IconButton = ({ icon, label, onClick }) => (
  <button style={styles.iconButton} onClick={onClick} aria-label={label}>
    <FontAwesomeIcon icon={icon} style={styles.icon} />
    <span style={styles.iconText}>{label}</span>
  </button>
);

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    flexDirection: "column",
    fontFamily: "'Open Sans', sans-serif",
  },
  topContainer: {
    flex: 1,
    padding: "20px",
    backgroundColor: "#26413c",
    borderBottom: "2px solid #e0e0e0",
    borderRadius: "0",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
  },
  greeting: {
    marginBottom: "10px",
  },
  greetingText: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  formContainer: {
    flex: 3,
    padding: "20px",
    backgroundColor: "#fff",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    marginBottom: "10px",
    borderRadius: "0",
  },
  buttonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
  },
  button: {
    padding: "15px",
    backgroundColor: "#26413c",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomContainer: {
    display: "flex",
    justifyContent: "space-around",
    padding: "10px",
    backgroundColor: "#26413c",
    boxShadow: "0 -2px 4px rgba(0, 0, 0, 0.1)",
    borderRadius: "0",
  },
  iconButton: {
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  icon: {
    fontSize: "24px",
    color: "#fff",
  },
  buttonContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  buttonText: {
    marginTop: "5px",
    fontSize: "14px",
    textAlign: "center",
  },
  iconText: {
    fontSize: "12px",
    color: "#fff",
  },
};

export default Home;
