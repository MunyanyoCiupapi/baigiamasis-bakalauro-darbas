import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import GuestRoute from './components/GuestRoute';
import ProtectedRoute from './components/ProtectedRoute';
import ArtistRoute from './components/ArtistRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreateAssetPage from './pages/CreateAssetPage';

function App() {
  return (
    <div className="app-shell">
      <div className="background-blur blur-1"></div>
      <div className="background-blur blur-2"></div>

      <Navbar />

      <main className="page-container">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/upload"
            element={
              <ArtistRoute>
                <CreateAssetPage />
              </ArtistRoute>
            }
          />

          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />

          <Route
            path="/register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;