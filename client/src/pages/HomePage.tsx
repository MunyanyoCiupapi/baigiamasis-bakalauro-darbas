import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAssets } from '../api/assetsApi';
import { isLoggedIn } from '../utils/auth';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getFileUrl = (url: string | undefined | null) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${BACKEND_URL}${url}`;
};

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
       <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '20px 20px 80px 20px' }}>
         
         <div style={{ textAlign: 'center', marginTop: '60px', marginBottom: '100px' }}>
           <span style={{ 
             backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '8px 16px', 
             borderRadius: '999px', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' 
           }}>
             Muzikos platforma kūrėjams
           </span>
           <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: '900', margin: '24px 0 16px 0', letterSpacing: '-0.04em', lineHeight: '1.1', color: '#fff' }}>
             Muzika, kuri įkvepia.<br />
             <span className="gradient-text">Be tarpininkų.</span>
           </h1>
           <p style={{ color: '#94a3b8', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 40px auto', lineHeight: '1.6' }}>
             Atraskite unikalius instrumentus, loop'us ir garso pavyzdžius. Tiesiogiai palaikykite nepriklausomus atlikėjus ir kurkite be apribojimų.
           </p>
           <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
             <Link to="/register" className="primary-link-button" style={{ padding: '16px 40px', fontSize: '1.1rem', borderRadius: '999px' }}>
               Pradėti dabar
             </Link>
             <Link to="/login" style={{ 
               padding: '16px 40px', fontSize: '1.1rem', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.03)', 
               color: '#fff', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none', fontWeight: '700', transition: 'all 0.2s ease' 
             }}
             onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)' }}
             onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)' }}
             >
               Prisijungti
             </Link>
           </div>
         </div>
 
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '100px' }}>
           
           <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', transition: 'transform 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
             <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎧</div>
             <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '12px', fontWeight: '800' }}>Aukščiausia kokybė</h3>
             <p style={{ color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>Kruopščiai atrinkti garsai jūsų produkcijai. Nuo hip-hop beat'ų iki kino filmų garso takelių.</p>
           </div>
 
           <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', transition: 'transform 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
             <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🤝</div>
             <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '12px', fontWeight: '800' }}>Tiesioginis palaikymas</h3>
             <p style={{ color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>Pirkdami licencijas, jūs tiesiogiai remiate autorius. Jokių paslėptų mokesčių ar tarpininkų.</p>
           </div>
 
           <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', transition: 'transform 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
             <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔒</div>
             <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '12px', fontWeight: '800' }}>Saugūs atsiskaitymai</h3>
             <p style={{ color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>Visi mokėjimai apdorojami per saugią sistemą. Iškart po apmokėjimo gausite failus.</p>
           </div>
 
         </div>
         <div style={{ 
           textAlign: 'center', padding: '60px 20px', backgroundColor: 'rgba(56, 189, 248, 0.05)', 
           borderRadius: '32px', border: '1px solid rgba(56, 189, 248, 0.1)',
           backgroundImage: 'radial-gradient(circle at top right, rgba(56, 189, 248, 0.1), transparent 50%)'
         }}>
           <h2 style={{ fontSize: '2.5rem', color: '#fff', margin: '0 0 16px 0', fontWeight: '900', letterSpacing: '-0.02em' }}>
             Esate muzikos kūrėjas?
           </h2>
           <p style={{ color: '#94a3b8', fontSize: '1.15rem', maxWidth: '500px', margin: '0 auto 32px auto', lineHeight: '1.5' }}>
             Prisijunkite prie BakisMusic, įkelkite savo kūrinius ir pradėkite uždirbti iš savo talento jau šiandien.
           </p>
           <Link to="/register" className="primary-link-button" style={{ borderRadius: '999px', padding: '16px 36px', fontSize: '1.05rem' }}>
             Sukurti atlikėjo paskyrą
           </Link>
         </div>
 
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', paddingBottom: '80px' }}>
      
      <div style={{ textAlign: 'center', margin: '40px 0 50px 0' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: '800', color: '#fff', margin: '0 0 16px 0', letterSpacing: '-0.03em' }}>
          Atrask naują <span className="gradient-text">skambesį.</span>
        </h1>
        <p style={{ color: '#cbd5e1', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.5' }}>
          Tiesioginis palaikymas atlikėjams. Kokybiški instrumentai, loop'ai ir sample'ai tavo produkcijai.
        </p>
      </div>

      {/* Paieškos blokas lieka toks pats */}
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
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '40px 24px' 
          }}>
            {filteredAssets.map(asset => (
              <Link key={asset.id} to={`/assets/${asset.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s' }}
                     onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                     onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  
                  {/* PAKEISTA: Naudojamas getFileUrl */}
                  <div style={{
                    width: '100%', aspectRatio: '1/1',
                    backgroundImage: `url(${getFileUrl(asset.coverUrl)})`,
                    backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#1e293b',
                    borderRadius: '8px', boxShadow: '0 8px 20px rgba(0,0,0,0.3)', marginBottom: '16px',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }} />
                  
                  <h3 style={{ fontSize: '1.05rem', margin: '0 0 4px 0', color: '#f8fafc', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {asset.title}
                  </h3>
                  
                  <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                    {asset.artist?.displayName}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {asset.type}
                    </span>
                    <span style={{ fontWeight: '700', color: '#fff', fontSize: '0.95rem' }}>
                      {asset.licenses?.[0] ? (asset.licenses[0].priceCents / 100).toFixed(2) + ' €' : '--'}
                    </span>
                  </div>

                </div>
              </Link>
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