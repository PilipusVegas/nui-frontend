import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './login';
import FormNicoUrbanIndonesia from './formNicoUrbanIndonesia';
import { useEffect, useState } from 'react';

function App() {
  // Inisialisasi langsung dari localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  // Fungsi logout
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
  };

  // Fungsi login success
  const handleLoginSuccess = () => {
    localStorage.setItem('isLoggedIn', 'true'); // Pastikan disimpan sebagai string 'true'
    setIsLoggedIn(true);
  };

  // PrivateRoute untuk melindungi route yang butuh login
  const PrivateRoute = ({ element }) => {
    return isLoggedIn ? element : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/home"
          element={<PrivateRoute element={<FormNicoUrbanIndonesia onLogout={handleLogout} />} />}
        />
        <Route
          path="/login"
          element={<Login onLoginSuccess={handleLoginSuccess} />}
        />
        <Route path="*" element={isLoggedIn ? <Navigate to="/home" /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
