import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import GuestRoute from './components/GuestRoute';
import ProtectedRoute from './components/ProtectedRoute';
import ArtistRoute from './components/ArtistRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreateAssetPage from './pages/CreateAssetPage';
import AssetPage from './pages/AssetPage';
import MyPurchasesPage from './pages/MyPurchasesPage';
import MySalesPage from './pages/MySalesPage';
import MyAssetsPage from './pages/MyAssetsPage';

function App() {
  return (
    <div className="app-shell">
      <div className="background-blur blur-1"></div>
      <div className="background-blur blur-2"></div>

      <Navbar />

      <main className="page-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<ArtistRoute><CreateAssetPage /></ArtistRoute>} />
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/assets/:id" element={<AssetPage />} />
          <Route path="/my-purchases" element={<ProtectedRoute><MyPurchasesPage /></ProtectedRoute>} />
          <Route path="/my-sales" element={<ArtistRoute><MySalesPage /></ArtistRoute>} />
          <Route path="/my-uploads" element={<ArtistRoute><MyAssetsPage /></ArtistRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;