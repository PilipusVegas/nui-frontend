import Login from './login';
import { useState } from 'react';
import FormNicoUrbanIndonesia from './formNicoUrbanIndonesia';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {setIsLoggedIn(true)};

  return (
    <div className="App">
      {isLoggedIn ? (
        <FormNicoUrbanIndonesia />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
