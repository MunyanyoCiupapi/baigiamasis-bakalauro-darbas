import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createPurchase } from '../api/purchasesApi';
import { deleteAsset, getAssetById, updateAsset } from '../api/assetsApi';
import PreviewPlayer from '../components/PreviewPlayer';
import ChatWindow from '../components/ChatWindow';
import { getUser, isLoggedIn } from '../utils/auth';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

type EditLicenseForm = {
  assetLicenseId: string;
  licenseId: string;
  code: string;
  name: string;
  price: string;
  description: string;
};

type EditFormState = {
  title: string;
  description: string;
  type: 'TRACK' | 'LOOP' | 'SAMPLE';
  genre: string;
  bpm: string;
  musicalKey: string;
  durationSec: string;
  licenses: EditLicenseForm[];
};

const emptyEditForm: EditFormState = {
  title: '',
  description: '',
  type: 'TRACK',
  genre: '',
  bpm: '',
  musicalKey: '',
  durationSec: '',
  licenses: [],
};

const getFileUrl = (url: string | undefined | null) => {
  if (!url) return '';
  if (url.includes('cloudinary') || url.startsWith('http')) {
    return url.replace('https//', 'https://').replace('http//', 'http://');
  }
  return `${BACKEND_URL}${url}`;
};

const formatPriceFromCents = (priceCents: number | null | undefined) => {
  if (priceCents === null || priceCents === undefined) return '';
  return (priceCents / 100).toFixed(2);
};

