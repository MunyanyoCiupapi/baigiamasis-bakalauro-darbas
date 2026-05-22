import { Link, NavLink, useNavigate } from 'react-router-dom';
import { clearAuth, getUser, isLoggedIn } from '../utils/auth';

export default function Navbar() {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const user = getUser();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
    window.location.reload();
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo">
          Bakis<span className="logo-accent">Music</span>
        </Link>

        <nav className="nav-links">
          {loggedIn && (
            <>
              <NavLink
                to="/"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                Pagrindinis
              </NavLink>

              {user?.role === 'ARTIST' && (
                <>
                  <NavLink
                    to="/my-uploads"
                    className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  >
                    Mano kūriniai
                  </NavLink>
                  <NavLink
                    to="/my-sales"
                    className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  >
                    Mano pardavimai
                  </NavLink>
                </>
              )}

              <NavLink
                to="/my-purchases"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                Mano pirkimai
              </NavLink>

              <NavLink
                to="/messages"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                Žinutės
              </NavLink>
            </>
          )}

          {!loggedIn && (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                Prisijungti
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                Registruotis
              </NavLink>
            </>
          )}

          {loggedIn && user && (
            <div className="user-nav-box">
              <span className="user-nav-name">
                {user.displayName} ({user.role})
              </span>
              <button className="logout-button" onClick={handleLogout}>
                Atsijungti
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}