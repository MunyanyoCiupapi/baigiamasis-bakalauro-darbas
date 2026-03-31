import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAssetById } from '../api/assetsApi';
import { getUser, isLoggedIn } from '../utils/auth';
import { createPurchase } from '../api/purchasesApi';
import PreviewPlayer from '../components/PreviewPlayer';
import ChatWindow from '../components/ChatWindow';

export default function AssetPage() {
  const { id } = useParams();
  const loggedIn = isLoggedIn();
  const user = getUser();

  const [asset, setAsset] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const [showChat, setShowChat] = useState(false);

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
      setMessage('Nukreipiama į saugų apmokėjimo langą...');
      const result = await createPurchase({ assetId: asset.id, licenseId });
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        setMessage(result.message || 'Pirkimas sėkmingas');
      }
    } catch (err: any) {
      setError(err.message || 'Nepavyko pradėti pirkimo');
      setMessage('');
    }
  };

  if (loading) return <p className="info-text">Įkraunama...</p>;
  if (!asset) return <p className="error">Šis kūrinys nebuvo rastas.</p>;

  const isOwner = user?.id === asset.artist.id;

  return (
    <div className="asset-view-page" style={{ position: 'relative' }}>
      <div className="asset-view-topbar">
        <Link to="/" className="secondary-link-button">← Grįžti į marketplace</Link>
      </div>

      <section className="asset-view-hero">
        <div className="asset-view-cover-wrap">
          {asset.coverUrl ? (
            <div className="asset-view-cover" style={{ backgroundImage: `url(http://localhost:3000${asset.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#1e293b' }}></div>
          ) : (
            <div className="asset-view-cover asset-cover-placeholder">Be cover</div>
          )}
        </div>

        <div className="asset-view-main">
          <div className="asset-view-header">
            <p className="asset-view-kicker">{asset.type || 'TRACK'}</p>
            <h1 className="asset-view-title">{asset.title}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
              <p className="asset-view-artist" style={{ margin: 0 }}>Autorius: {asset.artist.displayName}</p>
              
              {loggedIn && !isOwner && (
                <button 
                  onClick={() => setShowChat(!showChat)}
                  style={{
                    width: 'max-content',
                    flex: '0 0 auto',     
                    margin: 0,
                    backgroundColor: showChat ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: showChat ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: showChat ? '#38bdf8' : '#e2e8f0',
                    padding: '8px 20px',
                    borderRadius: '999px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: 'none'
                  }}
                >
                  💬 {showChat ? 'Uždaryti chatą' : 'Parašyti autoriui'}
                </button>
              )}
            </div>
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

          <div style={{ marginTop: '30px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px', fontWeight: '700' }}>Preview</h3>
            <PreviewPlayer src={`http://localhost:3000${asset.previewUrl}`} title={asset.title} />
          </div>
        </div>
      </section>

      <section className="asset-view-licenses-section">
        <div className="section-header"><h2>Licencijos</h2></div>
        <div className="asset-license-list">
          {asset.licenses.map((item: any) => (
            <div key={item.id} className="asset-license-card">
              <div className="asset-license-card-top">
                <div>
                  <h3>{item.license.name}</h3>
                  <p className="asset-license-code">{item.license.code}</p>
                </div>
                <div className="asset-license-price">{(item.priceCents / 100).toFixed(2)} €</div>
              </div>
              <div className="asset-license-description">
                {item.license.description ? <p>{item.license.description}</p> : <p>Licencijos aprašymas dar nepridėtas.</p>}
              </div>
              {isOwner ? (
                <button className="buy-button" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#94a3b8', cursor: 'not-allowed', boxShadow: 'none' }} disabled>Tai jūsų kūrinys</button>
              ) : (
                <button className="buy-button" onClick={() => handleBuy(item.license.id)}>Pirkti šią licenciją</button>
              )}
            </div>
          ))}
        </div>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </section>

      {showChat && loggedIn && user && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
          <ChatWindow currentUserId={user.id} receiverId={asset.artist.id} receiverName={asset.artist.displayName} onClose={() => setShowChat(false)} />
        </div>
      )}
    </div>
  );
}