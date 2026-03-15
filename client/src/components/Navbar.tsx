import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo">
          Bakis<span className="logo-accent">Music</span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Pagrindinis
          </NavLink>
          <NavLink to="/login" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Prisijungti
          </NavLink>
          <NavLink to="/register" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Registruotis
          </NavLink>
        </nav>
      </div>
    </header>
  );
}