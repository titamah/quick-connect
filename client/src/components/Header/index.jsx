import { Link, useLocation } from "react-router-dom";

function Header() {
  const location = useLocation();

  return (
    <header className="relative flex w-full h-15">
      <nav className="w-full px-5 flex items-center justify-between !h-full bg-[var(--bg-main)] opacity-100 z-100 border-b border-[var(--border-color)]/50">
        <div className="flex items-center">
          <Link
            to="/"
            className="text-4xl font-black text-[var(--accent)] hover:opacity-80 transition-opacity"
            aria-label="Brand"
          >
            <h1>
            QRKI
            </h1>
          </Link>
        </div>
        
        <div className="flex items-center px-2 space-x-6">
          <Link
            to="/studio"
            className={`font-medium focus:outline-none transition-colors ${
              location.pathname === '/studio' 
                ? 'text-[var(--accent)]' 
                : 'text-[var(--text-secondary)] hover:opacity-50'
            }`}
          >
            Studio
          </Link>
          <Link
            to="/gallery"
            className={`font-medium focus:outline-none transition-colors ${
              location.pathname === '/gallery' 
                ? 'text-[var(--accent)]' 
                : 'text-[var(--text-secondary)] hover:opacity-50'
            }`}
          >
            Gallery
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Header;
