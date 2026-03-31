import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAssets } from '../api/assetsApi';
import { isLoggedIn } from '../utils/auth';
import PreviewPlayer from '../components/PreviewPlayer';

export default function HomePage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Visi');

  const categories = ['Visi', 'Track', 'Loop', 'Sample'];
  const userIsLoggedIn = isLoggedIn();

  useEffect(() => {
    if (!userIsLoggedIn) return;
    async function loadAssets() {
      try {
        setLoading(true);
        const data = await getAssets();
        setAssets(data);
      } catch (err) {
        console.error("Klaida kraunant kūrinius:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAssets();
  }, [userIsLoggedIn]);

  if (!userIsLoggedIn) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: '900', margin: '0 0 10px 0', letterSpacing: '-0.04em' }}>
          Bakis<span className="logo-accent">Music</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '30px' }}>
          Tiesioginis palaikymas nepriklausomiems atlikėjams.
        </p>
        <Link to="/login" className="primary-link-button" style={{ width: 'auto', padding: '14px 40px', borderRadius: '50px' }}>
          Prisijungti
        </Link>
      </div>
    );
  }

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.title.toLowerCase().includes(searchTerm.toLowerCase());
    const assetType = asset.type ? asset.type.toLowerCase() : 'track';
    const matchesTab = activeTab === 'Visi' || assetType === activeTab.toLowerCase();
    return matchesSearch && matchesTab;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', paddingBottom: '80px' }}>
      
      <div style={{ textAlign: 'center', margin: '40px 0 50px 0' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: '800', color: '#fff', margin: '0 0 16px 0', letterSpacing: '-0.03em' }}>
          Atrask naują <span className="gradient-text">skambesį.</span>
        </h1>
        <p style={{ color: '#cbd5e1', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.5' }}>
          Tiesioginis palaikymas atlikėjams. Kokybiški instrumentai, loop'ai ir sample'ai tavo produkcijai.
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', alignItems: 'center', marginBottom: '50px' }}>
        <input 
          type="text" 
          placeholder="Ieškoti..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '12px 20px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.1)',
            backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff', outline: 'none', width: '260px', fontSize: '0.95rem', margin: 0
          }}
        />

        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            style={{
              width: 'auto', flex: '0 0 auto',
              background: activeTab === cat ? 'linear-gradient(135deg, #6366f1, #3b82f6)' : 'rgba(255,255,255,0.05)', 
              border: activeTab === cat ? 'none' : '1px solid rgba(255,255,255,0.1)', 
              boxShadow: activeTab === cat ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
              cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600', color: '#fff',
              padding: '12px 24px', borderRadius: '999px', transition: 'all 0.2s ease', margin: 0
            }}
          >
            {cat === 'Visi' ? 'Visi tipai' : cat + 's'}
          </button>
        ))}

        {(searchTerm || activeTab !== 'Visi') && (
          <button 
            onClick={() => {setSearchTerm(''); setActiveTab('Visi');}}
            style={{ 
              width: 'auto', flex: '0 0 auto', color: '#fca5a5', background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer', fontWeight: '600', 
              fontSize: '0.9rem', padding: '12px 20px', borderRadius: '999px', boxShadow: 'none', margin: 0 
            }}
          >
            Išvalyti
          </button>
        )}
      </div>

      <main>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>Kraunama...</p>
        ) : filteredAssets.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '30px' 
          }}>
            {filteredAssets.map(asset => (
              <div key={asset.id} style={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.08)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.4)';
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              }}>
                
                <Link to={`/assets/${asset.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div style={{
                    width: '100%', aspectRatio: '1/1',
                    backgroundImage: `url(http://localhost:3000${asset.coverUrl})`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    backgroundColor: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.05)'
                  }} />
                  
                  <div style={{ padding: '24px 24px 16px 24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ overflow: 'hidden', paddingRight: '12px' }}>
                        <h3 style={{ fontSize: '1.4rem', margin: '0 0 6px 0', color: '#fff', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {asset.title}
                        </h3>
                        <p style={{ margin: '0', fontSize: '1rem', color: '#94a3b8' }}>
                          {asset.artist?.displayName}
                        </p>
                      </div>
                      <span style={{ fontWeight: '800', color: '#10b981', fontSize: '1.25rem', flexShrink: 0 }}>
                        {asset.licenses?.[0] ? (asset.licenses[0].priceCents / 100).toFixed(2) + ' €' : '--'}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto' }}>
                      <span style={{ backgroundColor: 'rgba(56,189,248,0.1)', color: '#38bdf8', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>
                        {asset.type}
                      </span>
                      <span style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#cbd5e1', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600' }}>
                        {asset.bpm} BPM
                      </span>
                    </div>
                  </div>
                </Link>

                <div style={{ padding: '0 24px 24px 24px' }}>
                  <PreviewPlayer src={`http://localhost:3000${asset.previewUrl}`} title={asset.title} />
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Pagal jūsų kriterijus kūrinių nerasta.</p>
          </div>
        )}
      </main>
    </div>
  );
}