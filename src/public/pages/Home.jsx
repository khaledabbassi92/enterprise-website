"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronDown,
  Hammer,
  Layers3,
  Phone,
  ShieldCheck,
  Star,
  Wrench,
  X,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Film,
  Mail,
  MapPin,
  Eye,
  EyeOff,
  Quote,
} from "lucide-react";

import certificatImage from "./certificat.png";

/* ============================================================
   API CONFIGURATION
============================================================ */

const API_URL = "";

/* ============================================================
   CERTIFICATION / EXPERIENCE
============================================================ */

const EXPERT_NAME = "Mohsen Kasmi";
const EXPERIENCE_START_DATE = new Date(2020, 11, 11);

function calculateExperience(startDate) {
  const today = new Date();
  let years = today.getFullYear() - startDate.getFullYear();
  const anniversary = new Date(
    today.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  );

  if (today < anniversary) {
    years -= 1;
  }

  return Math.max(0, years);
}

/* ============================================================
   SERVICES DATA
============================================================ */

const services = [
  {
    id: "ravalement-facade",
    icon: Building2,
    title: "Ravalement de façade",
    text: "Nettoyage, réparation et rénovation pour retrouver une façade propre et en bon état.",
  },
  {
    id: "isolation-thermique",
    icon: Layers3,
    title: "Isolation par l'extérieur",
    text: "Améliorez le confort de votre maison tout en rénovant son extérieur.",
  },
  {
    id: "enduits-finitions",
    icon: Hammer,
    title: "Enduits & finitions",
    text: "Des finitions adaptées à votre maison et au rendu que vous souhaitez.",
  },
  {
    id: "reparation-supports",
    icon: Wrench,
    title: "Réparation de façade",
    text: "Fissures, petits dégâts ou façade abîmée : nous préparons le support avant les travaux.",
  },
];

/* ============================================================
   FAQ DATA
============================================================ */

const faqs = [
  {
    question: "Quel est le prix d'un ravalement de façade ?",
    answer:
      "Le prix dépend de la surface, de l'état de la façade, des réparations à prévoir et de la finition choisie. Le mieux est de regarder le chantier sur place pour vous proposer un devis adapté.",
  },
  {
    question: "Combien de temps durent les travaux ?",
    answer:
      "Cela dépend de la taille de la maison et des travaux à réaliser. Après avoir vu le chantier, nous pouvons vous donner une estimation du délai.",
  },
  {
    question:
      "L'isolation extérieure peut-elle être réalisée avec le ravalement ?",
    answer:
      "Oui, c'est même souvent l'occasion de faire les deux en même temps. Cela dépend toutefois de l'état de la façade et de la configuration de la maison.",
  },
  {
    question: "Comment se déroule un projet ?",
    answer:
      "On commence par regarder la façade et définir ce qu'il faut faire. Ensuite, nous préparons le support, réalisons les réparations et terminons par les finitions.",
  },
];

/* ============================================================
   REVEAL ANIMATION COMPONENT
============================================================ */

function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/* ============================================================
   SECTION HEADING
============================================================ */

