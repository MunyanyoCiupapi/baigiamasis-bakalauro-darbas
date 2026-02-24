import { useEffect, useState } from 'react';
import type { Artist } from '../types';

export default function ArtistList() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3000/artists')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch artists');
        return r.json();
      })
      .then((data: Artist[]) => {
        setArtists(data);
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Loading artists...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="artist-grid">
      {artists.map((artist) => (
        <div key={artist.id} className="artist-card">
          <img src={artist.imageUrl} alt={artist.name} className="artist-image" />
          <div className="artist-info">
            <h3 className="artist-name">{artist.name}</h3>
            <span className="artist-genre">{artist.genre}</span>
            <p className="artist-bio">{artist.bio}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
