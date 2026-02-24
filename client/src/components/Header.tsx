import { NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header className="header">
      <div className="header-brand">🎵 Melodify</div>
      <nav className="header-nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink>
        <NavLink to="/artists" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Artists</NavLink>
      </nav>
    </header>
  );
}
