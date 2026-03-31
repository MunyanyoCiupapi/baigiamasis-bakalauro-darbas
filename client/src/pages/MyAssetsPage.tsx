import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyUploads } from '../api/assetsApi';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function MyAssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAssets() {
      try {
        setLoading(true);
        const data = await getMyUploads();
        setAssets(data);
      } catch (err: any) {
        setError(err.message || 'Klaida gaunant kūrinius');
      } finally {
        setLoading(false);
      }
    }
    loadAssets();
  }, []);

  return (
    <div className="my-assets-section">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ margin: 0 }}>Mano įkelti kūriniai</h2>
        <Link to="/upload" className="primary-link-button">
          + Įkelti naują
        </Link>
      </div>

      {loading && <p className="info-text">Kraunami jūsų kūriniai...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && assets.length === 0 ? (
        <p className="info-text">Dar neįkėlėte jokių kūrinių.</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '24px'
        }}>
          {assets.map((asset) => (
            <Link key={asset.id} to={`/assets/${asset.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.3)';
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
              >
                <div style={{
                  height: '180px',
                  backgroundImage: `url(${BACKEND_URL}${asset.coverUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                }}></div>
                
                <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', color: '#fff', fontWeight: 'bold' }}>
                      {asset.title}
                    </h3>
                    <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#94a3b8' }}>
                      Įkelta: <span style={{ color: '#cbd5e1' }}>{new Date(asset.createdAt).toLocaleDateString('lt-LT')}</span>
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)', 
                      padding: '4px 10px', 
                      borderRadius: '8px', 
                      fontSize: '0.8rem', 
                      color: '#94a3b8',
                      fontWeight: '500'
                    }}>
                      {asset.bpm} BPM
                    </span>
                    
                    <span style={{ color: '#38bdf8', fontSize: '0.9rem', fontWeight: '600' }}>
                      Mano kūrinys
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}