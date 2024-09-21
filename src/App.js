import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/login';
import FormNicoUrbanIndonesia from './pages/formNicoUrbanIndonesia';
import Notification from './pages/notification';
import Profile from './pages/profile';
import Menu from './pages/menu';
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
  const PrivateRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        {/* Cek jika sudah login, redirect ke home */}
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/home" /> : <Login onLoginSuccess={handleLoginSuccess} />}
        />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <FormNicoUrbanIndonesia onLogout={handleLogout} />
            </PrivateRoute>
          }
        />
        <Route
          path="/notification"
          element={
            <PrivateRoute>
              <Notification />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/menu"
          element={
            <PrivateRoute>
              <Menu />
            </PrivateRoute>
          }
        />
        {/* Redirect ke home atau login sesuai status login */}
        <Route path="*" element={isLoggedIn ? <Navigate to="/home" /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
