import { useEffect, useState } from 'react';
import { getMySales } from '../api/purchasesApi';

export default function MySalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSales() {
      try {
        setLoading(true);
        const data = await getMySales();
        setSales(data);
      } catch (err: any) {
        setError(err.message || 'Nepavyko užkrauti pardavimų');
      } finally {
        setLoading(false);
      }
    }

    loadSales();
  }, []);

  if (loading) {
    return <p className="info-text">Kraunami pardavimai...</p>;
  }

  return (
    <div className="my-assets-section">
      <div className="section-header">
        <h2>Mano pardavimai (Dashboard)</h2>
      </div>

      {error && <p className="error">{error}</p>}

      {sales.length === 0 ? (
        <p className="info-text">Dar neturite pardavimų. Kai kas nors nupirks jūsų kūrinį, informacija atsiras čia.</p>
      ) : (
        <div style={{ 
          overflowX: 'auto', 
          marginTop: '20px', 
          backgroundColor: 'rgba(255, 255, 255, 0.03)', 
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)' 
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                borderBottom: '2px solid rgba(255, 255, 255, 0.1)' 
              }}>
                <th style={{ padding: '16px 12px', color: '#a0aec0', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>Data</th>
                <th style={{ padding: '16px 12px', color: '#a0aec0', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>Kūrinys</th>
                <th style={{ padding: '16px 12px', color: '#a0aec0', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>Pirkėjas</th>
                <th style={{ padding: '16px 12px', color: '#a0aec0', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>El. paštas</th>
                <th style={{ padding: '16px 12px', color: '#a0aec0', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>Licencija</th>
                <th style={{ padding: '16px 12px', color: '#a0aec0', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>Uždarbis</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} style={{ 
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'background-color 0.2s ease'
                }} 
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '16px 12px', color: '#cbd5e1' }}>
                    {new Date(sale.createdAt).toLocaleDateString('lt-LT')}
                  </td>
                  <td style={{ padding: '16px 12px', fontWeight: 'bold', color: '#fff' }}>
                    {sale.asset.title}
                  </td>
                  <td style={{ padding: '16px 12px', color: '#cbd5e1' }}>
                    {sale.buyer?.displayName || 'Nežinomas'}
                  </td>
                  <td style={{ padding: '16px 12px', color: '#94a3b8', fontSize: '0.9rem' }}>
                    {sale.buyer?.email || '-'}
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <span style={{ 
                      backgroundColor: 'rgba(56, 189, 248, 0.1)', 
                      color: '#38bdf8', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.85rem',
                      fontWeight: '500'
                    }}>
                      {sale.license.name}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px', color: '#10b981', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {(sale.priceCents / 100).toFixed(2)} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}