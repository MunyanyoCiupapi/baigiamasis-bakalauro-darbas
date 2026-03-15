import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api/authApi';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'ARTIST'>('USER');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const result = await registerUser({
        displayName,
        email,
        password,
        role,
      });

      setMessage(result.message || 'Registracija sėkminga');

      setTimeout(() => {
        navigate('/login');
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Įvyko klaida');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="auth-kicker">Nauja paskyra</p>
        <h2>Registracija</h2>
        <p className="auth-text">
          Susikurk paskyrą ir pradėk naudotis muzikos platforma.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Vardas</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Įveskite vardą"
          />

          <label>El. paštas</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Įveskite el. paštą"
          />

          <label>Slaptažodis</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Įveskite slaptažodį"
          />

          <label>Paskyros tipas</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'USER' | 'ARTIST')}
          >
            <option value="USER">Vartotojas</option>
            <option value="ARTIST">Atlikėjas</option>
          </select>

          <button type="submit">Registruotis</button>
        </form>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}