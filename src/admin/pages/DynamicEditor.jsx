"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  Upload,
  Image as ImageIcon,
  Video,
  X,
  FileImage,
  Film,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Search,
  Maximize2,
  MoreVertical,
  Move,
  Trash2,
  Check,
  PlusCircle,
  Play,
} from "lucide-react";

const API_URL = "";

async function parseJsonResponse(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {
      success: response.ok,
      message: text || response.statusText,
    };
  }
}

function getAdminHeaders() {
  const token = localStorage.getItem("admin_token");
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
}

function clearAdminSession() {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
}

const HOMEPAGE_SLOTS = {
  banner: { label: "Bannière", endpoint: "/api/media/homepage-slots/banner", ratio: 2 },
  introduction: { label: "Introduction", endpoint: "/api/media/homepage-slots/introduction", ratio: 2 },
  finale: { label: "Finale", endpoint: "/api/media/homepage-slots/finale", ratio: 2 },
};

export default function DynamicEditor() {
  const fileInputRef = useRef(null);
  const editorMediaRef = useRef(null);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [media, setMedia] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [showAllInLibrary, setShowAllInLibrary] = useState(false);
  const [mediaSearch, setMediaSearch] = useState("");
  const [mediaTypeFilter, setMediaTypeFilter] = useState("all");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [mediaEditor, setMediaEditor] = useState(null);
  const [isSavingMedia, setIsSavingMedia] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);

  const [manageLibraryMode, setManageLibraryMode] = useState(false);
  const [manageTab, setManageTab] = useState("assign");
  const [selectedLibraryItems, setSelectedLibraryItems] = useState([]);
  const [libraryIndex, setLibraryIndex] = useState("");
  const [isApplyingLibrary, setIsApplyingLibrary] = useState(false);

  const [existingProjects, setExistingProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [selectedDeleteIndices, setSelectedDeleteIndices] = useState([]);
  const [isDeletingProjects, setIsDeletingProjects] = useState(false);

  const [mediaCrop, setMediaCrop] = useState({ x: 50, y: 50, width: 60, height: 45 });
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryDescription, setGalleryDescription] = useState("");
  const [galleryIndex, setGalleryIndex] = useState("");

  const getMediaType = useCallback((item) => {
    if (!item) return "unknown";
    if (item.type === "image" || item.type === "video") return item.type;
    if (item.mimeType?.startsWith("image/")) return "image";
    if (item.mimeType?.startsWith("video/")) return "video";
    const name = (item.name || item.originalName || item.filename || item.id || item.file || "").toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".bmp", ".svg"].some((ext) => name.endsWith(ext))) return "image";
    if ([".mp4", ".webm", ".mov", ".m4v", ".avi", ".mkv"].some((ext) => name.endsWith(ext))) return "video";
    return "image";
  }, []);

  const getMediaUrl = useCallback((item) => {
    const raw = typeof item === "string" ? item : item?.url || item?.file || item?.filename || item?.path || item?.id || "";
    if (!raw) return "";
    if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("blob:") || raw.startsWith("data:")) return raw;
    if (raw.startsWith("/api/")) return `${API_URL}${raw}`;
    return `${API_URL}/api/media/file/${encodeURIComponent(raw)}`;
  }, []);

  const loadMedia = async () => {
    setIsLoadingMedia(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/media`);
      const data = await parseJsonResponse(response);
      
      let list = [];
      if (response.ok && data.success && Array.isArray(data.media)) {
        list = data.media;
      } else if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data?.files)) {
        list = data.files;
      } else if (!response.ok) {
        setError(data?.message || "Impossible de charger les médias.");
      }

      setMedia(list);
    } catch (err) {
      console.error("Fetch media error:", err);
      setError("Erreur de chargement des médias.");
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const loadExistingProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const response = await fetch(`${API_URL}/api/media/gallery/facade`);
      const data = await parseJsonResponse(response);
      setExistingProjects(Array.isArray(data.facades) ? data.facades : []);
    } catch (err) {
      console.error("Fetch projects error:", err);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  useEffect(() => {
    loadMedia();
    loadExistingProjects();
  }, []);

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
    );
    if (!validFiles.length) {
      setError("Veuillez sélectionner des images ou des vidéos.");
      return;
    }
    setError("");
    setSuccess("");
    setSelectedFiles((prev) => [
      ...prev,
      ...validFiles.map((file) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith("video/") ? "video" : "image",
      })),
    ]);
  };

  const handleFileInput = (event) => {
    if (event.target.files) handleFiles(event.target.files);
    event.target.value = "";
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    if (event.dataTransfer.files) handleFiles(event.dataTransfer.files);
  };

  const removeSelectedFile = (id) => {
    setSelectedFiles((prev) => {
      const item = prev.find((file) => file.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((file) => file.id !== id);
    });
  };

  const handleUpload = async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!selectedFiles.length || isUploading) return;

    setError("");
    setSuccess("");

    const token = localStorage.getItem("admin_token");
    if (!token) {
      setError("Session administrateur introuvable. Veuillez vous reconnecter.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      selectedFiles.forEach((item) => formData.append("media", item.file));

      const response = await fetch(`${API_URL}/api/media/upload`, {
        method: "POST",
        headers: { ...getAdminHeaders() },
        body: formData,
      });

      const data = await parseJsonResponse(response);

      if (response.status === 401) {
        clearAdminSession();
        throw new Error("Session administrateur invalide. Veuillez vous reconnecter.");
      }

      if (!response.ok || !data.success) {
        throw new Error(data?.message || `Erreur HTTP ${response.status}`);
      }

      selectedFiles.forEach((item) => URL.revokeObjectURL(item.preview));
      setSelectedFiles([]);
      setSuccess(data.message || "Médias importés avec succès.");

      await loadMedia();
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Impossible d'importer les médias.");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      selectedFiles.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, [selectedFiles]);

  const openMediaLibrary = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setOpenMenuId(null);
    setShowAllInLibrary(false);
    setMediaSearch("");
    setMediaTypeFilter("all");
    setMediaLibraryOpen(true);
  };

  const openManageLibrary = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setOpenMenuId(null);
    setError("");
    setSuccess("");
    setSelectedLibraryItems([]);
    setLibraryIndex("");
    setSelectedDeleteIndices([]);
    setShowAllInLibrary(false);
    setManageLibraryMode(true);
    setManageTab("assign");
    setMediaLibraryOpen(true);
    loadExistingProjects();
  };

  const toggleManageModeInLibrary = () => {
    setShowAllInLibrary(false);
    if (manageLibraryMode) {
      setManageLibraryMode(false);
      setSelectedLibraryItems([]);
      setLibraryIndex("");
      setSelectedDeleteIndices([]);
    } else {
      setManageLibraryMode(true);
      setManageTab("assign");
      setSelectedLibraryItems([]);
      setLibraryIndex("");
      setSelectedDeleteIndices([]);
      loadExistingProjects();
    }
  };

  const closeMediaLibrary = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (isApplyingLibrary || isDeletingProjects) return;
    setMediaLibraryOpen(false);
    setManageLibraryMode(false);
    setSelectedLibraryItems([]);
    setLibraryIndex("");
    setSelectedDeleteIndices([]);
    setMediaSearch("");
    setShowAllInLibrary(false);
  };

  const toggleLibraryItem = (item) => {
    setSelectedLibraryItems((prev) =>
      prev.some((sel) => sel.id === item.id) ? prev.filter((sel) => sel.id !== item.id) : [...prev, item]
    );
  };

  const isLibraryItemSelected = (item) => selectedLibraryItems.some((sel) => sel.id === item.id);

  const getLibrarySelectionNumber = (item) => {
    if (!selectedLibraryItems.some((sel) => sel.id === item.id)) return null;
    return libraryIndex.trim() !== "" ? `#${libraryIndex.trim()}` : "✓";
  };

  const handleApplyLibrary = async (event) => {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    if (!selectedLibraryItems.length || isApplyingLibrary) return;

    setError("");
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setError("Session administrateur introuvable. Veuillez vous reconnecter.");
      return;
    }

    const rawIndex = libraryIndex.trim();
    if (!rawIndex) {
      setError("Veuillez d'abord spécifier un numéro d'index pour cette réalisation.");
      return;
    }

    const parsedIndex = Number(rawIndex);
    if (!Number.isInteger(parsedIndex) || parsedIndex < 1) {
      setError("Veuillez entrer un numéro d'index valide (nombre entier supérieur ou égal à 1).");
      return;
    }

    setIsApplyingLibrary(true);
    setSuccess("");

    try {
      const filenames = selectedLibraryItems.map((item) => item.filename || item.name || item.originalName || item.id || "");
      const response = await fetch(`${API_URL}/api/media/gallery/subimages`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAdminHeaders() },
        body: JSON.stringify({ index: parsedIndex, filenames }),
      });

      const data = await parseJsonResponse(response);
      if (response.status === 401) {
        clearAdminSession();
        throw new Error("Session administrateur invalide. Veuillez vous reconnecter.");
      }
      if (!response.ok || !data.success) throw new Error(data?.message || `Erreur HTTP ${response.status}`);

      setSuccess(`${selectedLibraryItems.length} média(s) associé(s) à la réalisation #${parsedIndex}.`);
      setSelectedLibraryItems([]);
      setLibraryIndex("");
      setManageLibraryMode(false);
      setMediaLibraryOpen(false);
      setMediaSearch("");
      await loadExistingProjects();
    } catch (err) {
      console.error("Apply subimages error:", err);
      setError(err.message || "Impossible d'enregistrer les médias associés.");
    } finally {
      setIsApplyingLibrary(false);
    }
  };

  const toggleProjectDeleteSelection = (idx) => {
    setSelectedDeleteIndices((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx].sort((a, b) => a - b)));
  };

  const handleBatchDeleteProjects = async () => {
    if (!selectedDeleteIndices.length || isDeletingProjects) return;

    setError("");
    setSuccess("");

    const token = localStorage.getItem("admin_token");
    if (!token) {
      setError("Session administrateur introuvable. Veuillez vous reconnecter.");
      return;
    }

    setIsDeletingProjects(true);

    try {
      let response = await fetch(`${API_URL}/api/media/gallery`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...getAdminHeaders() },
        body: JSON.stringify({ indices: selectedDeleteIndices }),
      });

      if (response.status === 401) {
        clearAdminSession();
        throw new Error("Session administrateur invalide. Veuillez vous reconnecter.");
      }

      if (!response.ok && (response.status === 404 || response.status === 405)) {
        const targetFiles = existingProjects.filter((p) => selectedDeleteIndices.includes(p.index)).map((p) => p.file);
        for (const file of targetFiles) {
          const freshRes = await fetch(`${API_URL}/api/media/gallery/facade`);
          const freshData = await parseJsonResponse(freshRes);
          const currentItem = (freshData.facades || []).find((p) => p.file === file);
          if (currentItem) {
            const singleDelRes = await fetch(`${API_URL}/api/media/gallery/${currentItem.index}`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json", ...getAdminHeaders() },
              body: JSON.stringify({ index: currentItem.index }),
            });
            if (singleDelRes.status === 401) {
              clearAdminSession();
              throw new Error("Session administrateur invalide. Veuillez vous reconnecter.");
            }
          }
        }
      } else {
        const data = await parseJsonResponse(response);
        if (!response.ok || !data.success) throw new Error(data?.message || `Erreur HTTP ${response.status}`);
      }

      const count = selectedDeleteIndices.length;
      setSuccess(count === 1 ? "Réalisation supprimée." : `${count} réalisations supprimées.`);
      setSelectedDeleteIndices([]);
      await loadExistingProjects();
      await loadMedia();
    } catch (err) {
      console.error("Delete projects error:", err);
      setError(err.message || "Erreur lors de la suppression.");
    } finally {
      setIsDeletingProjects(false);
    }
  };

  const openDeleteInterface = (item) => {
    setOpenMenuId(null);
    setDeleteTarget(item);
  };

  const closeDeleteInterface = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!isDeleting) setDeleteTarget(null);
  };

  const handleDelete = async (event) => {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    if (!deleteTarget?.id || isDeleting) return;

    setError("");
    setSuccess("");

    const token = localStorage.getItem("admin_token");
    if (!token) {
      setError("Session administrateur introuvable. Veuillez vous reconnecter.");
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`${API_URL}/api/media/${encodeURIComponent(deleteTarget.id)}`, {
        method: "DELETE",
        headers: { ...getAdminHeaders() },
      });

      const data = await parseJsonResponse(response);
      if (response.status === 401) {
        clearAdminSession();
        throw new Error("Session administrateur invalide. Veuillez vous reconnecter.");
      }

      if (!response.ok || !data.success) throw new Error(data?.message || "Impossible de supprimer le média.");

      const deletedId = deleteTarget.id;
      setMedia((prev) => prev.filter((item) => item.id !== deletedId));
      setSelectedLibraryItems((prev) => prev.filter((item) => item.id !== deletedId));
      setDeleteTarget(null);
      setSuccess("Média supprimé avec succès.");
      await loadExistingProjects();
    } catch (err) {
      console.error("Delete media error:", err);
      setError(err.message || "Impossible de supprimer le média.");
    } finally {
      setIsDeleting(false);
    }
  };

  const clampCrop = useCallback((x, y, width, containerWidth = 1000, containerHeight = 500, aspectRatio = 2) => {
    const ratio = aspectRatio || 2;
    const safeContainerWidth = Math.max(containerWidth || 1000, 50);
    const safeContainerHeight = Math.max(containerHeight || 500, 50);
    const widthToHeightPercent = (safeContainerWidth / safeContainerHeight) / ratio;
    const minWidth = 10;
    let newWidth = Math.max(minWidth, Number(width) || minWidth);

    const maxWidthHorizontal = Math.min(x, 100 - x) * 2;
    const maxHeightPercent = Math.min(y, 100 - y) * 2;
    const maxWidthVertical = maxHeightPercent / (widthToHeightPercent || 1);
    const maxAllowedWidth = Math.min(100, 100 / (widthToHeightPercent || 1), maxWidthHorizontal, maxWidthVertical);

    newWidth = Math.min(newWidth, Math.max(minWidth, maxAllowedWidth));
    const newHeight = newWidth * widthToHeightPercent;
    const halfWidth = newWidth / 2;
    const halfHeight = newHeight / 2;
    const newX = Math.max(halfWidth, Math.min(100 - halfWidth, x));
    const newY = Math.max(halfHeight, Math.min(100 - halfHeight, y));

    return {
      x: Number(newX.toFixed(4)),
      y: Number(newY.toFixed(4)),
      width: Number(newWidth.toFixed(4)),
      height: Number(newHeight.toFixed(4)),
    };
  }, []);

  const openHomepageEditor = (item, slot) => {
    setOpenMenuId(null);
    setError("");
    setSuccess("");
    const configuration = HOMEPAGE_SLOTS[slot];
    if (!configuration) return;
    const isVideo = getMediaType(item) === "video";
    setMediaCrop({ x: 50, y: 50, width: isVideo ? 100 : 70, height: isVideo ? 100 : 35 });
    setMediaEditor({
      item,
      slot,
      label: configuration.label,
      endpoint: configuration.endpoint,
      ratio: configuration.ratio,
      type: isVideo ? "video" : "image",
    });
  };

  const openGalleryEditor = (item) => {
    setOpenMenuId(null);
    setError("");
    setSuccess("");
    setGalleryTitle("");
    setGalleryDescription("");
    setGalleryIndex(""); // Left blank so no random index appears
    const isVideo = getMediaType(item) === "video";
    setMediaCrop({ x: 50, y: 50, width: isVideo ? 100 : 60, height: isVideo ? 100 : 45 });
    setMediaEditor({
      item,
      slot: "gallery",
      label: "Galerie Façade",
      endpoint: "/api/media/gallery/facade",
      ratio: 4 / 3,
      type: isVideo ? "video" : "image",
    });
  };

  const handleEditorMediaLoad = () => {
    if (mediaEditor?.type === "video") return;
    const el = editorMediaRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = rect.width || el.naturalWidth || 600;
    const height = rect.height || el.naturalHeight || 400;
    setMediaCrop((prev) =>
      clampCrop(50, 50, prev.width || (mediaEditor?.slot === "gallery" ? 60 : 70), width, height, mediaEditor?.ratio || 2)
    );
  };

  const handleCropPointerDown = (event) => {
    if (event.target.closest("[data-image-resize]") || event.pointerType === "touch") return;
    event.preventDefault();
    event.stopPropagation();
    const container = event.currentTarget.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const startPointerX = event.clientX;
    const startPointerY = event.clientY;
    const startX = mediaCrop.x;
    const startY = mediaCrop.y;

    setIsDraggingCrop(true);

    const handlePointerMove = (moveEvent) => {
      const deltaX = ((moveEvent.clientX - startPointerX) / rect.width) * 100;
      const deltaY = ((moveEvent.clientY - startPointerY) / rect.height) * 100;
      const halfWidth = mediaCrop.width / 2;
      const halfHeight = mediaCrop.height / 2;
      const newX = Math.max(halfWidth, Math.min(100 - halfWidth, startX + deltaX));
      const newY = Math.max(halfHeight, Math.min(100 - halfHeight, startY + deltaY));
      setMediaCrop((prev) => ({ ...prev, x: Number(newX.toFixed(4)), y: Number(newY.toFixed(4)) }));
    };

    const handlePointerUp = () => {
      setIsDraggingCrop(false);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };

  const resizeMediaCrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const container = event.currentTarget.parentElement?.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = mediaCrop.width;

    const handlePointerMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
      const deltaPercent = (delta / rect.width) * 100;
      setMediaCrop(clampCrop(mediaCrop.x, mediaCrop.y, startWidth + deltaPercent, rect.width, rect.height, mediaEditor?.ratio || 2));
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };

  const applyMedia = async (event) => {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    if (!mediaEditor?.item?.id || isSavingMedia) return;

    setError("");
    setSuccess("");

    const token = localStorage.getItem("admin_token");
    if (!token) {
      setError("Session administrateur introuvable. Veuillez vous reconnecter.");
      return;
    }

    if (mediaEditor.slot === "gallery") {
      const rawIndex = galleryIndex.trim();
      if (!rawIndex) {
        setError("Veuillez d'abord spécifier un numéro d'index pour cette réalisation.");
        return;
      }
      const parsedIndex = Number(rawIndex);
      if (!Number.isInteger(parsedIndex) || parsedIndex < 1) {
        setError("Veuillez entrer un numéro d'index valide (nombre entier supérieur ou égal à 1).");
        return;
      }
    }

    setIsSavingMedia(true);

    try {
      const isVideo = mediaEditor.type === "video";
      const mediaPayload = isVideo
        ? { file: mediaEditor.item.id, x: 50, y: 50, width: 100, height: 100, zoom: 1, offsetX: 0, offsetY: 0 }
        : {
            file: mediaEditor.item.id,
            x: Number(mediaCrop.x.toFixed(4)),
            y: Number(mediaCrop.y.toFixed(4)),
            width: Number(Math.max(mediaCrop.width || 10, 0.01).toFixed(4)),
            height: Number(Math.max(mediaCrop.height || 10, 0.01).toFixed(4)),
            zoom: Number((100 / Math.max(mediaCrop.width || 10, 0.01)).toFixed(4)),
            offsetX: Number((-((100 / Math.max(mediaCrop.width || 10, 0.01)) * (mediaCrop.x - 50))).toFixed(4)),
            offsetY: Number((-((100 / Math.max(mediaCrop.width || 10, 0.01)) * (mediaCrop.y - 50))).toFixed(4)),
          };

      if (mediaEditor.slot === "gallery") {
        const galleryData = { ...mediaPayload, index: Number(galleryIndex.trim()) };
        const title = galleryTitle.trim();
        const description = galleryDescription.trim();
        if (title) galleryData.title = title;
        if (description) galleryData.description = description;

        const response = await fetch(`${API_URL}/api/media/gallery/facade`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...getAdminHeaders() },
          body: JSON.stringify(galleryData),
        });

        const data = await parseJsonResponse(response);
        if (response.status === 401) {
          clearAdminSession();
          throw new Error("Session administrateur invalide. Veuillez vous reconnecter.");
        }
        if (!response.ok || !data.success) throw new Error(data?.message || `Erreur HTTP ${response.status}`);

        setSuccess(`Réalisation #${galleryData.index} enregistrée avec succès.`);
        setMediaEditor(null);
        await loadExistingProjects();
        return;
      }

      const response = await fetch(`${API_URL}${mediaEditor.endpoint}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAdminHeaders() },
        body: JSON.stringify(mediaPayload),
      });

      const data = await parseJsonResponse(response);
      if (response.status === 401) {
        clearAdminSession();
        throw new Error("Session administrateur invalide. Veuillez vous reconnecter.");
      }
      if (!response.ok || !data.success) throw new Error(data?.message || `Erreur HTTP ${response.status}`);

      setSuccess(`${mediaEditor.label} enregistré avec succès.`);
      setMediaEditor(null);
    } catch (err) {
      console.error("Save media error:", err);
      setError(err.message || "Impossible d'enregistrer le média.");
    } finally {
      setIsSavingMedia(false);
    }
  };

  const closeMediaEditor = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (isSavingMedia) return;
    setMediaEditor(null);
  };

  const renderHomepageMenu = (item) => {
    const slots = [
      ["banner", "Bannière", "2:1"],
      ["introduction", "Introduction", "2:1"],
      ["finale", "Finale", "2:1"],
    ];
    const isVideo = getMediaType(item) === "video";

    return (
      <>
        <div
          className="fixed inset-0 z-40 cursor-default"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenMenuId(null); }}
        />
        <div
          className="absolute right-0 top-10 z-50 w-52 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            <span>Page d'accueil</span>
            {isVideo && <span className="text-red-500 font-bold">Vidéo</span>}
          </div>
          {slots.map(([slot, label, ratio]) => (
            <button
              key={slot}
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); openHomepageEditor(item, slot); }}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium text-gray-700 transition hover:bg-red-50 hover:text-red-600"
            >
              <span>{label}</span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[9px] text-gray-500">{isVideo ? "Plein écran" : ratio}</span>
            </button>
          ))}
          <div className="border-t border-gray-100 my-1" />
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); openGalleryEditor(item); }}
            className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium text-gray-700 transition hover:bg-red-50 hover:text-red-600"
          >
            <span>Galerie Façade</span>
            <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[9px] text-gray-500">{isVideo ? "Vidéo directe" : "4:3"}</span>
          </button>
        </div>
      </>
    );
  };

  const renderMediaPreview = (item) => {
    const type = getMediaType(item);
    const url = getMediaUrl(item);

    if (type === "image") {
      return (
        <img
          src={url}
          alt={item.name || item.originalName || "Image"}
          className="block h-full w-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            if (e.currentTarget.nextElementSibling) {
              e.currentTarget.nextElementSibling.classList.remove("hidden");
            }
          }}
        />
      );
    }
    if (type === "video") {
      return (
        <div className="relative h-full w-full bg-black">
          <video src={url} className="block h-full w-full object-cover" muted playsInline preload="metadata" />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm">
              <Play size={14} className="ml-0.5 fill-white" />
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
        <FileImage size={22} />
        <span className="text-xs">Type inconnu</span>
      </div>
    );
  };

  const renderMediaCard = (item, library = false) => {
    const type = getMediaType(item);
    const selected = manageLibraryMode && manageTab === "assign" && library && isLibraryItemSelected(item);
    const selectionBadge = selected ? getLibrarySelectionNumber(item) : null;

    return (
      <article
        key={item.id}
        onClick={
          manageLibraryMode && manageTab === "assign" && library
            ? (e) => { e.preventDefault(); toggleLibraryItem(item); }
            : undefined
        }
        className={`group relative rounded-lg border bg-white shadow-sm transition ${
          selected ? "border-red-600 ring-2 ring-red-500/20" : "border-gray-200"
        } ${manageLibraryMode && manageTab === "assign" && library ? "cursor-pointer" : ""} ${
          openMenuId === item.id ? "z-30" : "z-10"
        }`}
      >
        <div className="relative aspect-video overflow-hidden rounded-t-lg bg-gray-100">
          {renderMediaPreview(item)}
          <div className="hidden h-full w-full flex-col items-center justify-center bg-gray-50 text-gray-400">
            <FileImage size={24} />
            <span className="text-[10px] mt-1">Image indisponible</span>
          </div>

          {manageLibraryMode && manageTab === "assign" && library && (
            <>
              <div className={`absolute inset-0 transition ${selected ? "bg-red-600/20" : "bg-transparent group-hover:bg-black/5"}`} />
              <div className={`absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold shadow-sm ${selected ? "border-red-600 bg-red-600 text-white" : "border-white bg-white/90 text-gray-500"}`}>
                {selected && <Check size={14} />}
              </div>
              {selected && (
                <div className="absolute bottom-2 right-2 flex h-7 min-w-7 items-center justify-center rounded-full bg-red-600 px-2 text-xs font-bold text-white shadow-lg">
                  {selectionBadge}
                </div>
              )}
            </>
          )}

          {!manageLibraryMode && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); openDeleteInterface(item); }}
              className="absolute bottom-2 left-2 z-20 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white shadow-lg backdrop-blur-sm transition hover:bg-red-600"
              title="Supprimer"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>

        {!manageLibraryMode && (
          <div className="absolute right-2 top-2 z-20">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenMenuId(openMenuId === item.id ? null : item.id); }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/85 text-gray-900 shadow backdrop-blur-sm transition hover:bg-white hover:text-red-600"
              title="Options"
            >
              <MoreVertical size={16} />
            </button>
            {openMenuId === item.id && renderHomepageMenu(item)}
          </div>
        )}

        <div className={`flex min-w-0 items-center gap-2 px-3 py-2.5 ${library ? "px-2.5" : ""}`}>
          {type === "image" ? <FileImage size={13} className="shrink-0 text-gray-400" /> : <Film size={13} className="shrink-0 text-red-500" />}
          <span className="truncate text-[11px] text-gray-600">{item.name || item.originalName || item.filename || "Média"}</span>
        </div>
      </article>
    );
  };

  const previewMedia = media.slice(0, 4);
  const remainingMedia = Math.max(media.length - 4, 0);

  const filteredMedia = useMemo(() => {
    return media.filter((item) => {
      const search = mediaSearch.trim().toLowerCase();
      const matchSearch = !search || (item.name || item.originalName || item.filename || "").toLowerCase().includes(search);
      if (!matchSearch) return false;

      if (mediaTypeFilter === "image") return getMediaType(item) === "image";
      if (mediaTypeFilter === "video") return getMediaType(item) === "video";
      return true;
    });
  }, [media, mediaSearch, mediaTypeFilter, getMediaType]);

  const INITIAL_LIMIT = 24;
  const displayedLibraryMedia = showAllInLibrary ? filteredMedia : filteredMedia.slice(0, INITIAL_LIMIT);
  const remainingLibraryCount = Math.max(filteredMedia.length - INITIAL_LIMIT, 0);

  const isGalleryIndexValid = Number.isInteger(Number(galleryIndex.trim())) && Number(galleryIndex.trim()) >= 1;
  const isLibraryIndexValid = Number.isInteger(Number(libraryIndex.trim())) && Number(libraryIndex.trim()) >= 1;

  const renderCrop = () => (
    <div
      className="absolute border-2 border-red-600 bg-transparent ring-2 ring-white/80"
      style={{
        left: `${mediaCrop.x}%`,
        top: `${mediaCrop.y}%`,
        width: `${mediaCrop.width}%`,
        height: `${mediaCrop.height}%`,
        transform: "translate(-50%, -50%)",
        cursor: isDraggingCrop ? "grabbing" : "grab",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
      onPointerDown={handleCropPointerDown}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-800 shadow-md backdrop-blur-sm sm:h-10 sm:w-10">
          <Move size={16} className="text-red-600" />
        </div>
      </div>
      <div className="pointer-events-none absolute left-0 right-0 top-1/3 h-px bg-red-500/30" />
      <div className="pointer-events-none absolute left-0 right-0 top-2/3 h-px bg-red-500/30" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 top-0 w-px bg-red-500/30" />
      <div className="pointer-events-none absolute bottom-0 left-2/3 top-0 w-px bg-red-500/30" />
      <div
        data-image-resize
        onPointerDown={resizeMediaCrop}
        className="absolute -bottom-2.5 -right-2.5 hidden h-6 w-6 cursor-se-resize items-center justify-center rounded-full border-2 border-white bg-red-600 shadow-lg transition-transform hover:scale-110 sm:flex"
        style={{ touchAction: "none", userSelect: "none" }}
      >
        <div className="h-1.5 w-1.5 rounded-full bg-white" />
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600">Administration</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">Éditeur dynamique</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gérez les médias pour la page d'accueil et la galerie.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} className="text-red-500 hover:text-red-700">
            <X size={15} />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center justify-between rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-3 text-sm text-green-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
          <button type="button" onClick={() => setSuccess("")} className="text-green-600 hover:text-green-800">
            <X size={15} />
          </button>
        </div>
      )}

      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Importer des médias</h2>
            <p className="mt-1 text-xs text-gray-500">Images et vidéos · import multiple</p>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <ImageIcon size={16} />
            <Video size={16} />
          </div>
        </div>

        <div className="p-5">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-lg border border-dashed px-5 py-7 text-center transition ${
              dragActive ? "border-red-500 bg-red-500/5" : "border-gray-300 hover:border-red-400 hover:bg-red-50/40"
            }`}
          >
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <Upload size={18} className="text-gray-500" />
            </div>
            <p className="mt-3 text-sm font-medium text-gray-700">Déposer vos fichiers ici</p>
            <p className="mt-1 text-xs text-gray-500">ou cliquez pour sélectionner des images et vidéos</p>
            <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" onChange={handleFileInput} className="hidden" />
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {selectedFiles.map((item) => (
                  <div key={item.id} className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <div className="aspect-video bg-gray-100">
                      {item.type === "image" ? (
                        <img src={item.preview} alt={item.file.name} className="h-full w-full object-cover" />
                      ) : (
                        <video src={item.preview} className="h-full w-full object-cover" muted controls />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeSelectedFile(item.id); }}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white opacity-0 transition hover:bg-red-600 group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                    <div className="px-2.5 py-2">
                      <span className="truncate block text-[11px] text-gray-600">{item.file.name}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-600 px-5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {isUploading ? "Importation..." : "Importer"}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Médias disponibles</h2>
            <p className="mt-1 text-xs text-gray-500">{media.length} média(s) stocké(s)</p>
          </div>
          <div className="flex items-center gap-2">
            {media.length > 0 && (
              <button
                type="button"
                onClick={openMediaLibrary}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-gray-200 px-3 text-xs font-medium text-gray-700 hover:bg-red-50 hover:text-red-600"
              >
                <Maximize2 size={13} /> Bibliothèque
              </button>
            )}
            <button
              type="button"
              onClick={openManageLibrary}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-gray-200 px-3 text-xs font-medium text-gray-700 hover:bg-red-50 hover:text-red-600"
            >
              <Check size={13} /> Gérer la galerie
            </button>
            <button
              type="button"
              onClick={() => { loadMedia(); loadExistingProjects(); }}
              disabled={isLoadingMedia}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-gray-200 px-3 text-xs font-medium text-gray-700 hover:text-red-600"
            >
              <RefreshCw size={13} className={isLoadingMedia ? "animate-spin" : ""} /> Actualiser
            </button>
          </div>
        </div>

        <div className="p-5">
          {isLoadingMedia ? (
            <div className="flex min-h-[180px] flex-col items-center justify-center">
              <Loader2 size={22} className="animate-spin text-gray-400" />
            </div>
          ) : media.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-8">Aucun média disponible.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {previewMedia.map((item) => renderMediaCard(item))}
              </div>
              {remainingMedia > 0 && (
                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    onClick={openMediaLibrary}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-red-50 hover:text-red-600"
                  >
                    <Maximize2 size={14} /> Afficher les {remainingMedia} autres médias
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {deleteTarget && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeDeleteInterface} />
          <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Supprimer le média</h2>
            <p className="text-xs text-gray-500 mb-4">Cette action est définitive.</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={closeDeleteInterface} disabled={isDeleting} className="rounded-lg border px-4 py-2 text-xs font-medium">
                Annuler
              </button>
              <button type="button" onClick={handleDelete} disabled={isDeleting} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white">
                {isDeleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {mediaLibraryOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeMediaLibrary} />
          <div className="relative flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="shrink-0 border-b p-4 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  {manageLibraryMode ? (manageTab === "assign" ? "Lier des sous-médias" : "Supprimer des réalisations") : "Bibliothèque média"}
                </h2>
                <p className="text-xs text-gray-500">{filteredMedia.length} média(s) trouvé(s)</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={toggleManageModeInLibrary} className="h-8 px-3 rounded border text-xs font-medium hover:bg-gray-50">
                  {manageLibraryMode ? "Mode standard" : "Gérer la galerie"}
                </button>
                <button type="button" onClick={closeMediaLibrary} className="text-gray-500 hover:text-gray-900">
                  <X size={18} />
                </button>
              </div>
            </div>

            {manageLibraryMode && (
              <div className="flex border-b bg-gray-50 px-4">
                <button
                  type="button"
                  onClick={() => setManageTab("assign")}
                  className={`py-2 px-4 text-xs font-semibold border-b-2 ${manageTab === "assign" ? "border-red-600 text-red-600" : "border-transparent text-gray-500"}`}
                >
                  <PlusCircle size={14} className="inline mr-1" /> 1. Sélectionner & Lier sous-médias
                </button>
                <button
                  type="button"
                  onClick={() => { setManageTab("delete"); loadExistingProjects(); }}
                  className={`py-2 px-4 text-xs font-semibold border-b-2 ${manageTab === "delete" ? "border-red-600 text-red-600" : "border-transparent text-gray-500"}`}
                >
                  <Trash2 size={14} className="inline mr-1" /> 2. Supprimer des réalisations ({existingProjects.length})
                </button>
              </div>
            )}

            {(!manageLibraryMode || manageTab === "assign") && (
              <div className="p-4 border-b bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 rounded-lg border bg-gray-50 px-3 py-1.5 w-full sm:max-w-md">
                  <Search size={14} className="text-gray-400" />
                  <input
                    type="text"
                    value={mediaSearch}
                    onChange={(e) => setMediaSearch(e.target.value)}
                    placeholder="Rechercher par nom..."
                    className="w-full bg-transparent text-xs outline-none"
                  />
                  {mediaSearch && (
                    <button type="button" onClick={() => setMediaSearch("")} className="text-gray-400 hover:text-gray-600">
                      <X size={13} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setMediaTypeFilter("all")}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${mediaTypeFilter === "all" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    Tous
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaTypeFilter("image")}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${mediaTypeFilter === "image" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    Images
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaTypeFilter("video")}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${mediaTypeFilter === "video" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    Vidéos
                  </button>
                </div>
              </div>
            )}

            {manageLibraryMode && manageTab === "assign" && (
              <div className="px-4 py-2.5 bg-red-50/50 border-b flex items-center justify-between gap-2">
                <span className="text-xs text-gray-700">Sélectionnez vos médias et définissez l'index de la réalisation :</span>
                <input
                  type="number"
                  min="1"
                  value={libraryIndex}
                  onChange={(e) => setLibraryIndex(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Index (ex: 1)"
                  className="h-8 w-28 rounded border px-2 text-xs text-center font-bold"
                />
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {manageLibraryMode && manageTab === "delete" ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {existingProjects.map((project) => {
                    const isSelected = selectedDeleteIndices.includes(project.index);
                    return (
                      <div
                        key={project.index}
                        onClick={() => !isDeletingProjects && toggleProjectDeleteSelection(project.index)}
                        className={`cursor-pointer overflow-hidden rounded-xl border bg-white shadow-sm p-2 ${isSelected ? "border-red-600 ring-2 ring-red-500/20" : "border-gray-200"}`}
                      >
                        <div className="relative aspect-video bg-gray-100 rounded mb-2 overflow-hidden">
                          <img src={getMediaUrl(project)} alt="" className="h-full w-full object-cover" />
                          <div className="absolute left-1 top-1 bg-black/70 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">#{project.index}</div>
                          <div className={`absolute right-1 top-1 h-5 w-5 rounded border flex items-center justify-center text-xs ${isSelected ? "bg-red-600 text-white border-red-600" : "bg-white text-transparent border-gray-300"}`}>
                            <Check size={12} />
                          </div>
                        </div>
                        <p className="truncate text-xs font-semibold">{project.title || `Réalisation #${project.index}`}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {displayedLibraryMedia.map((item) => renderMediaCard(item, true))}
                  </div>

                  {!showAllInLibrary && remainingLibraryCount > 0 && (
                    <div className="mt-6 flex flex-col items-center justify-center gap-2 py-4">
                      <button
                        type="button"
                        onClick={() => setShowAllInLibrary(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-xs font-semibold text-white shadow hover:bg-red-700 transition"
                      >
                        <Maximize2 size={14} />
                        Charger tous les médias ({remainingLibraryCount} restants)
                      </button>
                      <span className="text-[11px] text-gray-400">Affichage de {displayedLibraryMedia.length} sur {filteredMedia.length} médias</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="border-t p-4 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  {manageLibraryMode && manageTab === "assign"
                    ? `${selectedLibraryItems.length} sélectionné(s)`
                    : `${displayedLibraryMedia.length} sur ${filteredMedia.length} média(s)`}
                </span>

                {!manageLibraryMode && !showAllInLibrary && remainingLibraryCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAllInLibrary(true)}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Tout afficher ({filteredMedia.length})
                  </button>
                )}
              </div>

              {manageLibraryMode && manageTab === "assign" && (
                <button
                  type="button"
                  onClick={handleApplyLibrary}
                  disabled={!selectedLibraryItems.length || !isLibraryIndexValid || isApplyingLibrary}
                  className="rounded-lg bg-red-600 px-5 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {isApplyingLibrary ? "Enregistrement..." : `Associer au projet #${libraryIndex || "?"}`}
                </button>
              )}
              {manageLibraryMode && manageTab === "delete" && (
                <button
                  type="button"
                  onClick={handleBatchDeleteProjects}
                  disabled={!selectedDeleteIndices.length || isDeletingProjects}
                  className="rounded-lg bg-red-600 px-5 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {isDeletingProjects ? "Suppression..." : `Supprimer (${selectedDeleteIndices.length})`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {mediaEditor && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeMediaEditor} />
          <div className="relative flex max-h-[96vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl p-4 sm:p-6">
            <div className="flex justify-between items-center pb-4 border-b">
              <div>
                <h2 className="text-base font-semibold text-gray-900">{mediaEditor.label}</h2>
                <p className="text-xs text-gray-500">Ajustez le cadrage avant validation.</p>
              </div>
              <button type="button" onClick={closeMediaEditor} className="text-gray-500"><X size={18} /></button>
            </div>

            <div className="my-4 flex items-center justify-center bg-gray-50 p-4 rounded-xl">
              <div className="relative inline-block max-h-[50vh] overflow-hidden rounded-lg">
                {mediaEditor.type === "video" ? (
                  <video src={getMediaUrl(mediaEditor.item)} controls autoPlay muted loop className="max-h-[50vh] rounded-lg" />
                ) : (
                  <>
                    <img
                      ref={editorMediaRef}
                      src={getMediaUrl(mediaEditor.item)}
                      alt=""
                      className="pointer-events-none max-h-[50vh] object-contain"
                      onLoad={handleEditorMediaLoad}
                    />
                    {renderCrop()}
                  </>
                )}
              </div>
            </div>

            {mediaEditor.slot === "gallery" && (
              <div className="grid gap-3 sm:grid-cols-3 mb-4">
                <input
                  type="number"
                  min="1"
                  value={galleryIndex}
                  onChange={(e) => setGalleryIndex(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Index obligatoire *"
                  className="rounded border p-2 text-xs"
                />
                <input
                  type="text"
                  value={galleryTitle}
                  onChange={(e) => setGalleryTitle(e.target.value)}
                  placeholder="Titre facultatif"
                  className="rounded border p-2 text-xs"
                />
                <input
                  type="text"
                  value={galleryDescription}
                  onChange={(e) => setGalleryDescription(e.target.value)}
                  placeholder="Description facultative"
                  className="rounded border p-2 text-xs"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button type="button" onClick={closeMediaEditor} className="rounded border px-4 py-2 text-xs">Annuler</button>
              <button
                type="button"
                onClick={applyMedia}
                disabled={isSavingMedia || (mediaEditor.slot === "gallery" && !isGalleryIndexValid)}
                className="rounded bg-red-600 px-5 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                {isSavingMedia ? "Enregistrement..." : "Appliquer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}