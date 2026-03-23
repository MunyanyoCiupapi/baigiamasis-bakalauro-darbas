import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAsset } from '../api/assetsApi';

function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = document.createElement('audio');
    const objectUrl = URL.createObjectURL(file);

    audio.preload = 'metadata';
    audio.src = objectUrl;

    audio.onloadedmetadata = () => {
      const duration = audio.duration;
      URL.revokeObjectURL(objectUrl);
      resolve(duration);
    };

    audio.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Nepavyko nuskaityti audio failo trukmės'));
    };
  });
}

export default function CreateAssetPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'TRACK' | 'LOOP' | 'SAMPLE'>('TRACK');
  const [genre, setGenre] = useState('');
  const [bpm, setBpm] = useState('');
  const [musicalKey, setMusicalKey] = useState('');
  const [durationSec, setDurationSec] = useState('');

  const [personalPrice, setPersonalPrice] = useState('');
  const [commercialPrice, setCommercialPrice] = useState('');
  const [unlimitedPrice, setUnlimitedPrice] = useState('');

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePreviewChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setPreviewFile(null);
      return;
    }

    try {
      setError('');
      const duration = await getAudioDuration(file);

      if (duration > 30) {
        setPreviewFile(null);
        e.target.value = '';
        setError('Preview failas negali būti ilgesnis nei 30 sekundžių');
        return;
      }

      setPreviewFile(file);
    } catch (err: any) {
      setPreviewFile(null);
      e.target.value = '';
      setError(err.message || 'Nepavyko patikrinti preview failo');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!audioFile) {
      setError('Pasirink audio failą');
      return;
    }

    if (!previewFile) {
      setError('Pasirink preview failą iki 30 sekundžių');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append('title', title);
      formData.append('description', description);
      formData.append('type', type);
      formData.append('genre', genre);
      formData.append('bpm', bpm);
      formData.append('musicalKey', musicalKey);
      formData.append('durationSec', durationSec);

      formData.append('audio', audioFile);
      formData.append('preview', previewFile);

      if (coverFile) {
        formData.append('cover', coverFile);
      }

      const prices = [
        {
          code: 'PERSONAL',
          priceCents: Math.round(Number(personalPrice) * 100),
        },
        {
          code: 'COMMERCIAL',
          priceCents: Math.round(Number(commercialPrice) * 100),
        },
        {
          code: 'UNLIMITED',
          priceCents: Math.round(Number(unlimitedPrice) * 100),
        },
      ];

      formData.append('prices', JSON.stringify(prices));

      await createAsset(formData);

      setMessage('Kūrinys sėkmingai įkeltas');

      setTitle('');
      setDescription('');
      setType('TRACK');
      setGenre('');
      setBpm('');
      setMusicalKey('');
      setDurationSec('');
      setPersonalPrice('');
      setCommercialPrice('');
      setUnlimitedPrice('');
      setAudioFile(null);
      setPreviewFile(null);
      setCoverFile(null);

      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Įvyko klaida');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-card">
        <p className="auth-kicker">Atlikėjo zona</p>
        <h2>Įkelti kūrinį</h2>
        <p className="auth-text">
          Įkelk pilną failą, trumpą preview iki 30 sekundžių ir viršelį.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Pavadinimas</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Pvz. Dark Trap Beat"
          />

          <label>Aprašymas</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Trumpas kūrinio aprašymas"
          />

          <label>Tipas</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'TRACK' | 'LOOP' | 'SAMPLE')}
          >
            <option value="TRACK">Track</option>
            <option value="LOOP">Loop</option>
            <option value="SAMPLE">Sample</option>
          </select>

          <label>Žanras</label>
          <input
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="Pvz. Trap"
          />

          <div className="upload-grid">
            <div>
              <label>BPM</label>
              <input
                type="number"
                value={bpm}
                onChange={(e) => setBpm(e.target.value)}
                placeholder="140"
              />
            </div>

            <div>
              <label>Tonacija</label>
              <input
                type="text"
                value={musicalKey}
                onChange={(e) => setMusicalKey(e.target.value)}
                placeholder="C#m"
              />
            </div>
          </div>

          <label>Trukmė sekundėmis</label>
          <input
            type="number"
            value={durationSec}
            onChange={(e) => setDurationSec(e.target.value)}
            placeholder="120"
          />

          <div className="price-section">
            <h3>Licencijų kainos (€)</h3>

            <label>Personal</label>
            <input
              type="number"
              step="0.01"
              value={personalPrice}
              onChange={(e) => setPersonalPrice(e.target.value)}
              placeholder="29"
            />

            <label>Commercial</label>
            <input
              type="number"
              step="0.01"
              value={commercialPrice}
              onChange={(e) => setCommercialPrice(e.target.value)}
              placeholder="79"
            />

            <label>Unlimited</label>
            <input
              type="number"
              step="0.01"
              value={unlimitedPrice}
              onChange={(e) => setUnlimitedPrice(e.target.value)}
              placeholder="199"
            />
          </div>

          <label>Pilnas audio failas</label>
          <input
            type="file"
            accept=".mp3,.wav,.mpeg,audio/*"
            onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
          />

          <label>Preview failas (iki 30 s)</label>
          <input
            type="file"
            accept=".mp3,.wav,.mpeg,audio/*"
            onChange={handlePreviewChange}
          />

          <label>Cover nuotrauka</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Keliama...' : 'Įkelti kūrinį'}
          </button>
        </form>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}