function SectionHeading({
  eyebrow,
  title,
  text,
  center = false,
  light = false,
}) {
  return (
    <div className={`max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
      <div
        className={`mb-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] ${
          light ? "text-red-400" : "text-red-600"
        } ${center ? "justify-center" : ""}`}
      >
        <span
          className={`h-px w-8 ${
            light ? "bg-red-500" : "bg-red-600"
          }`}
        />
        {eyebrow}
      </div>

      <h2
        className={`text-4xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl lg:text-[56px] ${
          light ? "text-white" : "text-[#171717]"
        }`}
      >
        {title}
      </h2>

      {text && (
        <p
          className={`mt-6 text-[15px] leading-7 sm:text-base ${
            light ? "text-white/60" : "text-[#6f6f6f]"
          }`}
        >
          {text}
        </p>
      )}
    </div>
  );
}

/* ============================================================
   MEDIA TYPE CHECKER
============================================================ */

function isVideoUrl(value) {
  if (!value) return false;

  const str = String(
    typeof value === "object"
      ? value.url || value.file || value.src || value.path || ""
      : value
  )
    .trim()
    .toLowerCase();

  return (
    str.endsWith(".mp4") ||
    str.endsWith(".webm") ||
    str.endsWith(".mov") ||
    str.endsWith(".m4v") ||
    str.endsWith(".ogv") ||
    str.endsWith(".ogg") ||
    str.endsWith(".avi") ||
    str.endsWith(".mkv") ||
    str.includes("video/") ||
    str.includes(".mp4?") ||
    str.includes(".webm?") ||
    str.includes(".mov?")
  );
}

/* ============================================================
   MEDIA URL RESOLVER
============================================================ */

function resolveMediaUrl(value) {
  if (!value) return null;

  let candidate = value;

  if (typeof value === "object" && value !== null) {
    candidate =
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
      null;
  }

  if (!candidate) return null;

  const raw = String(candidate).trim();

  if (!raw || raw === "[object Object]") return null;

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:") ||
    raw.startsWith("blob:")
  ) {
    return raw;
  }

  if (raw.startsWith("/api/")) {
    return API_URL ? `${API_URL}${raw}` : raw;
  }

  if (raw.startsWith("/")) {
    return API_URL ? `${API_URL}${raw}` : raw;
  }

  const endpoint = `/api/media/file/${encodeURIComponent(raw)}`;

  return API_URL ? `${API_URL}${endpoint}` : endpoint;
}

/* ============================================================
   EXTRACT COVER FROM FACADE OBJECT
============================================================ */

function extractFacadeCover(facade) {
  if (!facade) return null;

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

  const resolved = resolveMediaUrl(direct);

  if (resolved) return resolved;

  if (Array.isArray(facade.images) && facade.images.length > 0) {
    return resolveMediaUrl(facade.images[0]);
  }

  if (Array.isArray(facade.photos) && facade.photos.length > 0) {
    return resolveMediaUrl(facade.photos[0]);
  }

  if (Array.isArray(facade.files) && facade.files.length > 0) {
    return resolveMediaUrl(facade.files[0]);
  }

  return null;
}

/* ============================================================
   IMAGE & VIDEO SLOT COMPONENT
============================================================ */

function SlotImage({ src, alt, style, className = "" }) {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const isVideo = isVideoUrl(src);

  useEffect(() => {
    setLoaded(false);
    setHasError(false);

    if (
      !isVideo &&
      imgRef.current &&
      imgRef.current.complete &&
      imgRef.current.naturalWidth > 0
    ) {
      setLoaded(true);
    }
  }, [src, isVideo]);

  if (!src || hasError) {
    return (
      <div
        style={style}
        className={`${className} flex items-center justify-center bg-neutral-900 text-neutral-400`}
      >
        <div className="flex flex-col items-center gap-2 p-4 text-center">
          {isVideo ? (
            <Film className="h-7 w-7 opacity-30" />
          ) : (
            <ImageIcon className="h-7 w-7 opacity-30" />
          )}
        </div>
      </div>
    );
  }

  if (isVideo) {
    return (
      <video
        src={src}
        style={style}
        autoPlay
        loop
        muted
        playsInline
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        className={`${className} object-cover transition-opacity duration-500 ease-out`}
        onLoadedData={() => setLoaded(true)}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt || "Illustration"}
      style={style}
      loading="lazy"
      decoding="async"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      className={`${className} transition-opacity duration-500 ease-out ${
        loaded ? "opacity-100" : "opacity-90"
      }`}
      onLoad={() => setLoaded(true)}
      onError={() => setHasError(true)}
    />
  );
}

/* ============================================================
   CUSTOM FRIENDLY VIDEO PLAYER
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

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener(
      "webkitfullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

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

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 1800);
  };

  const handleMouseLeave = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
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

      {!isPlaying && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600/90 text-white shadow-2xl backdrop-blur-md">
            <Play size={26} className="ml-1 fill-white" />
          </div>
        </div>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => {
          if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
          }
          setShowControls(true);
        }}
        className={`absolute bottom-4 left-4 right-4 z-30 mx-auto flex max-w-4xl flex-col gap-2 rounded-xl bg-black/75 px-4 py-2.5 backdrop-blur-md transition-all duration-300 ${
          showControls || !isPlaying
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        <div
          onClick={handleSeek}
          className="relative h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-white/25 transition-all hover:h-2.5"
        >
          <div
            className="h-full rounded-full bg-red-600 transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="p-1 transition hover:text-red-400"
              aria-label={isPlaying ? "Pause" : "Lecture"}
            >
              {isPlaying ? (
                <Pause size={16} />
              ) : (
                <Play size={16} className="fill-white" />
              )}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className="p-1 transition hover:text-red-400"
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
            className="p-1 transition hover:text-red-400"
            aria-label={
              isFullscreen ? "Quitter le plein écran" : "Plein écran"
            }
          >
            {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PROJECT GALLERY MODAL
============================================================ */

function ProjectGallery({ project, onClose }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [subimagesList, setSubimagesList] = useState([]);
  const [loadingSubimages, setLoadingSubimages] = useState(false);
  const [hideDetails, setHideDetails] = useState(false);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const coverImage = extractFacadeCover(project);

  useEffect(() => {
    let cancelled = false;

    const rawSubimages = Array.isArray(project?.subimages)
      ? project.subimages
      : [];

    const resolved = rawSubimages
      .map((item) => resolveMediaUrl(item))
      .filter(Boolean);

    const combinedInitial = [];

    if (coverImage) {
      combinedInitial.push(coverImage);
    }

    resolved.forEach((item) => {
      if (item !== coverImage) {
        combinedInitial.push(item);
      }
    });

    if (combinedInitial.length > 0) {
      setSubimagesList(combinedInitial);
      return;
    }

    const fetchSubimages = async () => {
      try {
        setLoadingSubimages(true);

        const response = await fetch(
          `${API_URL}/api/media/gallery/subimages`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) return;

        const data = await response.json();

        if (cancelled) return;

        if (
          data?.success &&
          Array.isArray(data.subimages) &&
          (data.facadeIndex === undefined ||
            data.facadeIndex === null ||
            data.facadeIndex === project?.index)
        ) {
          const urls = data.subimages
            .map((item) => resolveMediaUrl(item.url || item.file || item))
            .filter(Boolean);

          const fullList = [];

          if (coverImage) {
            fullList.push(coverImage);
          }

          urls.forEach((u) => {
            if (u !== coverImage) {
              fullList.push(u);
            }
          });

          if (fullList.length > 0) {
            setSubimagesList(fullList);
          }
        }
      } catch (err) {
        console.error("Error fetching gallery subimages:", err);
      } finally {
        if (!cancelled) {
          setLoadingSubimages(false);
        }
      }
    };

    fetchSubimages();

    return () => {
      cancelled = true;
    };
  }, [project, coverImage]);

  const galleryItems =
    subimagesList.length > 0
      ? subimagesList
      : coverImage
        ? [coverImage]
        : [];

  const nextImage = useCallback(() => {
    if (galleryItems.length <= 1) return;

    setCurrentImage((prev) =>
      prev === galleryItems.length - 1 ? 0 : prev + 1
    );
  }, [galleryItems.length]);

  const previousImage = useCallback(() => {
    if (galleryItems.length <= 1) return;

    setCurrentImage((prev) =>
      prev === 0 ? galleryItems.length - 1 : prev - 1
    );
  }, [galleryItems.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.fullscreenElement) return;

      if (e.key === "ArrowRight") {
        nextImage();
      }

      if (e.key === "ArrowLeft") {
        previousImage();
      }

      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextImage, previousImage, onClose]);

  const currentMediaUrl = galleryItems[currentImage] || coverImage;
  const isCurrentVideo = isVideoUrl(currentMediaUrl);

  const hasTitle = Boolean(project?.title && project.title.trim());
  const hasDescription = Boolean(
    project?.description && project.description.trim()
  );
  const hasAnyText = hasTitle || hasDescription;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 p-3 backdrop-blur-md sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="fixed right-5 top-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20"
        aria-label="Fermer"
      >
        <X size={22} />
      </button>

      {galleryItems.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              previousImage();
            }}
            className="fixed left-3 top-1/2 z-40 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-2xl backdrop-blur-md transition-all hover:scale-110 hover:border-red-500 hover:bg-red-600 active:scale-95 sm:left-6"
            aria-label="Média précédent"
          >
            <ChevronLeft size={26} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="fixed right-3 top-1/2 z-40 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-2xl backdrop-blur-md transition-all hover:scale-110 hover:border-red-500 hover:bg-red-600 active:scale-95 sm:right-6"
            aria-label="Média suivant"
          >
            <ChevronRight size={26} />
          </button>
        </>
      )}

      <div
        className="relative z-10 flex max-h-[90vh] max-w-[86vw] flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {loadingSubimages ? (
          <div className="flex flex-col items-center gap-3 py-12 text-white/70">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
          </div>
        ) : galleryItems.length > 0 ? (
          <div
            className="relative flex cursor-pointer items-center justify-center"
            onClick={() =>
              hasAnyText && setHideDetails((prev) => !prev)
            }
            title={
              hasAnyText
                ? "Cliquez pour afficher/masquer les détails"
                : undefined
            }
          >
            {isCurrentVideo ? (
              <FriendlyVideoPlayer
                key={currentMediaUrl}
                src={currentMediaUrl}
              />
            ) : (
              <motion.img
                key={currentMediaUrl}
                src={currentMediaUrl}
                alt={project?.title || "Projet"}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="max-h-[72vh] max-w-[80vw] select-none rounded-2xl bg-black/20 object-contain shadow-2xl"
                initial={{
                  opacity: 0,
                  scale: 0.98,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: 0.2,
                }}
              />
            )}
          </div>
        ) : (
          <div className="py-12 text-sm text-white/60">
            Aucun média disponible
          </div>
        )}

        <AnimatePresence>
          {hasAnyText && !hideDetails && (
            <motion.div
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -8,
              }}
              transition={{
                duration: 0.2,
              }}
              onClick={() => setHideDetails(true)}
              className="mt-3 max-w-xl cursor-pointer rounded-xl bg-black/40 px-4 py-2 text-center text-white backdrop-blur-sm transition hover:bg-black/60"
            >
              {hasTitle && (
                <h4 className="text-sm font-semibold text-white/95 sm:text-base">
                  {project.title.trim()}
                </h4>
              )}

              {hasDescription && (
                <p className="mt-0.5 text-xs text-white/75 sm:text-sm">
                  {project.description.trim()}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {galleryItems.length > 1 && (
          <div className="mt-3 flex max-w-[75vw] items-center gap-2 overflow-x-auto p-1">
            {galleryItems.map((imgUrl, idx) => {
              const itemIsVideo = isVideoUrl(imgUrl);
              const isFacadeCover = idx === 0;

              return (
                <button
                  key={`${imgUrl}-${idx}`}
                  type="button"
                  onClick={() => setCurrentImage(idx)}
                  className={`group relative h-12 w-16 shrink-0 overflow-hidden rounded-lg transition-all ${
                    currentImage === idx
                      ? "scale-105 opacity-100 ring-2 ring-red-500 shadow-md"
                      : "opacity-40 hover:opacity-80"
                  }`}
                  aria-label={`Afficher le média ${idx + 1}`}
                >
                  {itemIsVideo ? (
                    <div className="relative flex h-full w-full items-center justify-center bg-black/70">
                      <video
                        src={imgUrl}
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
                      src={imgUrl}
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
   MAIN HOMEPAGE COMPONENT
============================================================ */

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [hiddenTextCards, setHiddenTextCards] = useState({});

  const experienceYears = calculateExperience(EXPERIENCE_START_DATE);

  const toggleCardText = (index, e) => {
    if (e) e.stopPropagation();

    setHiddenTextCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  /* ==========================================================
     COMPANY INFORMATION
  ========================================================== */

  const [companyInfo, setCompanyInfo] = useState({
    phone: "",
    email: "",
    address: "",
  });

  /* ==========================================================
     HOMEPAGE MEDIA
  ========================================================== */

  const [slotImages, setSlotImages] = useState({
    banner: null,
    introduction: null,
    finale: null,
  });

  const [slotCrops, setSlotCrops] = useState({
    banner: {
      x: 50,
      y: 50,
      zoom: 1,
    },
    introduction: {
      x: 50,
      y: 50,
      zoom: 1,
    },
    finale: {
      x: 50,
      y: 50,
      zoom: 1,
    },
  });

  const [facades, setFacades] = useState([]);
  const [facadesLoading, setFacadesLoading] = useState(true);
  const [facadesError, setFacadesError] = useState(null);

  /* ==========================================================
     REVIEWS
  ========================================================== */

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState(null);

  /* ==========================================================
     RECORD HOMEPAGE VIEW (ANALYTICS)
  ========================================================== */

  useEffect(() => {
    if (!sessionStorage.getItem("mira_visited_session")) {
      sessionStorage.setItem("mira_visited_session", "true");
      fetch(`${API_URL}/api/views`, {
        method: "POST",
      }).catch(() => {});
    }
  }, []);

  /* ==========================================================
     LOAD COMPANY INFORMATION
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    const loadCompanyInfo = async () => {
      try {
        const response = await fetch(`${API_URL}/api/text`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            `Company information API returned ${response.status}`
          );
        }

        const result = await response.json();

        if (cancelled) return;

        const data = result?.data || result || {};

        setCompanyInfo({
          phone:
            typeof data.phone === "string" ? data.phone.trim() : "",
          email:
            typeof data.email === "string" ? data.email.trim() : "",
          address:
            typeof data.address === "string" ? data.address.trim() : "",
        });
      } catch (error) {
        console.error("Error fetching company information:", error);
      }
    };

    loadCompanyInfo();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ==========================================================
     PHONE LINK
  ========================================================== */

  const phoneHref = companyInfo.phone
    ? `tel:${companyInfo.phone.replace(/[^\d+]/g, "")}`
    : null;

  /* ==========================================================
     NORMALIZE FACADES
  ========================================================== */

  const normalizeFacades = useCallback((data) => {
    if (!data) return [];

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.facades)) {
      return data.facades;
    }

    if (Array.isArray(data?.gallery?.facade)) {
      return data.gallery.facade;
    }

    if (Array.isArray(data?.gallery?.facades)) {
      return data.gallery.facades;
    }

    if (data?.facade && typeof data.facade === "object") {
      return Array.isArray(data.facade) ? data.facade : [data.facade];
    }

    if (
      typeof data === "object" &&
      (data.file || data.url || data.cover || data.image)
    ) {
      return [data];
    }

    return [];
  }, []);

  /* ==========================================================
     LOAD HOMEPAGE SLOTS
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    const loadHomepageSlots = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/media/homepage-slots`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) return;

        const data = await response.json();
        const slots = data?.slots || data || {};

        const homepageSlots = ["banner", "introduction", "finale"];

        const nextImages = {};
        const nextCrops = {};

        homepageSlots.forEach((slotName) => {
          const slot = slots[slotName];

          let serverImage = null;

          if (slot && typeof slot === "object") {
            serverImage =
              resolveMediaUrl(slot.url) ||
              resolveMediaUrl(slot.file) ||
              resolveMediaUrl(slot.image) ||
              null;
          } else if (typeof slot === "string") {
            serverImage = resolveMediaUrl(slot);
          }

          if (serverImage) {
            nextImages[slotName] = serverImage;
          }

          nextCrops[slotName] = {
            x: slot?.x !== undefined ? Number(slot.x) : 50,
            y: slot?.y !== undefined ? Number(slot.y) : 50,
            zoom: slot?.zoom !== undefined ? Number(slot.zoom) : 1,
            width: slot?.width ? Number(slot.width) : undefined,
            height: slot?.height ? Number(slot.height) : undefined,
            offsetX: slot?.offsetX ? Number(slot.offsetX) : 0,
            offsetY: slot?.offsetY ? Number(slot.offsetY) : 0,
          };
        });

        if (cancelled) return;

        setSlotImages((prev) => ({
          ...prev,
          ...nextImages,
        }));

        setSlotCrops((prev) => ({
          ...prev,
          ...nextCrops,
        }));
      } catch (error) {
        console.error("Error loading homepage slots:", error);
      }
    };

    loadHomepageSlots();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ==========================================================
     LOAD GALLERY FACADES
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    const loadFacades = async () => {
      try {
        setFacadesLoading(true);
        setFacadesError(null);

        const response = await fetch(
          `${API_URL}/api/media/gallery/facade`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(`Facade API returned ${response.status}`);
        }

        const data = await response.json();
        const normalized = normalizeFacades(data);

        const processed = normalized
          .map((facade, position) => {
            const indexNumber =
              facade?.index !== undefined &&
              facade?.index !== null &&
              !Number.isNaN(Number(facade.index))
                ? Number(facade.index)
                : position + 1;

            const coverUrl = extractFacadeCover(facade);

            return {
              ...facade,
              index: indexNumber,
              cover: coverUrl,
              file: coverUrl,
              url: coverUrl,

              x:
                facade?.x !== undefined
                  ? Number(facade.x)
                  : 50,

              y:
                facade?.y !== undefined
                  ? Number(facade.y)
                  : 50,

              width: Number(facade?.width) || undefined,
              height: Number(facade?.height) || undefined,
              zoom: Number(facade?.zoom) || 1,
              offsetX: Number(facade?.offsetX) || 0,
              offsetY: Number(facade?.offsetY) || 0,

              title:
                typeof facade?.title === "string"
                  ? facade.title.trim()
                  : "",

              description:
                typeof facade?.description === "string"
                  ? facade.description.trim()
                  : "",

              subimages: Array.isArray(facade?.subimages)
                ? facade.subimages
                : [],
            };
          })
          .filter((facade) =>
            Boolean(facade.cover || facade.file)
          )
          .sort((a, b) => a.index - b.index)
          .slice(0, 4);

        if (cancelled) return;

        setFacades(processed);
      } catch (error) {
        console.error("Error loading facades:", error);

        setFacades([]);

        setFacadesError(
          "Impossible de charger les réalisations."
        );
      } finally {
        if (!cancelled) {
          setFacadesLoading(false);
        }
      }
    };

    loadFacades();

    return () => {
      cancelled = true;
    };
  }, [normalizeFacades]);

  /* ==========================================================
     LOAD REVIEWS
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    const loadReviews = async () => {
      try {
        setReviewsLoading(true);
        setReviewsError(null);

        const response = await fetch(`${API_URL}/api/reviews`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            `Reviews API returned ${response.status}`
          );
        }

        const result = await response.json();

        if (cancelled) return;

        const data = Array.isArray(result)
          ? result
          : Array.isArray(result?.reviews)
            ? result.reviews
            : Array.isArray(result?.data)
              ? result.data
              : [];

        setReviews(data);
      } catch (error) {
        console.error("Error fetching reviews:", error);

        if (!cancelled) {
          setReviews([]);
          setReviewsError(
            "Les avis ne sont pas disponibles pour le moment."
          );
        }
      } finally {
        if (!cancelled) {
          setReviewsLoading(false);
        }
      }
    };

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ==========================================================
     REVIEWS AVERAGE
  ========================================================== */

  const reviewAverage =
    reviews.length > 0
      ? reviews.reduce((total, review) => {
          const rating = Math.min(
            5,
            Math.max(0, Number(review?.rating) || 0)
          );

          return total + rating;
        }, 0) / reviews.length
      : 0;

  const reviewAverageFormatted = reviewAverage.toFixed(1);

  /* ============================================================
     EXACT CROP & FOCAL STYLE
  ============================================================ */

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

      const leftPercent = -(leftCrop / width) * 100;
      const topPercent = -(topCrop / height) * 100;

      const widthPercent = (100 / width) * 100;
      const heightPercent = (100 / height) * 100;

      return {
        position: "absolute",
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        width: `${widthPercent}%`,
        height: `${heightPercent}%`,
        maxWidth: "none",
        maxHeight: "none",
        objectFit: "fill",
        display: "block",
      };
    }

    const posX = Math.min(100, Math.max(0, x + offsetX));
    const posY = Math.min(100, Math.max(0, y + offsetY));

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

  const getSlotCropStyle = useCallback(
    (slotName) => {
      const crop = slotCrops[slotName];

      return getCropStyle(crop);
    },
    [slotCrops, getCropStyle]
  );

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <main className="overflow-hidden bg-white text-[#171717]">

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="relative aspect-[2/1] min-h-[520px] overflow-hidden bg-[#111111]">
        <SlotImage
          src={slotImages.banner}
          alt="Maison rénovée avec façade contemporaine"
          style={getSlotCropStyle("banner")}
        />

        <div className="pointer-events-none absolute inset-0 bg-black/45" />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/15" />

        <div className="relative mx-auto flex h-full max-w-[1440px] items-center px-6 py-24 sm:px-10 lg:px-16">
          <div className="max-w-4xl text-white">
            <Reveal>
              <div className="mb-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/80">
                <span className="h-px w-10 bg-red-600" />
                Ravalement & isolation extérieure
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-[80px]">
                Une façade qui retrouve
                <span className="block text-white/60">
                  son aspect.
                </span>
              </h1>
            </Reveal>

            <Reveal delay={0.15}>
              <p className="mt-7 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
                Façade abîmée, maison à rénover ou besoin de mieux isoler ?
                Nous nous occupons des travaux, de la préparation aux
                finitions.
              </p>
            </Reveal>

            <Reveal delay={0.22}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#contact"
                  className="group inline-flex h-14 items-center justify-center gap-3 bg-red-600 px-7 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-[0.98]"
                >
                  Demander un devis gratuit

                  <ArrowUpRight
                    size={17}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>

                <a
                  href="#realisations"
                  className="inline-flex h-14 items-center justify-center gap-3 border border-white/30 bg-white/10 px-7 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-[0.98]"
                >
                  Voir nos réalisations
                  <ArrowRight size={17} />
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="mt-12 flex flex-wrap gap-7 border-t border-white/15 pt-5 text-[11px] font-medium uppercase tracking-[0.14em] text-white/60">
                <span>Ravalement</span>
                <span>Façades</span>
                <span>Isolation extérieure</span>
                <span>Finitions</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ======================================================
          CREDIBILITY
      ====================================================== */}

      <section className="border-b border-[#e8e8e8] bg-white">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: ShieldCheck,
              title: "Travail soigné",
              text: "Un travail propre et sérieux",
            },
            {
              icon: BadgeCheck,
              title: "Qualifications",
              text: "Des qualifications vérifiables",
            },
            {
              icon: CheckCircle2,
              title: "Devis détaillé",
              text: "Un devis clair et détaillé",
            },
            {
              icon: Star,
              title: "Avis clients",
              text: "Les avis de nos clients",
            },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className={`flex min-h-[135px] items-center gap-4 px-6 py-7 sm:px-10 ${
                  index !== 0 ? "border-l border-[#e8e8e8]" : ""
                }`}
              >
                <Icon
                  size={23}
                  strokeWidth={1.6}
                  className="shrink-0 text-red-600"
                />

                <div>
                  <div className="text-sm font-semibold text-[#171717]">
                    {item.title}
                  </div>

                  <div className="mt-1 text-xs text-[#777777]">
                    {item.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================
          INTRODUCTION
      ====================================================== */}

      <section className="bg-white px-6 py-24 sm:px-10 lg:px-16 lg:py-32">
        <div className="mx-auto grid max-w-[1440px] gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <Reveal>
            <div>
              <SectionHeading
                eyebrow="Notre métier"
                title={
                  <>
                    Votre maison mérite
                    <br />
                    une façade propre et durable.
                  </>
                }
                text="Vous avez une façade à rénover ? Nous regardons d'abord son état, ce qu'il faut réparer et la solution la plus adaptée avant de commencer les travaux."
              />

              <a
                href="/services"
                className="group mt-8 inline-flex items-center gap-3 text-sm font-semibold text-[#171717] transition-colors hover:text-red-600"
              >
                Découvrir nos prestations

                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative">
              <div className="relative aspect-[2/1] overflow-hidden rounded-xl bg-[#111111] shadow-lg">
                <SlotImage
                  src={slotImages.introduction}
                  alt="Façade de maison rénovée"
                  style={getSlotCropStyle("introduction")}
                />
              </div>

              <div className="absolute bottom-6 left-6 rounded-lg bg-red-600 p-6 text-white shadow-xl sm:bottom-8 sm:left-8">
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
                  Ce qui compte pour nous
                </div>

                <div className="mt-2 text-xl font-semibold">
                  Travail soigné · Matériaux adaptés · Finitions propres
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ======================================================
          SERVICES
      ====================================================== */}

      <section
        id="services"
        className="bg-[#f6f6f6] px-6 py-24 sm:px-10 lg:px-16 lg:py-32"
      >
        <div className="mx-auto max-w-[1440px]">
          <SectionHeading
            eyebrow="Nos prestations"
            title={
              <>
                Des travaux adaptés à
                <br />
                votre maison.
              </>
            }
            text="Que votre façade ait besoin d'être rénovée, réparée ou isolée, nous adaptons les travaux à son état et à votre projet."
          />

          <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service, index) => {
              const Icon = service.icon;

              return (
                <Reveal key={service.id} delay={index * 0.06}>
                  <article className="group flex h-full flex-col justify-between rounded-xl border border-[#e2e2e2] bg-white p-8 transition duration-300 hover:-translate-y-1 hover:border-red-600 hover:shadow-xl hover:shadow-black/5 sm:p-9">
                    <div>
                      <Icon
                        size={28}
                        strokeWidth={1.5}
                        className="text-red-600"
                      />

                      <h3 className="mt-8 text-xl font-semibold text-[#171717]">
                        {service.title}
                      </h3>

                      <p className="mt-4 text-sm leading-6 text-[#707070]">
                        {service.text}
                      </p>
                    </div>

                    <a
                      href={`/services#${service.id}`}
                      className="mt-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-red-600 group-hover:underline"
                    >
                      Voir les détails
                      <ArrowRight size={14} />
                    </a>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================
          CERTIFICATION
      ====================================================== */}

      <section
        id="certification"
        className="relative overflow-hidden bg-white px-6 py-24 sm:px-10 lg:px-16 lg:py-32"
      >
        <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-red-600/[0.025] blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-black/[0.025] blur-3xl" />

        <div className="relative mx-auto max-w-[1440px]">
          <div className="mb-16 max-w-3xl">
            <Reveal>
              <div className="mb-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-red-600">
                <span className="h-px w-8 bg-red-600" />
                Qualifications & confiance
              </div>

              <h2 className="text-4xl font-semibold leading-[1.05] tracking-[-0.035em] text-[#171717] sm:text-5xl lg:text-[56px]">
                Une expertise qui repose sur
                <span className="block text-[#777777]">
                  l'expérience et le savoir-faire.
                </span>
              </h2>

              <p className="mt-6 max-w-2xl text-[15px] leading-7 text-[#6f6f6f] sm:text-base">
                Découvrez notre certification et l'expérience qui
                accompagnent chacun de nos projets, de la préparation du
                support jusqu'aux finitions.
              </p>
            </Reveal>
          </div>

          <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-20">
            <Reveal>
              <div className="group relative">
                <div className="absolute -inset-4 rounded-[2rem] bg-[#f4f4f4] opacity-70 blur-sm" />

                <div className="relative overflow-hidden rounded-[1.5rem] border border-[#e2e2e2] bg-[#fafafa] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_28px_70px_rgba(0,0,0,0.12)] sm:p-8">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600">
                        Document officiel
                      </div>

                      <div className="mt-1 text-xs text-[#999999]">
                        Certification de l'entreprise
                      </div>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-md">
                      <BadgeCheck size={20} />
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-xl border border-[#dddddd] bg-white">
                    <img
                      src={certificatImage}
                      alt="Certificat de l'entreprise"
                      loading="lazy"
                      decoding="async"
                      className="block h-auto max-h-[650px] w-full object-contain transition-transform duration-700 group-hover:scale-[1.015]"
                      onContextMenu={(e) => e.preventDefault()}
                      onDragStart={(e) => e.preventDefault()}
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.04] via-transparent to-white/[0.08]" />
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-[#777777]">
                      <ShieldCheck size={15} className="text-red-600" />
                      Certification vérifiable
                    </div>

                    <a
                      href={certificatImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[#171717] transition hover:text-red-600"
                    >
                      Voir le document
                      <ArrowUpRight size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="flex items-center lg:min-h-[420px]">
                <div className="w-full rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-8 sm:p-10">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-red-600">
                    Votre interlocuteur
                  </div>

                  <h3 className="mt-3 text-3xl font-semibold tracking-tight text-[#171717] sm:text-4xl">
                    {EXPERT_NAME}
                  </h3>

                  <p className="mt-2 text-base text-[#777777]">
                    Expert en ravalement de façade & isolation extérieure
                  </p>

                  <div className="mt-8 border-t border-[#e5e5e5] pt-6">
                    <div className="text-4xl font-semibold tracking-tight text-[#171717] sm:text-5xl">
                      {experienceYears}
                    </div>

                    <div className="mt-1 text-sm text-[#777777]">
                      ans d'expérience
                    </div>
                  </div>

                  <p className="mt-6 max-w-md text-sm leading-6 text-[#777777]">
                    Un accompagnement simple et sérieux, avec un interlocuteur
                    qui suit votre projet du premier échange jusqu'à la fin
                    des travaux.
                  </p>

                  <a
                    href="#contact"
                    className="mt-7 inline-flex h-12 items-center justify-center gap-3 rounded-xl bg-red-600 px-6 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-[0.98]"
                  >
                    Parler de votre projet
                    <ArrowUpRight size={16} />
                  </a>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div className="mt-10 grid border-y border-[#e5e5e5] sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: BadgeCheck,
                  title: "Certification",
                  text: "Un document officiel présenté en toute transparence.",
                },
                {
                  icon: ShieldCheck,
                  title: "Sérieux",
                  text: "Une attention portée à chaque étape du chantier.",
                },
                {
                  icon: CheckCircle2,
                  title: "Clarté",
                  text: "Des travaux expliqués avant leur réalisation.",
                },
                {
                  icon: Building2,
                  title: "Professionnalisme",
                  text: "Une approche adaptée à chaque projet.",
                },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className={`flex gap-4 p-6 sm:p-7 ${
                      index !== 0
                        ? "border-t border-[#e5e5e5] sm:border-l sm:border-t-0"
                        : ""
                    }`}
                  >
                    <Icon
                      size={21}
                      strokeWidth={1.5}
                      className="mt-0.5 shrink-0 text-red-600"
                    />

                    <div>
                      <div className="text-sm font-semibold text-[#171717]">
                        {item.title}
                      </div>

                      <div className="mt-1 text-xs leading-5 text-[#888888]">
                        {item.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ======================================================
          PROJECTS / REALISATIONS
      ====================================================== */}

      <section
        id="realisations"
        className="bg-white px-6 py-24 sm:px-10 lg:px-16 lg:py-32"
      >
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="Nos réalisations"
              title={
                <>
                  Quelques-unes de
                  <br />
                  nos réalisations.
                </>
              }
              text="Découvrez quelques-uns de nos travaux. Cliquez sur une réalisation pour voir les photos du chantier."
            />

            <a
              href="/realisations"
              className="group inline-flex shrink-0 items-center gap-3 rounded-full border border-[#dedede] bg-white px-5 py-3 text-sm font-semibold text-[#171717] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-red-600 hover:bg-red-600 hover:text-white hover:shadow-lg"
            >
              <span>Voir tous nos projets</span>

              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f3f3f3] transition-all duration-300 group-hover:bg-white/15">
                <ArrowUpRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </a>
          </div>

          {facadesLoading && (
            <div className="mt-16 grid gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="aspect-[4/3] w-full animate-pulse rounded-2xl bg-[#eeeeee]"
                />
              ))}
            </div>
          )}

          {!facadesLoading && facadesError && (
            <div className="mt-16 rounded-2xl border border-[#e5e5e5] bg-[#f8f8f8] p-8 text-center">
              <div className="text-sm font-semibold text-[#333333]">
                Impossible de charger les réalisations.
              </div>

              <div className="mt-2 text-xs text-[#888888]">
                {facadesError}
              </div>
            </div>
          )}

          {!facadesLoading &&
            !facadesError &&
            facades.length === 0 && (
              <div className="mt-16 rounded-2xl border border-dashed border-[#dddddd] bg-[#fafafa] p-12 text-center">
                <div className="text-sm font-semibold text-[#333333]">
                  Aucune réalisation disponible.
                </div>

                <div className="mt-2 text-xs text-[#888888]">
                  Ajoutez des réalisations depuis l'administration.
                </div>
              </div>
            )}

          {!facadesLoading &&
            !facadesError &&
            facades.length > 0 && (
              <div className="mt-16 grid gap-6 md:grid-cols-2">
                {facades.map((facade, index) => {
                  const coverSrc =
                    facade.cover ||
                    facade.file ||
                    facade.url;

                  const isVideo = isVideoUrl(coverSrc);

                  const titleText = (facade.title || "").trim();
                  const descText = (facade.description || "").trim();

                  const hasContent = Boolean(titleText || descText);

                  const isTextHidden = Boolean(
                    hiddenTextCards[index]
                  );

                  return (
                    <Reveal
                      key={`facade-${
                        facade.id || facade.index
                      }-${index}`}
                      delay={index * 0.06}
                    >
                      <article
                        className="group relative aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-2xl bg-neutral-900 shadow-sm transition-all duration-300 hover:shadow-2xl"
                        onClick={() =>
                          setSelectedProject(facade)
                        }
                      >
                        <SlotImage
                          src={coverSrc}
                          alt={titleText || "Projet"}
                          style={getCropStyle(facade)}
                          className="transition duration-700 ease-out group-hover:scale-105"
                        />

                        <div
                          className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10 transition-opacity duration-300 ${
                            isTextHidden
                              ? "opacity-20 group-hover:opacity-40"
                              : "opacity-75 group-hover:opacity-90"
                          }`}
                        />

                        {isVideo && (
                          <div className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md">
                            <Play
                              size={15}
                              className="translate-x-0.5 fill-white"
                            />
                          </div>
                        )}

                        {hasContent && (
                          <button
                            type="button"
                            onClick={(e) =>
                              toggleCardText(index, e)
                            }
                            className="absolute left-4 top-4 z-30 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition hover:bg-white/20 active:scale-95"
                            title={
                              isTextHidden
                                ? "Afficher les textes"
                                : "Masquer les textes"
                            }
                          >
                            {isTextHidden ? (
                              <Eye size={14} />
                            ) : (
                              <EyeOff size={14} />
                            )}
                          </button>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 z-20 flex items-end justify-between p-6 text-white sm:p-8">
                          <div className="max-w-[80%]">
                            <AnimatePresence>
                              {hasContent &&
                                !isTextHidden && (
                                  <motion.div
                                    initial={{
                                      opacity: 0,
                                      y: 6,
                                    }}
                                    animate={{
                                      opacity: 1,
                                      y: 0,
                                    }}
                                    exit={{
                                      opacity: 0,
                                      y: 6,
                                    }}
                                    transition={{
                                      duration: 0.18,
                                    }}
                                  >
                                    {titleText && (
                                      <h3 className="text-lg font-semibold leading-snug text-white drop-shadow-md sm:text-xl">
                                        {titleText}
                                      </h3>
                                    )}

                                    {descText && (
                                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-white/85 drop-shadow sm:text-sm">
                                        {descText}
                                      </p>
                                    )}
                                  </motion.div>
                                )}
                            </AnimatePresence>
                          </div>

                          <div
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:border-red-500 group-hover:bg-red-600"
                            title="Voir les photos du chantier"
                          >
                            <ArrowUpRight
                              size={18}
                              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            />
                          </div>
                        </div>
                      </article>
                    </Reveal>
                  );
                })}
              </div>
            )}
        </div>
      </section>

      {/* ======================================================
          PROCESS
      ====================================================== */}

      <section className="bg-[#171717] px-6 py-24 text-white sm:px-10 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-[1440px]">
          <SectionHeading
            light
            eyebrow="Notre méthode"
            title={
              <>
                Comment ça se passe ?
                <br />
                Du premier échange à la fin du chantier.
              </>
            }
            text="On prend le temps de regarder le chantier, de vous expliquer les travaux et de faire les choses dans le bon ordre."
          />

          <div className="mt-16 grid border-t border-white/10 md:grid-cols-2 lg:grid-cols-4">
            {[
              [
                "01",
                "On vient voir",
                "Nous regardons la façade et faisons le point sur les travaux à prévoir.",
              ],
              [
                "02",
                "On vous explique",
                "Vous recevez un devis clair avec les travaux proposés.",
              ],
              [
                "03",
                "On réalise les travaux",
                "Préparation, réparations, rénovation et finitions.",
              ],
              [
                "04",
                "On vérifie ensemble",
                "On fait le tour du chantier pour s'assurer que tout est conforme.",
              ],
            ].map(([number, title, text], index) => (
              <Reveal key={number} delay={index * 0.06}>
                <div
                  className={`min-h-[260px] p-8 sm:p-10 ${
                    index !== 0
                      ? "border-l border-white/10"
                      : ""
                  }`}
                >
                  <div className="text-4xl font-semibold text-white/15">
                    {number}
                  </div>

                  <h3 className="mt-8 text-xl font-semibold">
                    {title}
                  </h3>

                  <p className="mt-4 text-sm leading-6 text-white/50">
                    {text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================
          REVIEWS
      ====================================================== */}

      <section className="bg-[#f5f5f5] px-6 py-20 sm:px-10 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <Reveal>
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
                  <span className="h-px w-7 bg-red-600" />
                  Avis clients
                </span>

                <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl lg:text-5xl">
                  Ce que nos clients pensent de notre travail.
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-6 text-[#707070] sm:text-base">
                  Des retours simples et authentiques de personnes qui nous
                  ont fait confiance pour leurs travaux.
                </p>
              </div>
            </Reveal>

            {!reviewsLoading &&
              !reviewsError &&
              reviews.length > 0 && (
                <Reveal delay={0.08}>
                  <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-[#e3e3e3] bg-white px-5 py-4 shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white">
                      <Star size={20} fill="currentColor" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-[#171717]">
                          {reviewAverageFormatted}
                        </span>

                        <span className="text-xs text-[#999999]">
                          / 5
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={11}
                            strokeWidth={2}
                            className={
                              star <= Math.round(reviewAverage)
                                ? "fill-red-600 text-red-600"
                                : "text-black/15"
                            }
                          />
                        ))}

                        <span className="ml-1.5 text-[10px] font-medium text-[#999999]">
                          Une note qui compte pour nous
                        </span>
                      </div>
                    </div>
                  </div>
                </Reveal>
              )}
          </div>

          {reviewsLoading && (
            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="aspect-square animate-pulse rounded-2xl border border-[#e4e4e4] bg-white"
                />
              ))}
            </div>
          )}

          {!reviewsLoading && reviewsError && (
            <Reveal>
              <div className="mx-auto mt-12 max-w-md rounded-2xl border border-[#e5e5e5] bg-white p-8 text-center">
                <div className="text-sm font-semibold text-[#333333]">
                  Impossible de charger les avis.
                </div>

                <div className="mt-2 text-xs text-[#888888]">
                  {reviewsError}
                </div>
              </div>
            </Reveal>
          )}

          {!reviewsLoading &&
            !reviewsError &&
            reviews.length === 0 && (
              <Reveal>
                <div className="mx-auto mt-12 max-w-md rounded-2xl border border-dashed border-[#dddddd] bg-white p-10 text-center">
                  <div className="text-sm font-semibold text-[#333333]">
                    Aucun avis disponible.
                  </div>

                  <div className="mt-2 text-xs text-[#888888]">
                    Les avis clients apparaîtront ici lorsqu'ils seront
                    disponibles.
                  </div>
                </div>
              </Reveal>
            )}

          {!reviewsLoading &&
            !reviewsError &&
            reviews.length > 0 && (
              <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {reviews.slice(0, 4).map((review, index) => {
                  const safeRating = Math.min(
                    5,
                    Math.max(0, Number(review.rating) || 0)
                  );

                  return (
                    <Reveal
                      key={
                        review.id ||
                        `${review.name}-${review.order ?? index}-${index}`
                      }
                      delay={index * 0.06}
                    >
                      <article className="group relative flex aspect-square flex-col justify-between overflow-hidden rounded-2xl border border-[#e3e3e3] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#d5d5d5] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
                        <Quote
                          size={60}
                          strokeWidth={1}
                          className="pointer-events-none absolute right-3 top-3 rotate-180 text-red-600/[0.05] transition-transform duration-500 group-hover:scale-110"
                        />

                        <div className="relative z-10 flex items-start justify-between gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#171717] text-xs font-bold text-white">
                            {review.name
                              ? review.name.charAt(0).toUpperCase()
                              : "C"}
                          </div>

                          <div className="flex flex-col items-end gap-1 rounded-full bg-red-50 px-3 py-1.5">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={13}
                                  strokeWidth={2}
                                  className={
                                    star <= safeRating
                                      ? "fill-red-600 text-red-600"
                                      : "text-black/15"
                                  }
                                />
                              ))}
                            </div>

                            <span className="text-[11px] font-bold text-[#707070]">
                              {safeRating.toFixed(1)} / 5
                            </span>
                          </div>
                        </div>

                        <div className="relative z-10 my-4 flex-1 overflow-hidden">
                          <p className="line-clamp-5 text-sm font-medium leading-relaxed text-[#333333]">
                            {review.description ||
                              review.text ||
                              review.comment ||
                              review.review ||
                              ""}
                          </p>
                        </div>

                        <div className="relative z-10 flex items-center justify-between border-t border-[#eeeeee] pt-3">
                          <div>
                            <div className="text-xs font-bold text-[#171717]">
                              {review.name || "Client"}
                            </div>

                            <div className="mt-0.5 text-[11px] text-[#999999]">
                              Client vérifié
                            </div>
                          </div>
                        </div>
                      </article>
                    </Reveal>
                  );
                })}
              </div>
            )}

          {!reviewsLoading &&
            !reviewsError &&
            reviews.length > 0 && (
              <Reveal delay={0.2}>
                <div className="mt-10 flex justify-center">
                  <a
                    href="/reviews"
                    className="group inline-flex items-center gap-3 rounded-full border border-[#dedede] bg-white px-5 py-3 text-sm font-semibold text-[#171717] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-red-600 hover:bg-red-600 hover:text-white hover:shadow-lg"
                  >
                    <span>Voir tous les avis clients</span>

                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f3f3f3] transition-all duration-300 group-hover:bg-white/15">
                      <ArrowUpRight
                        size={15}
                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </span>
                  </a>
                </div>
              </Reveal>
            )}
        </div>
      </section>

      {/* ======================================================
          FAQ
      ====================================================== */}

      <section className="bg-white px-6 py-24 sm:px-10 lg:px-16 lg:py-32">
        <div className="mx-auto grid max-w-[1100px] gap-14 lg:grid-cols-[0.7fr_1.3fr]">
          <SectionHeading
            eyebrow="Questions fréquentes"
            title={
              <>
                Vos questions,
                <br />
                nos réponses.
              </>
            }
          />

          <div className="border-t border-[#e1e1e1]">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={faq.question}
                  className="border-b border-[#e1e1e1]"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaq(isOpen ? null : index)
                    }
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-semibold text-[#171717] sm:text-base">
                      {faq.question}
                    </span>

                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-red-600 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{
                          height: 0,
                          opacity: 0,
                        }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                        }}
                        transition={{
                          duration: 0.25,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <p className="pb-6 pr-8 text-sm leading-6 text-[#707070]">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================
          FINALE / CONTACT
      ====================================================== */}

      <section
        id="contact"
        className="relative aspect-[2/1] min-h-[500px] overflow-hidden bg-[#111111]"
      >
        <SlotImage
          src={slotImages.finale}
          alt="Maison rénovée"
          style={getSlotCropStyle("finale")}
        />

        <div className="pointer-events-none absolute inset-0 bg-black/50" />

        <div className="relative mx-auto flex h-full max-w-[1440px] items-center px-6 sm:px-10 lg:px-16">
          <Reveal>
            <div className="max-w-3xl text-white">
              <div className="mb-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
                <span className="h-px w-8 bg-red-600" />
                Vous avez des travaux à prévoir ?
              </div>

              <h2 className="text-5xl font-semibold leading-[1] tracking-[-0.04em] sm:text-6xl lg:text-[72px]">
                Parlons-en pour votre
                <span className="block text-white/60">
                  projet de façade.
                </span>
              </h2>

              <p className="mt-7 max-w-xl text-base leading-7 text-white/70">
                Façade à rénover, isolation à améliorer ou simplement envie
                de remettre votre maison en état ? Contactez-nous pour nous
                présenter votre projet et demander un devis.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#contact"
                  className="inline-flex h-14 items-center justify-center gap-3 bg-red-600 px-7 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-[0.98]"
                >
                  Demander un devis gratuit
                  <ArrowUpRight size={17} />
                </a>

                {companyInfo.phone && phoneHref && (
                  <a
                    href={phoneHref}
                    className="inline-flex h-14 items-center justify-center gap-3 border border-white/25 px-7 text-sm font-medium text-white transition hover:bg-white/10 active:scale-[0.98]"
                  >
                    <Phone size={16} />
                    {companyInfo.phone}
                  </a>
                )}
              </div>

              {(companyInfo.email || companyInfo.address) && (
                <div className="mt-8 flex flex-col gap-3 text-sm text-white/65 sm:flex-row sm:flex-wrap sm:items-center">
                  {companyInfo.email && (
                    <a
                      href={`mailto:${companyInfo.email}`}
                      className="inline-flex items-center gap-2 transition hover:text-white"
                    >
                      <Mail size={15} />
                      {companyInfo.email}
                    </a>
                  )}

                  {companyInfo.email && companyInfo.address && (
                    <span className="hidden text-white/25 sm:block">
                      •
                    </span>
                  )}

                  {companyInfo.address && (
                    <div className="inline-flex items-center gap-2">
                      <MapPin size={15} />
                      <span>{companyInfo.address}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ======================================================
          PROJECT MODAL
      ====================================================== */}

      <AnimatePresence>
        {selectedProject && (
          <ProjectGallery
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}