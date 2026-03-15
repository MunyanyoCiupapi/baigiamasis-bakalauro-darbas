import { useState } from 'react';
import { loginUser } from '../api/authApi';

type LoggedUser = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState<LoggedUser | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setUser(null);

    try {
      const result = await loginUser({ email, password });
      setMessage(result.message || 'Prisijungimas sėkmingas');
      setUser(result.user);
    } catch (err: any) {
      setError(err.message || 'Įvyko klaida');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="auth-kicker">Jau turi paskyrą?</p>
        <h2>Prisijungimas</h2>
        <p className="auth-text">
          Prisijunk prie savo paskyros ir tęsk darbą platformoje.
        </p>

        <form onSubmit={handleSubmit}>
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

          <button type="submit">Prisijungti</button>
        </form>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        {user && (
          <div className="user-box">
            <h3>Prisijungęs vartotojas</h3>
            <p><strong>Vardas:</strong> {user.displayName}</p>
            <p><strong>El. paštas:</strong> {user.email}</p>
            <p><strong>Rolė:</strong> {user.role}</p>
          </div>
        )}
      </div>
    </div>
  );
}