"use client";

import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FileEdit,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Home,
  Star,
  ChevronDown,
  Inbox,
} from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [parisTime, setParisTime] = useState("");

  // ============================================================
  // AUTHENTICATION
  // ============================================================

  useEffect(() => {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);

  // ============================================================
  // PARIS TIME
  // ============================================================

  useEffect(() => {
    const updateTime = () => {
      setParisTime(
        new Intl.DateTimeFormat("fr-FR", {
          timeZone: "Europe/Paris",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date())
      );
    };

    updateTime();

    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");

    setMobileMenuOpen(false);
    setProfileOpen(false);

    navigate("/admin/login", {
      replace: true,
    });
  };

  // ============================================================
  // NAVIGATION (Demandes d'avis placed above Avis clients)
  // ============================================================

  const navigation = [
    {
      name: "Tableau de bord",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Éditeur dynamique",
      path: "/admin/editeur-dynamique",
      icon: FileEdit,
    },
    {
      name: "Éditeur statique",
      path: "/admin/editeur-statique",
      icon: FileText,
    },
    {
      name: "Demandes d'avis",
      path: "/admin/demandes-avis",
      icon: Inbox,
    },
    {
      name: "Avis clients",
      path: "/admin/avis",
      icon: Star,
    },
  ];

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path) => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
    navigate(path);
  };

  const toggleSidebar = () => {
    setSidebarOpen((current) => !current);
  };

  const handleBrandClick = () => {
    if (!sidebarOpen) {
      setSidebarOpen(true);
      return;
    }

    navigate("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-white text-black flex">

      {/* ============================================================
          DESKTOP SIDEBAR
      ============================================================ */}

      <aside
        className={`
          hidden lg:flex
          ${sidebarOpen ? "w-64" : "w-[72px]"}
          flex-col
          bg-white
          border-r border-black/10
          transition-all duration-200
          shrink-0
        `}
      >

        {/* BRAND */}

        <div
          className={`
            h-16 flex items-center
            border-b border-black/10
            ${
              sidebarOpen
                ? "px-4 justify-between"
                : "px-3 justify-center"
            }
          `}
        >

          <button
            onClick={handleBrandClick}
            title={
              !sidebarOpen
                ? "Ouvrir le menu"
                : "Tableau de bord"
            }
            className={`
              flex items-center gap-3 min-w-0
              ${sidebarOpen ? "" : "justify-center"}
            `}
          >

            <div
              className="
                w-9 h-9 shrink-0
                bg-red-600 rounded-lg
                flex items-center justify-center
              "
            >
              <span className="font-black text-white text-sm">
                M
              </span>
            </div>

            {sidebarOpen && (
              <div className="text-left min-w-0">
                <div className="font-bold text-black tracking-tight truncate">
                  Mira entreprise
                </div>

                <div className="text-[10px] text-black/50 uppercase tracking-wider">
                  Administration
                </div>
              </div>
            )}

          </button>

          {sidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="
                p-2 rounded-lg
                text-black/60
                hover:text-red-600
                hover:bg-red-50
                shrink-0
              "
              aria-label="Réduire le menu"
            >
              <Menu size={19} />
            </button>
          )}

        </div>

        {/* COLLAPSED MENU */}

        {!sidebarOpen && (
          <div className="flex justify-center pt-3">

            <button
              onClick={toggleSidebar}
              className="
                p-2 rounded-lg
                text-black/60
                hover:text-red-600
                hover:bg-red-50
              "
              aria-label="Ouvrir le menu"
              title="Ouvrir le menu"
            >
              <Menu size={19} />
            </button>

          </div>
        )}

        {/* NAVIGATION */}

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">

          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() =>
                  handleNavigation(item.path)
                }
                title={
                  !sidebarOpen
                    ? item.name
                    : undefined
                }
                className={`
                  relative
                  w-full
                  flex items-center gap-3
                  ${
                    sidebarOpen
                      ? "px-3"
                      : "justify-center"
                  }
                  min-h-10
                  rounded-lg
                  text-sm
                  transition-colors
                  ${
                    active
                      ? "bg-red-50 text-red-600"
                      : "text-black/60 hover:bg-red-50 hover:text-red-600"
                  }
                `}
              >

                {active && (
                  <span
                    className="
                      absolute left-0 top-1/2
                      -translate-y-1/2
                      w-0.5 h-5
                      bg-red-600 rounded-r
                    "
                  />
                )}

                <Icon
                  size={18}
                  strokeWidth={
                    active ? 2.2 : 1.8
                  }
                />

                {sidebarOpen && (
                  <span className="flex-1 text-left leading-5 truncate">
                    {item.name}
                  </span>
                )}

              </button>
            );
          })}

        </nav>

        {/* STATUS */}

        {sidebarOpen && (
          <div className="px-4 pb-4">

            <div
              className="
                border border-green-200
                bg-green-50
                rounded-xl
                p-4
              "
            >

              <div className="flex items-center gap-3">

                <span
                  className="
                    w-3 h-3
                    rounded-full
                    bg-green-500
                    shrink-0
                    ring-4 ring-green-100
                  "
                />

                <div>
                  <div className="text-xs font-semibold text-green-800">
                    Système en ligne
                  </div>

                  <div className="text-[10px] text-green-700/70 mt-0.5">
                    Administration active
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* DESKTOP ACTIONS */}

        <div className="p-3 border-t border-black/10 space-y-2">

          <button
            onClick={() => navigate("/")}
            title={!sidebarOpen ? "Retour au site" : undefined}
            className={`
              w-full
              flex items-center gap-3
              ${sidebarOpen ? "px-3" : "justify-center"}
              h-11
              rounded-lg
              text-sm
              font-medium
              text-black/70
              border border-black/10
              hover:border-red-200
              hover:bg-red-50
              hover:text-red-600
              transition
            `}
          >

            <Home size={18} />

            {sidebarOpen && (
              <span>Retour au site</span>
            )}

          </button>

          <button
            onClick={handleLogout}
            title={!sidebarOpen ? "Déconnexion" : undefined}
            className={`
              w-full
              flex items-center gap-3
              ${sidebarOpen ? "px-3" : "justify-center"}
              h-11
              rounded-lg
              text-sm
              font-semibold
              text-red-600
              bg-red-50
              border border-red-100
              hover:bg-red-600
              hover:text-white
              transition
            `}
          >

            <LogOut size={18} />

            {sidebarOpen && (
              <span>Déconnexion</span>
            )}

          </button>

        </div>

      </aside>

      {/* ============================================================
          MOBILE SIDEBAR
      ============================================================ */}

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">

          <div
            className="absolute inset-0 bg-black/40"
            onClick={() =>
              setMobileMenuOpen(false)
            }
          />

          <aside
            className="
              absolute left-0 top-0 bottom-0
              w-[min(18rem,85vw)]
              bg-white
              border-r border-black/10
              flex flex-col
            "
          >

            {/* MOBILE HEADER */}

            <div
              className="
                h-16 px-4
                flex items-center justify-between
                border-b border-black/10
                shrink-0
              "
            >

              <button
                onClick={() =>
                  handleNavigation(
                    "/admin/dashboard"
                  )
                }
                className="flex items-center gap-3"
              >

                <div
                  className="
                    w-9 h-9 shrink-0
                    bg-red-600 rounded-lg
                    flex items-center justify-center
                  "
                >
                  <span className="font-black text-white text-sm">
                    M
                  </span>
                </div>

                <div className="text-left">

                  <div className="font-bold text-black truncate">
                    Mira entreprise
                  </div>

                  <div className="text-[10px] text-black/50 uppercase tracking-wider">
                    Administration
                  </div>

                </div>

              </button>

              <button
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="
                  p-2 rounded-lg
                  text-black/60
                  hover:text-red-600
                  hover:bg-red-50
                "
                aria-label="Fermer le menu"
              >
                <X size={20} />
              </button>

            </div>

            {/* MOBILE NAV */}

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">

              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <button
                    key={item.path}
                    onClick={() =>
                      handleNavigation(
                        item.path
                      )
                    }
                    className={`
                      w-full
                      min-h-11
                      px-3
                      flex items-center gap-3
                      rounded-lg
                      text-sm
                      transition-colors
                      ${
                        active
                          ? "bg-red-50 text-red-600"
                          : "text-black/60 hover:bg-red-50 hover:text-red-600"
                      }
                    `}
                  >

                    <Icon
                      size={18}
                      strokeWidth={
                        active ? 2.2 : 1.8
                      }
                    />

                    <span className="flex-1 text-left">
                      {item.name}
                    </span>

                  </button>
                );
              })}

            </nav>

            {/* MOBILE STATUS */}

            <div className="px-3 pb-3">

              <div
                className="
                  border border-green-200
                  bg-green-50
                  rounded-xl
                  p-4
                "
              >

                <div className="flex items-center gap-3">

                  <span
                    className="
                      w-3 h-3
                      rounded-full
                      bg-green-500
                      ring-4 ring-green-100
                    "
                  />

                  <div>
                    <div className="text-xs font-semibold text-green-800">
                      Système en ligne
                    </div>

                    <div className="text-[10px] text-green-700/70">
                      Administration active
                    </div>
                  </div>

                </div>

              </div>

            </div>

            {/* MOBILE ACTIONS */}

            <div
              className="
                p-3
                border-t border-black/10
                space-y-2
                shrink-0
              "
            >

              <button
                onClick={() =>
                  handleNavigation("/")
                }
                className="
                  w-full
                  h-11
                  px-3
                  flex items-center gap-3
                  rounded-lg
                  text-sm
                  font-medium
                  text-black/70
                  border border-black/10
                  hover:bg-red-50
                  hover:text-red-600
                  transition
                "
              >

                <Home size={18} />

                <span>
                  Retour au site
                </span>

              </button>

              <button
                onClick={handleLogout}
                className="
                  w-full
                  h-11
                  px-3
                  flex items-center gap-3
                  rounded-lg
                  text-sm
                  font-semibold
                  text-red-600
                  bg-red-50
                  border border-red-100
                  hover:bg-red-600
                  hover:text-white
                  transition
                "
              >

                <LogOut size={18} />

                <span>
                  Déconnexion
                </span>

              </button>

            </div>

          </aside>

        </div>
      )}

      {/* ============================================================
          MAIN APPLICATION
      ============================================================ */}

      <div className="flex-1 min-w-0 flex flex-col">

        {/* TOP BAR */}

        <header
          className="
            h-16
            min-h-16
            bg-white
            border-b border-black/10
            flex items-center justify-between
            px-3 sm:px-4 lg:px-6
            shrink-0
          "
        >

          {/* LEFT */}

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                setMobileMenuOpen(true)
              }
              className="
                lg:hidden
                p-2 rounded-lg
                text-black/60
                hover:text-red-600
                hover:bg-red-50
              "
              aria-label="Ouvrir le menu"
            >
              <Menu size={20} />
            </button>

            <div className="hidden sm:block">

              <div className="text-[10px] text-black/40 uppercase tracking-wider">
                Administration
              </div>

              <div className="text-sm font-semibold text-black">
                Mira entreprise
              </div>

            </div>

          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-3">

            {/* PARIS TIME */}

            <div
              className="
                flex items-center gap-2
                px-3 py-2
                rounded-lg
                bg-black/[0.03]
                border border-black/10
              "
            >

              <span
                className="
                  w-2 h-2
                  rounded-full
                  bg-green-500
                "
              />

              <div className="text-right">

                <div className="text-[9px] text-black/40 uppercase tracking-wider">
                  Paris
                </div>

                <div className="text-xs font-semibold tabular-nums text-black">
                  {parisTime || "--:--:--"}
                </div>

              </div>

            </div>

            <div className="hidden sm:block h-6 w-px bg-black/10" />

            {/* PROFILE */}

            <div className="relative">

              <button
                onClick={() =>
                  setProfileOpen(
                    (current) => !current
                  )
                }
                className="
                  flex items-center gap-2
                  p-1.5 rounded-lg
                  hover:bg-red-50
                "
              >

                <div
                  className="
                    w-8 h-8 shrink-0
                    bg-red-600 rounded-lg
                    flex items-center justify-center
                    text-xs font-bold text-white
                  "
                >
                  A
                </div>

                <div className="hidden sm:block text-left">

                  <div className="text-xs font-semibold text-black">
                    {localStorage.getItem(
                      "admin_user"
                    ) || "Administrateur"}
                  </div>

                  <div className="text-[10px] text-black/50">
                    Mira entreprise
                  </div>

                </div>

                <ChevronDown
                  size={14}
                  className="hidden sm:block text-black/50"
                />

              </button>

              {profileOpen && (
                <div
                  className="
                    absolute right-0 top-11
                    w-48
                    bg-white
                    border border-black/10
                    rounded-lg
                    shadow-xl
                    p-1.5
                    z-50
                  "
                >

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/");
                    }}
                    className="
                      w-full
                      flex items-center gap-2
                      text-left
                      px-3 py-2.5
                      rounded-md
                      text-xs
                      font-medium
                      text-black/60
                      hover:bg-red-50
                      hover:text-red-600
                    "
                  >

                    <Home size={14} />

                    Retour au site

                  </button>

                  <div className="my-1 border-t border-black/10" />

                  <button
                    onClick={handleLogout}
                    className="
                      w-full
                      flex items-center gap-2
                      px-3 py-2.5
                      rounded-md
                      text-xs
                      font-semibold
                      text-red-600
                      hover:bg-red-50
                    "
                  >

                    <LogOut size={14} />

                    Déconnexion

                  </button>

                </div>
              )}

            </div>

          </div>

        </header>

        {/* PAGE CONTENT */}

        <main className="flex-1 overflow-y-auto bg-white">

          <div
            className="
              w-full
              max-w-[1600px]
              mx-auto
              p-4
              sm:p-6
              lg:p-8
            "
          >
            <Outlet />
          </div>

        </main>

      </div>

    </div>
  );
}