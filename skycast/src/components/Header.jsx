import { useState } from "react";
import { LOGO } from "../utils/constant";
import { Moon, Sun } from "lucide-react";

const Header = () => {
  const [isDark, setIsDark] = useState(false);

  const toggleButton = () => {
    setIsDark(!isDark);
  };

  return (
    <header
      className={`flex w-full items-center justify-between gap-4 px-4 py-3 sm:px-6 md:px-10 ${
        isDark ? "bg-slate-900" : "bg-gray-50"
      }`}
    >
      
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <img
          className="h-22 w-14 object-contain sm:h-16 sm:w-20"
          src={LOGO}
          alt="SkyCast Logo"
        />

        <h1 className="whitespace-nowrap text-xl font-bold text-blue-900 sm:text-3xl">
          Sky<span className="text-blue-500">Cast</span>
        </h1>
      </div>

      <div className="hidden md:block">
        <ul
          className={`flex items-center gap-8 whitespace-nowrap ${
            isDark ? "text-white" : "text-slate-800"
          }`}
        >
          <li>
            <a
              href="#home"
              className="cursor-pointer transition-colors hover:text-blue-500"
            >
              Home
            </a>
          </li>

          <li>
            <a
              href="#about"
              className="cursor-pointer transition-colors hover:text-blue-500"
            >
              About
            </a>
          </li>
        </ul>
      </div>

      {/* Right: Temperature and Theme Controls */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
          <button
            className="rounded-full bg-blue-600 px-3 py-2 text-sm font-semibold text-white sm:px-4"
            aria-label="Celsius"
          >
            °C
          </button>

          <button
            className="rounded-full px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-blue-100 sm:px-4"
            aria-label="Fahrenheit"
          >
            °F
          </button>
        </div>

        <button
          onClick={toggleButton}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className={`rounded-full p-2 transition-colors ${
            isDark
              ? "bg-slate-700 text-white hover:bg-slate-600"
              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
          }`}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
