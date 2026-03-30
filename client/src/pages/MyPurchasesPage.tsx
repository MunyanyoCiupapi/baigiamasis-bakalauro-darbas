import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'; // PRIDĖTA
import { downloadPurchaseFile, getMyPurchases } from '../api/purchasesApi';

export default function MyPurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchParams] = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true';

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

  const handleDownload = async (
    purchaseId: string,
    fileUrl: string,
    title: string,
  ) => {
    try {
      setError('');

      const blob = await downloadPurchaseFile(purchaseId);

      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;

      const extension = fileUrl.split('.').pop() || 'mp3';
      a.download = `${title}.${extension}`;

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (err: any) {
      setError(err.message || 'Nepavyko atsisiųsti failo');
    }
  };

  if (loading) {
    return <p className="info-text">Kraunami pirkimai...</p>;
  }

  return (
    <div className="my-assets-section">
      <div className="section-header">
        <h2>Mano pirkimai</h2>
      </div>

      {isSuccess && (
        <p className="success" style={{ marginBottom: '20px' }}>
          Apmokėjimas sėkmingas! Kūrinys pridėtas prie jūsų kolekcijos.
        </p>
      )}

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
                  Autorius: {purchase.asset.artist?.displayName || 'Nežinomas'}
                </p>

                <p className="asset-meta">
                  Licencija: {purchase.license.name}
                </p>

                <p className="asset-meta">
                  Kaina: {(purchase.priceCents / 100).toFixed(2)} €
                </p>

                <a
                  onClick={(e) => {
                    e.preventDefault();
                    handleDownload(
                      purchase.id,
                      purchase.asset.fileUrl,
                      purchase.asset.title
                    );
                  }}
                  className="primary-link-button"
                  style={{ cursor: 'pointer' }}
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