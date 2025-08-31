import { Link, useLocation } from "react-router-dom";
import { useDevice } from "../../contexts/DeviceContext";
import { useState } from "react";

function Header() {
  const location = useLocation();
  const { isMobile } = useDevice();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="relative flex w-full h-15 max-md:h-10">
      <nav className={`w-full px-5 flex items-center justify-between !h-full bg-[var(--bg-main)] opacity-100 z-100 border-b border-[var(--border-color)]/50`}>
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
        
        {!isMobile ? (
          <div className="flex items-center px-2 space-x-6">
            <Link
              to="/start-design"
              className={`font-medium focus:outline-none transition-colors text-lg ${
                location.pathname === '/start-design' 
                  ? 'text-[var(--accent)]' 
                  : 'text-[var(--text-secondary)] hover:opacity-50'
              }`}
            >
              Studio
            </Link>
            <Link
              to="/about"
              className={`font-medium focus:outline-none transition-colors text-lg ${
                location.pathname === '/about' 
                  ? 'text-[var(--accent)]' 
                  : 'text-[var(--text-secondary)] hover:opacity-50'
              }`}
            >
              About
            </Link>
          </div>
        ) : (
          <div className="relative">
            {/* Hamburger Button */}
            <button
              onClick={toggleMenu}
              className="py-2 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  // X icon when menu is open
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  // Hamburger icon when menu is closed
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg shadow-lg z-50">
                <div className="py-2">
                  <Link
                    to="/start-design"
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-2 text-sm transition-colors ${
                      location.pathname === '/start-design'
                        ? 'text-[var(--accent)] bg-[var(--hover-bg)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--hover-bg)]'
                    }`}
                  >
                    Studio
                  </Link>
                  <Link
                    to="/about"
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-2 text-sm transition-colors ${
                      location.pathname === '/about'
                        ? 'text-[var(--accent)] bg-[var(--hover-bg)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--hover-bg)]'
                    }`}
                  >
                    About
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;
