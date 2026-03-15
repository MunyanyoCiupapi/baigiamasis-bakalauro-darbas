import { Link } from 'react-router-dom';
import { getUser, isLoggedIn } from '../utils/auth';

export default function HomePage() {
  const loggedIn = isLoggedIn();
  const user = getUser();

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">Muzikos prekybos platforma</span>

          <h1 className="hero-title">
            Įkelk, parduok ir atrask{' '}
            <span className="gradient-text">beat’us, loop’us ir sample’us</span>
          </h1>

          <p className="hero-description">
            Platforma skirta atlikėjams ir pirkėjams. Čia galėsi talpinti muzikinius
            kūrinius, priskirti licencijas ir valdyti savo turinį vienoje vietoje.
          </p>

          {loggedIn && user ? (
            <div className="welcome-box">
              <h3>Sveikas sugrįžęs, {user.displayName}!</h3>
              <p>Prisijungta kaip: {user.role}</p>
            </div>
          ) : (
            <div className="hero-actions">
              <Link to="/register" className="primary-link-button">
                Pradėti dabar
              </Link>
              <Link to="/login" className="secondary-link-button">
                Prisijungti
              </Link>
            </div>
          )}
        </div>

        <div className="hero-card">
          <div className="mock-player">
            <div className="mock-top">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>

            <div className="mock-body">
              <p className="mock-label">Pavyzdinis kūrinys</p>
              <h3>Dark Trap Beat</h3>
              <p className="mock-meta">TRACK · 140 BPM · C#m</p>

              <div className="wave-lines">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="license-preview">
                <div className="license-row">
                  <span>Personal</span>
                  <strong>29 €</strong>
                </div>
                <div className="license-row">
                  <span>Commercial</span>
                  <strong>79 €</strong>
                </div>
                <div className="license-row">
                  <span>Unlimited</span>
                  <strong>199 €</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}