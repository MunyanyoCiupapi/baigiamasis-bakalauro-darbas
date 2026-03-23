import { useEffect, useState } from 'react';
import { getMyPurchases } from '../api/purchasesApi';

export default function MyPurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPurchases() {
      try {
        setLoading(true);
        setError('');
        const result = await getMyPurchases();
        setPurchases(result);
      } catch (err: any) {
        setError(err.message || 'Nepavyko užkrauti pirkimų');
      } finally {
        setLoading(false);
      }
    }

    loadPurchases();
  }, []);

  if (loading) {
    return <p className="info-text">Kraunami pirkimai...</p>;
  }

  return (
    <div className="my-assets-section">
      <div className="section-header">
        <h2>Mano pirkimai</h2>
      </div>

      {error && <p className="error">{error}</p>}

      {purchases.length === 0 ? (
        <p className="info-text">Dar neturite pirkimų.</p>
      ) : (
        <div className="asset-grid">
          {purchases.map((purchase) => (
            <div className="asset-card" key={purchase.id}>
              {purchase.asset.coverUrl ? (
                <img
                  src={`http://localhost:3000${purchase.asset.coverUrl}`}
                  alt={purchase.asset.title}
                  className="asset-cover"
                />
              ) : (
                <div className="asset-cover asset-cover-placeholder">
                  Be cover
                </div>
              )}

              <div className="asset-card-body">
                <h3>{purchase.asset.title}</h3>

                <p className="asset-meta">
                  Autorius: {purchase.asset.artist.displayName}
                </p>

                <p className="asset-meta">
                  Licencija: {purchase.license.name}
                </p>

                <p className="asset-meta">
                  Kaina: {(purchase.priceCents / 100).toFixed(2)} €
                </p>

                <a
                  href={`http://localhost:3000${purchase.asset.fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="primary-link-button"
                >
                  Atsisiųsti failą
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}