const createEditForm = (asset: any): EditFormState => ({
  title: asset.title || '',
  description: asset.description || '',
  type: asset.type || 'TRACK',
  genre: asset.genre || '',
  bpm: asset.bpm?.toString() || '',
  musicalKey: asset.musicalKey || '',
  durationSec: asset.durationSec?.toString() || '',
  licenses: (asset.licenses || []).map((item: any) => ({
    assetLicenseId: item.id,
    licenseId: item.license.id,
    code: item.license.code,
    name: item.license.name,
    price: formatPriceFromCents(item.priceCents),
    description: item.description ?? item.license.description ?? '',
  })),
});

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
  const [editForm, setEditForm] = useState<EditFormState>(emptyEditForm);

  useEffect(() => {
    async function loadAsset() {
      try {
        setLoading(true);
        setError('');
        const result = await getAssetById(id!);
        setAsset(result);
        setEditForm(createEditForm(result));
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
        const parsedUrl = new URL(result.checkoutUrl, window.location.origin);
        
        if (parsedUrl.protocol === 'https:') {
          window.location.href = parsedUrl.toString();
        } else {
          throw new Error('Nepatikimas nukreipimo adresas.');
        }
      } else {
        setMessage(result.message || 'Pirkimas sėkmingas');
      }
    } catch (err: any) {
      setError(err.message || 'Nepavyko pradėti pirkimo');
      setMessage('');
    }
  };

  const handleDelete = async () => {
    if (!asset) return;

    if (!window.confirm('Ar tikrai norite ištrinti šį kūrinį? Šis veiksmas yra negrąžinamas.')) {
      return;
    }

    try {
      setError('');
      setMessage('');
      setLoading(true);
      await deleteAsset(asset.id);
      navigate('/my-assets');
    } catch (err: any) {
      setError(err.message || 'Nepavyko ištrinti kūrinio');
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (!asset) return;
    setEditForm(createEditForm(asset));
    setEditMode(false);
    setError('');
    setMessage('');
  };

  const handleLicenseChange = (
    assetLicenseId: string,
    field: 'price' | 'description',
    value: string,
  ) => {
    setEditForm((prev) => ({
      ...prev,
      licenses: prev.licenses.map((license) =>
        license.assetLicenseId === assetLicenseId
          ? { ...license, [field]: value }
          : license,
      ),
    }));
  };

  const handleSave = async () => {
    if (!asset) return;

    if (!editForm.title.trim()) {
      setError('Pavadinimas negali būti tuščias.');
      return;
    }

    const invalidLicense = editForm.licenses.find(
      (license) => license.price.trim() === '' || Number(license.price) < 0,
    );

    if (invalidLicense) {
      setError(`Patikrinkite licencijos „${invalidLicense.name}“ kainą.`);
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      setMessage('');

      await updateAsset(asset.id, {
        title: editForm.title.trim(),
        description: editForm.description.trim() || null,
        type: editForm.type,
        genre: editForm.genre.trim() || null,
        bpm: editForm.bpm ? Number(editForm.bpm) : null,
        musicalKey: editForm.musicalKey.trim() || null,
        durationSec: editForm.durationSec ? Number(editForm.durationSec) : null,
        licenses: editForm.licenses.map((license) => ({
          assetLicenseId: license.assetLicenseId,
          licenseId: license.licenseId,
          priceCents: Math.round(Number(license.price) * 100),
          description: license.description.trim() || null,
        })),
      });

      const refreshedAsset = await getAssetById(asset.id);
      setAsset(refreshedAsset);
      setEditForm(createEditForm(refreshedAsset));
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
        <Link to="/" className="secondary-link-button">← Atgal į katalogą</Link>
      </div>

      <section className="asset-view-hero">
        <div className="asset-view-cover-wrap">
          {asset.coverUrl ? (
            <div
              className="asset-view-cover"
              style={{
                backgroundImage: `url(${getFileUrl(asset.coverUrl)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: '#1e293b',
              }}
            />
          ) : (
            <div className="asset-view-cover asset-cover-placeholder">Be cover</div>
          )}
        </div>

        <div className="asset-view-main">
          <div className="asset-view-header">
            {editMode ? (
              <>
                <div className="asset-inline-kicker-row">
                  <label htmlFor="asset-type" className="asset-inline-kicker-label">
                    Tipas
                  </label>
                  <select
                    id="asset-type"
                    value={editForm.type}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        type: e.target.value as EditFormState['type'],
                      }))
                    }
                    className="asset-inline-select"
                  >
                    <option value="TRACK">Track</option>
                    <option value="LOOP">Loop</option>
                    <option value="SAMPLE">Sample</option>
                  </select>
                </div>
                <input
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="asset-inline-title-input"
                  placeholder="Pvz. Dark Trap Beat"
                />
              </>
            ) : (
              <>
                <p className="asset-view-kicker">{asset.type || 'TRACK'}</p>
                <h1 className="asset-view-title">{asset.title}</h1>
              </>
            )}

            <div className="asset-view-meta-row">
              <p className="asset-view-artist">Autorius: {asset.artist.displayName}</p>

              {loggedIn && !isOwner && (
                <button
                  type="button"
                  onClick={() => setShowChat((prev) => !prev)}
                  className={`asset-action-button asset-action-button-secondary${showChat ? ' asset-action-button-active' : ''}`}
                >
                  {showChat ? 'Uždaryti chatą' : 'Parašyti autoriui'}
                </button>
              )}

              {loggedIn && isOwner && (
                <div className="asset-owner-actions">
                  <button
                    type="button"
                    onClick={() => {
                      if (editMode) {
                        handleCancelEdit();
                      } else {
                        setEditForm(createEditForm(asset));
                        setEditMode(true);
                        setError('');
                        setMessage('');
                      }
                    }}
                    className="asset-action-button asset-action-button-secondary"
                  >
                    {editMode ? 'Atšaukti' : 'Redaguoti'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="asset-action-button asset-action-button-danger"
                  >
                    Ištrinti
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="asset-view-tags">
            {editMode ? (
              <div className="asset-inline-meta-grid">
                <div className="asset-edit-field asset-edit-field-genre">
                  <label htmlFor="asset-genre">Žanras</label>
                  <input
                    id="asset-genre"
                    value={editForm.genre}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, genre: e.target.value }))}
                    placeholder="Pvz. Trap"
                  />
                </div>
                <div className="asset-edit-field asset-edit-field-bpm">
                  <label htmlFor="asset-bpm">BPM</label>
                  <input
                    id="asset-bpm"
                    type="number"
                    min="0"
                    value={editForm.bpm}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, bpm: e.target.value }))}
                    placeholder="140"
                  />
                </div>
                <div className="asset-edit-field asset-edit-field-key">
                  <label htmlFor="asset-key">Tonacija</label>
                  <input
                    id="asset-key"
                    value={editForm.musicalKey}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, musicalKey: e.target.value }))}
                    placeholder="C#m"
                  />
                </div>
                <div className="asset-edit-field asset-edit-field-duration">
                  <label htmlFor="asset-duration">Trukmė sekundėmis</label>
                  <input
                    id="asset-duration"
                    type="number"
                    min="0"
                    value={editForm.durationSec}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, durationSec: e.target.value }))}
                    placeholder="120"
                  />
                </div>
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
                <>
                  <textarea
                    id="asset-description"
                    rows={5}
                    value={editForm.description}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Trumpai aprašyk nuotaiką, skambesį ir kam šis kūrinys labiausiai tinka."
                  />
                  <div className="asset-edit-footer">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="asset-action-button asset-action-button-secondary"
                    >
                      Atšaukti pakeitimus
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="asset-action-button asset-action-button-primary"
                    >
                      {isSaving ? 'Saugoma...' : 'Išsaugoti pakeitimus'}
                    </button>
                  </div>
                </>
              ) : (
                <p>{asset.description || 'Aprašymas dar nepridėtas.'}</p>
              )}
            </div>
          )}

          <div className="asset-preview-section">
            <h3 className="asset-preview-title">Preview</h3>
            <PreviewPlayer src={getFileUrl(asset.previewUrl)} title={asset.title} />
          </div>
        </div>
      </section>

      <section className="asset-view-licenses-section">
        <div className="section-header">
          <h2>Licencijos</h2>
          {editMode && (
            <p className="asset-license-edit-hint">
              Čia gali redaguoti kiekvienos licencijos kainą ir jos aprašymą.
            </p>
          )}
        </div>

        <div className="asset-license-list">
          {(editMode ? editForm.licenses : asset.licenses).map((item: any) => {
            const cardKey = editMode ? item.assetLicenseId : item.id;
            const licenseName = editMode ? item.name : item.license.name;
            const licenseCode = editMode ? item.code : item.license.code;
            const price = editMode ? item.price : formatPriceFromCents(item.priceCents);
            const description = editMode
              ? item.description
              : item.description ?? item.license.description ?? '';
            const licenseId = editMode ? item.licenseId : item.license.id;

            return (
              <div key={cardKey} className={`asset-license-card${editMode ? ' asset-license-card-editable' : ''}`}>
                <div className="asset-license-card-top">
                  <div>
                    <h3>{licenseName}</h3>
                    <p className="asset-license-code">{licenseCode}</p>
                  </div>
                  {!editMode && (
                    <div className="asset-license-price">{formatPriceFromCents(item.priceCents)} €</div>
                  )}
                </div>

                {editMode ? (
                  <div className="asset-license-form">
                    <div className="asset-edit-field">
                      <label htmlFor={`price-${cardKey}`}>Kaina (€)</label>
                      <input
                        id={`price-${cardKey}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) => handleLicenseChange(item.assetLicenseId, 'price', e.target.value)}
                        placeholder="29.99"
                      />
                    </div>
                    <div className="asset-edit-field asset-edit-field-wide">
                      <label htmlFor={`description-${cardKey}`}>Licencijos aprašymas</label>
                      <textarea
                        id={`description-${cardKey}`}
                        rows={4}
                        value={description}
                        onChange={(e) => handleLicenseChange(item.assetLicenseId, 'description', e.target.value)}
                        placeholder="Aprašyk, ką leidžia ši licencija ir kam ji labiausiai tinka."
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="asset-license-description">
                      <p>{description || 'Licencijos aprašymas dar nepridėtas.'}</p>
                    </div>
                    {isOwner ? (
                      <button className="buy-button asset-license-owner-button" disabled>
                        Tai jūsų kūrinys
                      </button>
                    ) : (
                      <button className="buy-button" onClick={() => handleBuy(licenseId)}>
                        Pirkti šią licenciją
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </section>

      {showChat && loggedIn && user && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
          <ChatWindow
            currentUserId={user.id}
            receiverId={asset.artist.id}
            receiverName={asset.artist.displayName}
            onClose={() => setShowChat(false)}
          />
        </div>
      )}
    </div>
  );
}
