import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/login';
import FormNicoUrbanIndonesia from './pages/formNicoUrbanIndonesia';
import Notification from './pages/notification';
import Absensi from './pages/absensi';
import NotificationDetail from './pages/notification/notificationDetail';
import Profile from './pages/profile';
import Menu from './pages/menu';
import { useEffect, useState } from 'react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedInStatus);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const PrivateRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
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
          path="/notification-detail/:id"
          element={
            <PrivateRoute>
              <NotificationDetail />
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
        <Route 
          path="/absensi" 
          element={
            <PrivateRoute>
              <Absensi />
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
