
import { LOGO } from "../utils/constant";
import { useEffect, useState } from "react";

const Header = () => {
  const [videoActive, setVideoActive] = useState(false);

  useEffect(() => {
    const checkVideo = () => {
      const videos = document.querySelectorAll("video");

      setVideoActive(
        Array.from(videos).some(
          (video) =>
            video.readyState >= 2 &&
            !video.paused &&
            video.currentSrc
        )
      );
    };

    checkVideo();

    const videos = document.querySelectorAll("video");

    videos.forEach((video) => {
      video.addEventListener("playing", checkVideo);
      video.addEventListener("pause", checkVideo);
      video.addEventListener("ended", checkVideo);
      video.addEventListener("loadeddata", checkVideo);
    });

    const observer = new MutationObserver(checkVideo);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      videos.forEach((video) => {
        video.removeEventListener("playing", checkVideo);
        video.removeEventListener("pause", checkVideo);
        video.removeEventListener("ended", checkVideo);
        video.removeEventListener("loadeddata", checkVideo);
      });

      observer.disconnect();
    };
  }, []);

  return (
    <header
      className={`relative z-50 w-full border-b backdrop-blur-xl transition-colors duration-300 ${
        videoActive
          ? "border-white/20 bg-slate-100/80 shadow-md"
          : "border-slate-200/80 bg-white/95 shadow-sm"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-center px-4 py-3 sm:px-6 lg:px-8">
          <img
            src={LOGO}
            alt="SkyCast Logo"
            className="h-12 w-12 object-contain sm:h-14 sm:w-14"
          />

          <h1 className="whitespace-nowrap text-2xl font-extrabold tracking-tight text-slate-800 sm:text-3xl">
            Sky<span className="text-sky-500">Cast</span>
          </h1>
      </nav>
    </header>
  );
};

export default Header;
