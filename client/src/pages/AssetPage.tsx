import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAssetById, updateAsset } from '../api/assetsApi';
import { getUser, isLoggedIn } from '../utils/auth';
import { createPurchase } from '../api/purchasesApi';
import PreviewPlayer from '../components/PreviewPlayer';
import ChatWindow from '../components/ChatWindow';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getFileUrl = (url: string | undefined | null) => {
  if (!url) return '';
  if (url.includes('cloudinary') || url.startsWith('http')) {
    return url.replace('https//', 'https://').replace('http//', 'http://');
  }
  return `${BACKEND_URL}${url}`;
};

export default function AssetPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const user = getUser();

  const [asset, setAsset] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    type: 'TRACK',
    genre: '',
    bpm: '',
    musicalKey: '',
    durationSec: '',
  });

  useEffect(() => {
    async function loadAsset() {
      try {
        setLoading(true);
        setError('');
        const result = await getAssetById(id!);
        setAsset(result);
        setEditForm({
          title: result.title || '',
          description: result.description || '',
          type: result.type || 'TRACK',
          genre: result.genre || '',
          bpm: result.bpm?.toString() || '',
          musicalKey: result.musicalKey || '',
          durationSec: result.durationSec?.toString() || '',
        });
      } catch (err: any) {
        setError(err.message || 'Nepavyko užkrauti kūrinio');
      } finally {
        setLoading(false);
      }
    }
    if (id) loadAsset();
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

  const handleDelete = async () => {
    if (!window.confirm('⚠️ Ar tikrai norite ištrinti šį kūrinį? Šis veiksmas yra negražinamas.')) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken'); 
      
      if (!token) {
        throw new Error('Prisijungimo seansas baigėsi. Prisijunkite iš naujo.');
      }

      const response = await fetch(`${BACKEND_URL}/assets/${asset.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Nepavyko ištrinti kūrinio.');
      }

      alert('Kūrinys sėkmingai pašalintas.');
      navigate('/my-assets');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!asset) return;
    try {
      setIsSaving(true);
      setError('');
      setMessage('');

      const updated = await updateAsset(asset.id, {
        title: editForm.title,
        description: editForm.description || null,
        type: editForm.type,
        genre: editForm.genre || null,
        bpm: editForm.bpm ? Number(editForm.bpm) : null,
        musicalKey: editForm.musicalKey || null,
        durationSec: editForm.durationSec ? Number(editForm.durationSec) : null,
      });

      setAsset(updated);
      setEditMode(false);
      setMessage('Kūrinio informacija atnaujinta.');
    } catch (err: any) {
      setError(err.message || 'Nepavyko atnaujinti kūrinio');
    } finally {
      setIsSaving(false);
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
            <div className="asset-view-cover" style={{ backgroundImage: `url(${getFileUrl(asset.coverUrl)})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#1e293b' }}></div>
          ) : (
            <div className="asset-view-cover asset-cover-placeholder">Be cover</div>
          )}
        </div>

        <div className="asset-view-main">
          <div className="asset-view-header">
            {editMode ? (
              <select
                value={editForm.type}
                onChange={(e) => setEditForm((prev) => ({ ...prev, type: e.target.value }))}
                style={{ maxWidth: 180, marginBottom: 12, borderRadius: 8, padding: '6px 10px', background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <option value="TRACK">TRACK</option>
                <option value="LOOP">LOOP</option>
                <option value="SAMPLE">SAMPLE</option>
              </select>
            ) : (
              <p className="asset-view-kicker">{asset.type || 'TRACK'}</p>
            )}

            {editMode ? (
              <input
                value={editForm.title}
                onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                style={{ width: '100%', maxWidth: 460, borderRadius: 10, padding: '10px 12px', background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', fontSize: '1.75rem', fontWeight: 800 }}
              />
            ) : (
              <h1 className="asset-view-title">{asset.title}</h1>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
              <p className="asset-view-artist" style={{ margin: 0 }}>Autorius: {asset.artist.displayName}</p>
              
              {loggedIn && !isOwner && (
                <button 
                  onClick={() => setShowChat(!showChat)}
                  style={{
                    width: 'max-content', flex: '0 0 auto', margin: 0,
                    backgroundColor: showChat ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: showChat ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: showChat ? '#38bdf8' : '#e2e8f0',
                    padding: '8px 20px', borderRadius: '999px', fontSize: '0.9rem', fontWeight: '600',
                    cursor: 'pointer', transition: 'all 0.2s ease', display: 'inline-flex',
                    alignItems: 'center', gap: '8px', boxShadow: 'none'
                  }}
                >
                  💬 {showChat ? 'Uždaryti chatą' : 'Parašyti autoriui'}
                </button>
              )}

              {loggedIn && isOwner && (
                <>
                  <button
                    onClick={() => setEditMode((prev) => !prev)}
                    style={{ border: '1px solid #38bdf8', color: '#38bdf8', background: 'transparent', borderRadius: '999px', padding: '8px 18px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {editMode ? 'Atšaukti redagavimą' : 'Redaguoti informaciją'}
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="delete-btn-modern"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: 'transparent',
                      border: '1px solid #ef4444',
                      color: '#ef4444',
                      padding: '8px 22px',
                      borderRadius: '999px',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                    Ištrinti kūrinį
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="asset-view-tags">
            {editMode ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', width: '100%', maxWidth: 600 }}>
                <input placeholder="Žanras" value={editForm.genre} onChange={(e) => setEditForm((prev) => ({ ...prev, genre: e.target.value }))} style={{ borderRadius: 8, padding: '8px 10px', background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }} />
                <input placeholder="BPM" type="number" value={editForm.bpm} onChange={(e) => setEditForm((prev) => ({ ...prev, bpm: e.target.value }))} style={{ borderRadius: 8, padding: '8px 10px', background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }} />
                <input placeholder="Tonacija" value={editForm.musicalKey} onChange={(e) => setEditForm((prev) => ({ ...prev, musicalKey: e.target.value }))} style={{ borderRadius: 8, padding: '8px 10px', background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }} />
                <input placeholder="Trukmė (s)" type="number" value={editForm.durationSec} onChange={(e) => setEditForm((prev) => ({ ...prev, durationSec: e.target.value }))} style={{ borderRadius: 8, padding: '8px 10px', background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }} />
              </div>
            ) : (
              <>
                {asset.genre && <span className="asset-tag">{asset.genre}</span>}
                {asset.bpm && <span className="asset-tag">{asset.bpm} BPM</span>}
                {asset.musicalKey && <span className="asset-tag">{asset.musicalKey}</span>}
                {asset.durationSec && <span className="asset-tag">{asset.durationSec} s</span>}
              </>
            )}
          </div>

          {(asset.description || editMode) && (
            <div className="asset-view-description-box">
              <h3>Aprašymas</h3>
              {editMode ? (
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  style={{ width: '100%', borderRadius: 8, padding: '10px 12px', background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}
                />
              ) : (
                <p>{asset.description}</p>
              )}
            </div>
          )}

          {editMode && (
            <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
              <button onClick={handleSave} disabled={isSaving} className="buy-button" style={{ maxWidth: 220 }}>
                {isSaving ? 'Saugoma...' : 'Išsaugoti pakeitimus'}
              </button>
            </div>
          )}

          <div style={{ marginTop: '30px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px', fontWeight: '700' }}>Preview</h3>
            <PreviewPlayer src={getFileUrl(asset.previewUrl)} title={asset.title} />
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
          <ChatWindow currentUserId={user!.id} receiverId={asset.artist.id} receiverName={asset.artist.displayName} onClose={() => setShowChat(false)} />
        </div>
      )}
    </div>
  );
}
