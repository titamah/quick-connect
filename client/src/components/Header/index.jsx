import { Link, useLocation } from "react-router-dom";

function Header() {
  const location = useLocation();

  return (
    <header className="relative flex w-full bg-white shadow-md text-sm py-3 dark:bg-neutral-800">
      <nav className="w-full px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/"
            className="text-xl font-semibold dark:text-white focus:outline-none focus:opacity-80 hover:opacity-80 transition-opacity"
            aria-label="Brand"
          >
            Quick Connect
          </Link>
        </div>
        
        <div className="flex items-center space-x-6">
          <Link
            to="/studio"
            className={`font-medium focus:outline-none transition-colors ${
              location.pathname === '/studio' 
                ? 'text-[var(--accent)]' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Studio
          </Link>
          <Link
            to="/gallery"
            className={`font-medium focus:outline-none transition-colors ${
              location.pathname === '/gallery' 
                ? 'text-[var(--accent)]' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
