import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAssets } from '../api/assetsApi';
import { isLoggedIn } from '../utils/auth';

export default function HomePage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const userIsLoggedIn = isLoggedIn(); 

  useEffect(() => {
    if (!userIsLoggedIn) return;

    async function loadAssets() {
      try {
        setLoading(true);
        const data = await getAssets();
        setAssets(data);
      } catch (err: any) {
        setError(err.message || 'Nepavyko užkrauti kūrinių');
      } finally {
        setLoading(false);
      }
    }
    loadAssets();
  }, [userIsLoggedIn]);

  if (!userIsLoggedIn) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '75vh',
        textAlign: 'center',
        padding: '20px'
      }}>
        <span style={{
          display: 'inline-block',
          padding: '8px 16px',
          borderRadius: '999px',
          backgroundColor: 'rgba(56, 189, 248, 0.1)',
          color: '#38bdf8',
          fontWeight: '600',
          fontSize: '0.9rem',
          marginBottom: '24px',
          border: '1px solid rgba(56, 189, 248, 0.2)'
        }}>
          🎵 BakisMusic Platforma
        </span>

        {/* Pagrindinė antraštė */}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
          fontWeight: '800',
          margin: '0 0 24px 0',
          lineHeight: '1.1',
          letterSpacing: '-0.03em',
          color: '#fff'
        }}>
          Tavo muzika.<br />
          <span style={{ background: 'linear-gradient(135deg, #818cf8, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Tavo taisyklės.
          </span>
        </h1>

        <p style={{
          fontSize: '1.25rem',
          color: '#94a3b8',
          maxWidth: '600px',
          margin: '0 0 40px 0',
          lineHeight: '1.6'
        }}>
          Atrask ir pirk išskirtinius kūrinius savo naujam projektui arba parduok savo kūrybą tiesiogiai. Jokių tarpininkų, tik grynas talentas.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/register" className="primary-link-button" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
            Pradėti dabar
          </Link>
          <Link to="/login" className="secondary-link-button" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
            Prisijungti
          </Link>
        </div>
      </div>
    );
  }

  const filteredAssets = assets.filter(asset => 
    asset.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '24px',
        marginBottom: '40px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
      }}>
        <h1 style={{ fontSize: '3rem', margin: '0 0 16px 0', color: '#fff', fontWeight: '800', letterSpacing: '-0.02em' }}>
          Atrask ir pirk geriausius <span style={{ color: '#38bdf8' }}>muzikos</span> kūrinius
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 30px auto' }}>
          Aukščiausios kokybės instrumentuotės ir dainos tavo projektams. Palaikyk nepriklausomus atlikėjus.
        </p>
        
        <input 
          type="text" 
          placeholder="Ieškoti kūrinio pagal pavadinimą..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '16px 24px',
            width: '100%',
            maxWidth: '500px',
            borderRadius: '50px',
            border: '1px solid rgba(255,255,255,0.1)',
            backgroundColor: 'rgba(0,0,0,0.2)',
            color: '#fff',
            fontSize: '1rem',
            outline: 'none',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        />
      </div>

      {/* KŪRINIŲ TINKLELIS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Naujausi įkėlimai</h2>
        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Rasta: {filteredAssets.length}</span>
      </div>

      {loading && <p className="info-text">Kraunami kūriniai...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && filteredAssets.length === 0 ? (
        <p className="info-text" style={{ textAlign: 'center', marginTop: '40px' }}>
          Kūrinių nerasta. Pabandykite kitą paieškos žodį.
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '24px'
        }}>
          {filteredAssets.map((asset) => (
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
                  backgroundImage: `url(http://localhost:3000${asset.coverUrl})`,
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
                      Autorius: <span style={{ color: '#cbd5e1' }}>{asset.artist?.displayName || 'Nežinomas'}</span>
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
                    
                    {asset.licenses && asset.licenses.length > 0 && (
                      <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        Nuo {(Math.min(...asset.licenses.map((l: any) => l.priceCents)) / 100).toFixed(2)} €
                      </span>
                    )}
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