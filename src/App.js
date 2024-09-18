import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/login';
import FormNicoUrbanIndonesia from './pages/formNicoUrbanIndonesia';
import Notification from './pages/notification';
import Profile from './pages/profile';
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
          path="/login"
          element={<Login onLoginSuccess={handleLoginSuccess} />}
        />
        <Route
          path="/home"
          element={<PrivateRoute element={<FormNicoUrbanIndonesia onLogout={handleLogout} />} />}
        />
        <Route
          path="/notification"
          element={<PrivateRoute element={<Notification />} />}
        />
        <Route
          path="/profile"
          element={<PrivateRoute element={<Profile />} />}
        />
        <Route path="*" element={isLoggedIn ? <Navigate to="/home" /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
