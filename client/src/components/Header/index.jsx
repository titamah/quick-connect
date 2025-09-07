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
    <header className="sticky top-0 z-5000 flex w-full h-15 max-md:h-10">
      <nav
        className={`w-full px-5 flex items-center justify-between !h-full ${location.pathname === "/" ? "bg-[var(--accent)] " : "bg-[var(--bg-main)]"} opacity-100 z-100 border-b border-[var(--border-color)]/50`}
      >
        <div className="flex items-center">
          <Link
            to="/"
            className="text-4xl font-black hover:opacity-80 transition-opacity"
            aria-label="Brand"
          >
            <h1 className={`!font-[var(--font-rubik-mono)] ${
                location.pathname === "/"
                  ? " text-[var(--brand-yellow)] "
                  : " text-[var(--accent)] "
              }`}>QRKI</h1>
          </Link>
        </div>
        {!isMobile ? (
          <div className="flex items-center px-2 space-x-6">
            <Link
              to="/start-design"
              className={`inline-flex items-center justify-center bg-[var(--brand-green)] gap-2.5 py-2 px-4 relative flex-[0_0_auto] rounded-[75px] border-[0.5px] border-solid border-neutral-900 hover:opacity-90 transition-opacity`}
            >
              <span className="relative w-fit font-normal text-neutral-900 text-md sm:text-lg tracking-[0] leading-[normal] whitespace-nowrap">
                START QREATING
              </span>
            </Link>
          </div>
        ) : (
          <div className="relative">
            {}
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
            {}
            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg shadow-lg z-50">
                <div className="py-2">
                  <Link
                    to="/start-design"
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-2 text-sm transition-colors ${
                      location.pathname === "/start-design"
                        ? "text-[var(--accent)] bg-[var(--hover-bg)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--hover-bg)]"
                    }`}
                  >
                    Studio
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
