
import { LOGO } from "../utils/constant";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  // Hide the header on the Browse/weather page
  const isBrowsePage =
    location.pathname.toLowerCase().includes("browse") ||
    location.hash.toLowerCase().includes("forecast");

  if (isBrowsePage) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100/80 bg-white/95 shadow-sm backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-center px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          aria-label="SkyCast home"
          className="flex items-center justify-center gap-3"
        >
          <img
            src={LOGO}
            alt="SkyCast Logo"
            className="h-12 w-12 object-contain sm:h-14 sm:w-14"
          />

          <h1 className="whitespace-nowrap text-2xl font-extrabold tracking-tight text-slate-800 sm:text-3xl">
            Sky<span className="text-sky-500">Cast</span>
          </h1>
        </Link>
      </nav>
    </header>
  );
};

export default Header;
