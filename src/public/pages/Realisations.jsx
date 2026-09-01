"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Film,
  Image as ImageIcon,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

const API_URL = "";

/* ============================================================
   MEDIA HELPERS
============================================================ */

function isVideoUrl(value) {
  if (!value) return false;

  const src = String(
    typeof value === "object"
      ? value.url ||
          value.file ||
          value.src ||
          value.path ||
          ""
      : value
  )
    .trim()
    .toLowerCase();

  return (
    /\.(mp4|webm|mov|m4v|ogv|ogg|avi|mkv)(\?|$)/.test(src) ||
    src.includes("video/")
  );
}

function resolveMediaUrl(value) {
  if (!value) return "";

  let source = value;

  if (typeof value === "object" && value !== null) {
    source =
      value.url ||
      value.cover ||
      value.coverUrl ||
      value.cover_url ||
      value.facade_cover ||
      value.file ||
      value.src ||
      value.path ||
      value.image ||
      value.imageUrl ||
      "";
  }

  const raw = String(source || "").trim();

  if (!raw || raw === "[object Object]") {
    return "";
  }

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:") ||
    raw.startsWith("blob:")
  ) {
    return raw;
  }

  if (raw.startsWith("/")) {
    return API_URL ? `${API_URL}${raw}` : raw;
  }

  const endpoint = `/api/media/file/${encodeURIComponent(raw)}`;

  return API_URL ? `${API_URL}${endpoint}` : endpoint;
}

function extractFacadeCover(facade) {
  if (!facade) return "";

  const direct =
    facade.cover ||
    facade.coverUrl ||
    facade.cover_url ||
    facade.facade_cover ||
    facade.facadeCover ||
    facade.file ||
    facade.url ||
    facade.image ||
    facade.src;

  const cover = resolveMediaUrl(direct);

  if (cover) return cover;

  const collections = [
    facade.images,
    facade.photos,
    facade.files,
  ];

  for (const collection of collections) {
    if (Array.isArray(collection) && collection.length) {
      const result = resolveMediaUrl(collection[0]);

      if (result) return result;
    }
  }

  return "";
}

/* ============================================================
   CARD MEDIA COMPONENT
============================================================ */

