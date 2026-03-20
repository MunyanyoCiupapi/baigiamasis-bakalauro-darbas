import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteAsset, getAssets } from '../api/assetsApi';
import { getUser, isLoggedIn } from '../utils/auth';

type Asset = {
  id: string;
  title: string;
  description?: string;
  type: 'TRACK' | 'LOOP' | 'SAMPLE';
  genre?: string;
  bpm?: number;
  musicalKey?: string;
  durationSec?: number;
  fileUrl: string;
  coverUrl?: string | null;
  artist: {
    id: string;
    email: string;
    displayName: string;
    role: string;
  };
  licenses: Array<{
    id: string;
    priceCents: number;
    license: {
      id: string;
      code: string;
      name: string;
      description?: string | null;
    };
  }>;
};

export default function HomePage() {
  const loggedIn = isLoggedIn();
  const user = getUser();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadAssets() {
      try {
        setLoading(true);
        setError('');
        const result = await getAssets();
        setAssets(result);
      } catch (err: any) {
        setError(err.message || 'Nepavyko užkrauti kūrinių');
      } finally {
        setLoading(false);
      }
    }

    if (loggedIn) {
      loadAssets();
    }
  }, [loggedIn]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Ar tikrai norite ištrinti šį kūrinį?');
    if (!confirmed) return;

    try {
      setError('');
      setMessage('');

      const result = await deleteAsset(id);
      setAssets((prev) => prev.filter((asset) => asset.id !== id));
      setMessage(result.message || 'Kūrinys ištrintas');
    } catch (err: any) {
      setError(err.message || 'Nepavyko ištrinti kūrinio');
    }
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">Muzikos prekybos platforma</span>

          <h1 className="hero-title">
            Įkelk, parduok ir atrask{' '}
            <span className="gradient-text">beat’us, loop’us ir sample’us</span>
          </h1>

          <p className="hero-description">
            Platforma skirta atlikėjams ir pirkėjams. Čia gali naršyti visų autorių
            kūrinius, klausyti preview ir valdyti savo turinį.
          </p>

          {loggedIn && user ? (
            <div className="welcome-box">
              <h3>Sveikas sugrįžęs, {user.displayName}!</h3>
              <p>Prisijungta kaip: {user.role}</p>
            </div>
          ) : (
            <div className="hero-actions">
              <Link to="/register" className="primary-link-button">
                Pradėti dabar
              </Link>
              <Link to="/login" className="secondary-link-button">
                Prisijungti
              </Link>
            </div>
          )}
        </div>

        <div className="hero-card">
          <div className="mock-player">
            <div className="mock-top">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>

            <div className="mock-body">
              <p className="mock-label">Pavyzdinis kūrinys</p>
              <h3>Dark Trap Beat</h3>
              <p className="mock-meta">TRACK · 140 BPM · C#m</p>

              <div className="wave-lines">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="license-preview">
                <div className="license-row">
                  <span>Personal</span>
                  <strong>29 €</strong>
                </div>
                <div className="license-row">
                  <span>Commercial</span>
                  <strong>79 €</strong>
                </div>
                <div className="license-row">
                  <span>Unlimited</span>
                  <strong>199 €</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {loggedIn && (
        <section className="my-assets-section">
          <div className="section-header">
            <h2>Visi kūriniai</h2>

            {user?.role === 'ARTIST' && (
              <Link to="/upload" className="primary-link-button">
                Įkelti naują
              </Link>
            )}
          </div>

          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}

          {loading ? (
            <p className="info-text">Kraunami kūriniai...</p>
          ) : assets.length === 0 ? (
            <p className="info-text">Dar nėra įkeltų kūrinių.</p>
          ) : (
            <div className="asset-grid">
              {assets.map((asset) => {
                const isOwner = user?.id === asset.artist.id;
                const canDelete = isOwner && user?.role === 'ARTIST';

                return (
                  <div className="asset-card" key={asset.id}>
                    {asset.coverUrl ? (
                      <img
                        src={`http://localhost:3000${asset.coverUrl}`}
                        alt={asset.title}
                        className="asset-cover"
                      />
                    ) : (
                      <div className="asset-cover asset-cover-placeholder">
                        Be cover
                      </div>
                    )}

                    <div className="asset-card-body">
                      <h3>{asset.title}</h3>

                      <p className="asset-meta">
                        {asset.type}
                        {asset.genre ? ` · ${asset.genre}` : ''}
                        {asset.bpm ? ` · ${asset.bpm} BPM` : ''}
                        {asset.musicalKey ? ` · ${asset.musicalKey}` : ''}
                      </p>

                      <p className="asset-meta">
                        Autorius: {asset.artist.displayName}
                      </p>

                      {asset.description && (
                        <p className="asset-description">{asset.description}</p>
                      )}

                      <audio
                        controls
                        className="asset-audio"
                        src={`http://localhost:3000${asset.fileUrl}`}
                      >
                        Jūsų naršyklė nepalaiko audio elemento.
                      </audio>

                      <div className="asset-prices">
                        {asset.licenses.map((item) => (
                          <div key={item.id} className="license-row">
                            <span>{item.license.name}</span>
                            <strong>{(item.priceCents / 100).toFixed(2)} €</strong>
                          </div>
                        ))}
                      </div>

                      {canDelete && (
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(asset.id)}
                        >
                          Ištrinti
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}