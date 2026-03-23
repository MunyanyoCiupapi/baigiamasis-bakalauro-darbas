import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAssetById } from '../api/assetsApi';
import { getUser, isLoggedIn } from '../utils/auth';
import { createPurchase } from '../api/purchasesApi';

export default function AssetPage() {
  const { id } = useParams();
  const loggedIn = isLoggedIn();
  const user = getUser();

  const [asset, setAsset] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadAsset() {
      try {
        setLoading(true);
        setError('');
        const result = await getAssetById(id!);
        setAsset(result);
      } catch (err: any) {
        setError(err.message || 'Nepavyko užkrauti kūrinio');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadAsset();
    }
  }, [id]);

  const handleBuy = async (licenseId: string) => {
    if (!loggedIn) {
      setError('Norėdami pirkti, turite prisijungti');
      return;
    }

    try {
      setError('');
      setMessage('');

      const result = await createPurchase({
        assetId: asset.id,
        licenseId,
      });

      setMessage(result.message || 'Pirkimas sėkmingas');
    } catch (err: any) {
      setError(err.message || 'Nepavyko pradėti pirkimo');
    }
  };

  if (loading) {
    return <p className="info-text">Įkraunama...</p>;
  }

  if (!asset) {
    return <p className="error">Šis kūrinys nebuvo rastas.</p>;
  }

  return (
    <div className="asset-view-page">
      <div className="asset-view-topbar">
        <Link to="/" className="secondary-link-button">
          ← Grįžti į marketplace
        </Link>
      </div>

      <section className="asset-view-hero">
        <div className="asset-view-cover-wrap">
          {asset.coverUrl ? (
            <img
              src={`http://localhost:3000${asset.coverUrl}`}
              alt={asset.title}
              className="asset-view-cover"
            />
          ) : (
            <div className="asset-view-cover asset-cover-placeholder">
              Be cover
            </div>
          )}
        </div>

        <div className="asset-view-main">
          <div className="asset-view-header">
            <p className="asset-view-kicker">{asset.type}</p>
            <h1 className="asset-view-title">{asset.title}</h1>
            <p className="asset-view-artist">Autorius: {asset.artist.displayName}</p>
          </div>

          <div className="asset-view-tags">
            {asset.genre && <span className="asset-tag">{asset.genre}</span>}
            {asset.bpm && <span className="asset-tag">{asset.bpm} BPM</span>}
            {asset.musicalKey && <span className="asset-tag">{asset.musicalKey}</span>}
            {asset.durationSec && <span className="asset-tag">{asset.durationSec} s</span>}
          </div>

          {asset.description && (
            <div className="asset-view-description-box">
              <h3>Aprašymas</h3>
              <p>{asset.description}</p>
            </div>
          )}

          <div className="asset-view-player-box">
            <h3>Preview</h3>
            <audio
              controls
              className="asset-view-audio"
              src={`http://localhost:3000${asset.fileUrl}`}
            >
              Jūsų naršyklė nepalaiko audio elemento.
            </audio>
          </div>
        </div>
      </section>

      <section className="asset-view-licenses-section">
        <div className="section-header">
          <h2>Licencijos</h2>
        </div>

        <div className="asset-license-list">
          {asset.licenses.map((item: any) => (
            <div key={item.id} className="asset-license-card">
              <div className="asset-license-card-top">
                <div>
                  <h3>{item.license.name}</h3>
                  <p className="asset-license-code">{item.license.code}</p>
                </div>
                <div className="asset-license-price">
                  {(item.priceCents / 100).toFixed(2)} €
                </div>
              </div>

              <div className="asset-license-description">
                {item.license.description ? (
                  <p>{item.license.description}</p>
                ) : (
                  <p>Licencijos aprašymas dar nepridėtas.</p>
                )}
              </div>

              {/* Pirkimo mygtukas, kuris rodomas tik ne savo kūrinių atlikėjams ir vartotojams */}
              {user?.id !== asset.artist.id && (
                <button
                  className="buy-button"
                  onClick={() => handleBuy(item.license.id)}
                >
                  Pirkti šią licenciją
                </button>
              )}
            </div>
          ))}
        </div>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </section>
    </div>
  );
}