function Media({
  src,
  alt = "",
  style,
  className = "",
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imageRef = useRef(null);

  const video = isVideoUrl(src);

  useEffect(() => {
    setLoaded(false);
    setError(false);

    if (
      !video &&
      imageRef.current?.complete &&
      imageRef.current?.naturalWidth
    ) {
      setLoaded(true);
    }
  }, [src, video]);

  if (!src || error) {
    return (
      <div
        style={style}
        className={`${className} flex items-center justify-center bg-neutral-900 text-neutral-400`}
      >
        {video ? (
          <Film className="text-white/20" size={28} />
        ) : (
          <ImageIcon className="text-white/20" size={28} />
        )}
      </div>
    );
  }

  if (video) {
    return (
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        style={style}
        className={`${className} object-cover`}
        onLoadedData={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <img
      ref={imageRef}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      style={style}
      className={`${className} transition-opacity duration-500 ${
        loaded ? "opacity-100" : "opacity-90"
      }`}
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
    />
  );
}

/* ============================================================
   CUSTOM FRIENDLY VIDEO PLAYER (FULLSCREEN CENTERING & CONTINUITY)
============================================================ */

const videoTimeCache = new Map();

function FriendlyVideoPlayer({ src, className = "" }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const controlsTimeoutRef = useRef(null);

  // Monitor fullscreen state changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Restore previous timestamp on mount / source change
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const savedTime = videoTimeCache.get(src) || 0;
    if (savedTime && Number.isFinite(savedTime)) {
      video.currentTime = savedTime;
    }

    const handleTimeUpdate = () => {
      if (!video) return;
      setCurrentTime(video.currentTime);
      videoTimeCache.set(src, video.currentTime);
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      if (!video) return;
      setDuration(video.duration || 0);
      const cached = videoTimeCache.get(src);
      if (cached && Number.isFinite(cached)) {
        video.currentTime = cached;
      }
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      if (video) {
        videoTimeCache.set(src, video.currentTime);
      }
    };
  }, [src]);

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
      setShowControls(true);
    }
  };

  const toggleMute = (e) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const seekTime = pos * duration;
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
    videoTimeCache.set(src, seekTime);
  };

  const toggleFullscreen = (e) => {
    if (e) e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      }
    }
  };

  // MOUSE ACTIVITY: Hide immediately on leave, hide after 1.8s if mouse stays still
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 1800);
  };

  const handleMouseLeave = () => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      setShowControls(false);
    }
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      ref={containerRef}
      className={`group/player relative flex items-center justify-center overflow-hidden bg-black select-none ${
        isFullscreen ? "h-screen w-screen rounded-none" : "rounded-2xl"
      } ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onContextMenu={(e) => e.preventDefault()}
      onDoubleClick={toggleFullscreen}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        playsInline
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        className={`object-contain shadow-2xl transition-all duration-200 ${
          isFullscreen
            ? "h-full w-full max-h-screen max-w-screen"
            : "max-h-[72vh] max-w-[80vw]"
        }`}
      />

      {/* BIG CENTER PLAY BUTTON WHEN PAUSED */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600/90 text-white shadow-2xl backdrop-blur-md">
            <Play size={26} className="ml-1 fill-white" />
          </div>
        </div>
      )}

      {/* SLEEK FLOATING BOTTOM CONTROLS (AUTO-HIDE ON LEAVE / IDLE) */}
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => {
          if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
          setShowControls(true);
        }}
        className={`absolute bottom-4 left-4 right-4 z-30 mx-auto flex max-w-4xl flex-col gap-2 rounded-xl bg-black/75 px-4 py-2.5 backdrop-blur-md transition-all duration-300 ${
          showControls || !isPlaying
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        {/* PROGRESS BAR */}
        <div
          onClick={handleSeek}
          className="relative h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-white/25 transition-all hover:h-2.5"
        >
          <div
            className="h-full bg-red-600 rounded-full transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="p-1 hover:text-red-400 transition"
              aria-label={isPlaying ? "Pause" : "Lecture"}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} className="fill-white" />}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className="p-1 hover:text-red-400 transition"
              aria-label={isMuted ? "Activer le son" : "Couper le son"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            <span className="text-[11px] font-mono text-white/70">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1 hover:text-red-400 transition"
            aria-label={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
          >
            {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   GALLERY MODAL
============================================================ */

function ProjectGallery({ project, onClose }) {
  const [current, setCurrent] = useState(0);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hideDetails, setHideDetails] = useState(false);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const cover = extractFacadeCover(project);

  useEffect(() => {
    let cancelled = false;

    const rawSubimages = Array.isArray(project?.subimages)
      ? project.subimages
          .map(resolveMediaUrl)
          .filter(Boolean)
      : [];

    // Initial with Facade cover as the very first item
    const combinedInitial = [];
    if (cover) combinedInitial.push(cover);
    rawSubimages.forEach((item) => {
      if (item !== cover) combinedInitial.push(item);
    });

    if (combinedInitial.length > 0) {
      setImages(combinedInitial);
      return;
    }

    async function loadImages() {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/api/media/gallery/subimages`,
          { cache: "no-store" }
        );

        if (!response.ok) return;

        const data = await response.json();

        if (cancelled) return;

        if (
          data?.success &&
          Array.isArray(data.subimages) &&
          (data.facadeIndex == null ||
            data.facadeIndex === project?.index)
        ) {
          const urls = data.subimages
            .map((item) =>
              resolveMediaUrl(
                item?.url ||
                  item?.file ||
                  item
              )
            )
            .filter(Boolean);

          const fullList = [];
          if (cover) fullList.push(cover);
          urls.forEach((u) => {
            if (u !== cover) fullList.push(u);
          });

          if (fullList.length > 0) {
            setImages(fullList);
          }
        }
      } catch (error) {
        console.error("Gallery error:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadImages();

    return () => {
      cancelled = true;
    };
  }, [project, cover]);

  const gallery =
    images.length > 0
      ? images
      : cover
      ? [cover]
      : [];

  const next = useCallback(() => {
    if (gallery.length < 2) return;

    setCurrent((value) =>
      value === gallery.length - 1 ? 0 : value + 1
    );
  }, [gallery.length]);

  const previous = useCallback(() => {
    if (gallery.length < 2) return;

    setCurrent((value) =>
      value === 0 ? gallery.length - 1 : value - 1
    );
  }, [gallery.length]);

  useEffect(() => {
    const keyboard = (event) => {
      if (document.fullscreenElement) return; // let browser handle escape in fullscreen
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") previous();
    };

    window.addEventListener("keydown", keyboard);

    return () =>
      window.removeEventListener("keydown", keyboard);
  }, [next, previous, onClose]);

  const active = gallery[current] || cover;
  const isCurrentVideo = isVideoUrl(active);

  const hasTitle = Boolean(project?.title && project.title.trim());
  const hasDescription = Boolean(project?.description && project.description.trim());
  const hasAnyText = hasTitle || hasDescription;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 backdrop-blur-md sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* CLOSE */}
      <button
        type="button"
        onClick={onClose}
        className="fixed right-5 top-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition hover:bg-white/20"
        aria-label="Fermer"
      >
        <X size={21} />
      </button>

      {/* NAVIGATION */}
      {gallery.length > 1 && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              previous();
            }}
            className="fixed left-3 top-1/2 z-50 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition hover:bg-red-600 sm:left-6"
            aria-label="Média précédent"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              next();
            }}
            className="fixed right-3 top-1/2 z-50 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition hover:bg-red-600 sm:right-6"
            aria-label="Média suivant"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* CONTENT */}
      <div
        className="flex max-h-[90vh] max-w-[86vw] flex-col items-center"
        onClick={(event) => event.stopPropagation()}
      >
        {loading ? (
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : active ? (
          <div
            className="relative flex items-center justify-center cursor-pointer"
            onClick={() => hasAnyText && setHideDetails((prev) => !prev)}
            title={hasAnyText ? "Cliquez pour afficher/masquer les détails" : undefined}
          >
            {isCurrentVideo ? (
              <FriendlyVideoPlayer
                key={active}
                src={active}
              />
            ) : (
              <motion.img
                key={active}
                src={active}
                alt={project?.title || "Projet"}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="max-h-[72vh] max-w-[80vw] rounded-2xl bg-black/20 object-contain shadow-2xl select-none"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </div>
        ) : (
          <div className="text-sm text-white/50">
            Aucun média disponible
          </div>
        )}

        {/* DETAILS SECTION - DISAPPEARS WHEN PRESSED OR WHEN EMPTY */}
        <AnimatePresence>
          {hasAnyText && !hideDetails && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              onClick={() => setHideDetails(true)}
              className="mt-3 max-w-xl cursor-pointer rounded-xl bg-black/40 px-4 py-2 text-center text-white backdrop-blur-sm transition hover:bg-black/60"
            >
              {hasTitle && (
                <h3 className="text-sm font-semibold sm:text-base">
                  {project.title.trim()}
                </h3>
              )}

              {hasDescription && (
                <p className="mt-0.5 max-w-lg text-xs text-white/75 sm:text-sm">
                  {project.description.trim()}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* THUMBNAIL TRACK - FIRST ITEM IS THE FACADE COVER */}
        {gallery.length > 1 && (
          <div className="mt-3 flex max-w-[80vw] gap-2 overflow-x-auto p-1">
            {gallery.map((image, index) => {
              const itemIsVideo = isVideoUrl(image);
              const isFacadeCover = index === 0;

              return (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setCurrent(index)}
                  className={`group relative h-12 w-16 shrink-0 overflow-hidden rounded-md transition ${
                    current === index
                      ? "scale-105 ring-2 ring-red-500 shadow-md"
                      : "opacity-40 hover:opacity-80"
                  }`}
                  aria-label={`Afficher le média ${index + 1}`}
                >
                  {itemIsVideo ? (
                    <div className="relative flex h-full w-full items-center justify-center bg-black/70">
                      <video
                        src={image}
                        muted
                        className="h-full w-full object-cover"
                      />
                      <Play
                        size={12}
                        className="absolute fill-white text-white drop-shadow"
                      />
                    </div>
                  ) : (
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}

                  {isFacadeCover && (
                    <span className="absolute bottom-0.5 left-0.5 rounded bg-black/70 px-1 py-0.2 text-[8px] font-bold uppercase text-white backdrop-blur-sm">
                      Façade
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ============================================================
   REALISATIONS PAGE COMPONENT
============================================================ */

export default function Realisations() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [hiddenTextCards, setHiddenTextCards] = useState({});

  const toggleCardText = (index, e) => {
    if (e) e.stopPropagation();
    setHiddenTextCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  /* ==========================================================
     CROP CALCULATIONS
  ========================================================== */

  const getCropStyle = useCallback((item) => {
    if (!item) {
      return {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center",
      };
    }

    const x = Number(item.x ?? 50);
    const y = Number(item.y ?? 50);
    const zoom = Number(item.zoom ?? 1);
    const width = Number(item.width);
    const height = Number(item.height);
    const offsetX = Number(item.offsetX ?? 0);
    const offsetY = Number(item.offsetY ?? 0);

    if (
      Number.isFinite(width) &&
      width > 0 &&
      width < 100 &&
      Number.isFinite(height) &&
      height > 0 &&
      height < 100
    ) {
      const leftCrop = x - width / 2;
      const topCrop = y - height / 2;

      return {
        position: "absolute",
        left: `${-(leftCrop / width) * 100}%`,
        top: `${-(topCrop / height) * 100}%`,
        width: `${(100 / width) * 100}%`,
        height: `${(100 / height) * 100}%`,
        maxWidth: "none",
        maxHeight: "none",
        objectFit: "fill",
      };
    }

    const posX = Math.max(0, Math.min(100, x + offsetX));
    const posY = Math.max(0, Math.min(100, y + offsetY));

    return {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: `${posX}% ${posY}%`,
      transform: zoom > 1 ? `scale(${zoom})` : undefined,
      transformOrigin: `${posX}% ${posY}%`,
    };
  }, []);

  /* ==========================================================
     FETCH PROJECTS
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_URL}/api/media/gallery/facade`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (cancelled) return;

        const facades = Array.isArray(data?.facades)
          ? data.facades
          : Array.isArray(data?.gallery?.facade)
          ? data.gallery.facade
          : Array.isArray(data?.gallery?.facades)
          ? data.gallery.facades
          : Array.isArray(data)
          ? data
          : data?.facade
          ? [data.facade]
          : [];

        const formatted = facades
          .map((facade, index) => {
            const projectIndex =
              facade?.index != null &&
              !Number.isNaN(Number(facade.index))
                ? Number(facade.index)
                : index + 1;

            const cover = extractFacadeCover(facade);

            const subimages = Array.isArray(facade.subimages)
              ? facade.subimages
                  .map(resolveMediaUrl)
                  .filter(Boolean)
              : [];

            return {
              ...facade,

              id: facade.id || `facade-${projectIndex}`,
              index: projectIndex,

              cover,
              file: cover,
              url: cover,

              x: facade.x != null ? Number(facade.x) : 50,
              y: facade.y != null ? Number(facade.y) : 50,
              width: Number(facade.width) || undefined,
              height: Number(facade.height) || undefined,
              zoom: Number(facade.zoom) || 1,
              offsetX: Number(facade.offsetX) || 0,
              offsetY: Number(facade.offsetY) || 0,

              title:
                typeof facade.title === "string"
                  ? facade.title.trim()
                  : "",

              description:
                typeof facade.description === "string"
                  ? facade.description.trim()
                  : "",

              subimages: subimages.length
                ? subimages
                : cover
                ? [cover]
                : [],
            };
          })
          .filter((item) => item.cover || item.file)
          .sort((a, b) => a.index - b.index);

        setProjects(formatted);
      } catch (err) {
        console.error("Error loading realisations:", err);
        setError(
          "Impossible de charger les réalisations depuis le serveur."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleProjects = showAll ? projects : projects.slice(0, 8);

  /* ==========================================================
     UI RENDER
  ========================================================== */

  return (
    <main className="bg-white text-[#171717]">
      {/* ======================================================
          COMPACT INTRO
      ====================================================== */}

      <header className="px-6 pb-8 pt-10 sm:px-10 sm:pb-10 sm:pt-12 lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-red-600">
            <span className="h-px w-6 bg-red-600" />
            Réalisations
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl lg:text-5xl">
              Des chantiers tenus,
              <span className="text-[#999]">
                {" "}
                une confiance gagnée.
              </span>
            </h1>

            <p className="max-w-sm text-xs leading-5 text-[#777] sm:text-right">
              Découvrez quelques-unes de nos réalisations en façade et
              isolation thermique.
            </p>
          </div>
        </div>
      </header>

      {/* ======================================================
          PROJECTS
      ====================================================== */}

      <section className="px-6 pb-14 sm:px-10 sm:pb-16 lg:px-16 lg:pb-20">
        <div className="mx-auto max-w-[1440px]">
          {/* LOADING */}
          {loading && (
            <div className="grid gap-5 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[4/3] animate-pulse rounded-2xl bg-[#eeeeee]"
                />
              ))}
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-10 text-center">
              <p className="text-sm font-medium">{error}</p>
              <p className="mt-2 text-xs text-[#888]">
                Vérifiez la connexion au serveur puis rechargez la page.
              </p>
            </div>
          )}

          {/* EMPTY */}
          {!loading && !error && projects.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#ddd] bg-[#fafafa] p-12 text-center">
              <p className="text-sm font-medium">
                Aucune réalisation enregistrée.
              </p>
            </div>
          )}

          {/* GRID */}
          {!loading && !error && visibleProjects.length > 0 && (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                {visibleProjects.map((project, index) => {
                  const image =
                    project.cover ||
                    project.file ||
                    project.url;

                  const video = isVideoUrl(image);

                  const titleText = (project.title || "").trim();
                  const descText = (project.description || "").trim();
                  const hasContent = Boolean(titleText || descText);
                  const isTextHidden = Boolean(hiddenTextCards[index]);

                  return (
                    <article
                      key={project.id || index}
                      onClick={() => setSelected(project)}
                      className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl bg-neutral-900 shadow-sm transition-all duration-300 hover:shadow-2xl"
                    >
                      <Media
                        src={image}
                        alt={titleText || "Projet"}
                        style={getCropStyle(project)}
                        className="transition-transform duration-700 ease-out group-hover:scale-105"
                      />

                      {/* OVERLAY */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent transition-opacity duration-300 ${
                          isTextHidden
                            ? "opacity-20 group-hover:opacity-40"
                            : "opacity-70 group-hover:opacity-90"
                        }`}
                      />

                      {/* VIDEO PLAY BADGE */}
                      {video && (
                        <div className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md">
                          <Play size={13} className="translate-x-0.5 fill-white" />
                        </div>
                      )}

                      {/* TEXT VISIBILITY TOGGLE BUTTON (SHOWN IF TEXT EXISTS) */}
                      {hasContent && (
                        <button
                          type="button"
                          onClick={(e) => toggleCardText(index, e)}
                          className="absolute left-4 top-4 z-30 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition hover:bg-white/20 active:scale-95"
                          title={isTextHidden ? "Afficher les textes" : "Masquer les textes"}
                        >
                          {isTextHidden ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                      )}

                      {/* INFO SECTION */}
                      <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-4 p-5 text-white sm:p-6">
                        <div className="min-w-0 max-w-[80%]">
                          <AnimatePresence>
                            {hasContent && !isTextHidden && (
                              <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 6 }}
                                transition={{ duration: 0.18 }}
                              >
                                {titleText && (
                                  <h2 className="text-base font-semibold leading-snug sm:text-lg">
                                    {titleText}
                                  </h2>
                                )}

                                {descText && (
                                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/80 sm:text-sm">
                                    {descText}
                                  </p>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition-all duration-300 group-hover:border-red-500 group-hover:bg-red-600">
                          <ArrowUpRight
                            size={17}
                            className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* SHOW ALL BUTTON */}
              {projects.length > 8 && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowAll((value) => !value)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#ddd] px-6 py-3 text-xs font-semibold transition hover:border-red-600 hover:text-red-600"
                  >
                    {showAll ? (
                      <>
                        Afficher moins
                        <ChevronUp size={16} />
                      </>
                    ) : (
                      <>
                        Voir toutes les réalisations
                        <ChevronDown size={16} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ======================================================
          GALLERY MODAL
      ====================================================== */}

      <AnimatePresence>
        {selected && (
          <ProjectGallery
            project={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}