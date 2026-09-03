import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

// Public
import Navbar from "./public/components/Navbar";
import Footer from "./public/components/Footer";
import Home from "./public/pages/Home";
import Services from "./public/pages/Services";
import Realisations from "./public/pages/Realisations";
import Informations from "./public/pages/Informations";
import Contact from "./public/pages/Contact";
import Reviews from "./public/pages/Reviews";

// Admin
import AdminLayout from "./admin/AdminLayout";
import AdminLogin from "./admin/AdminLogin";
import Dashboard from "./admin/pages/Dashboard";
import DynamicEditor from "./admin/pages/DynamicEditor";
import StaticEditor from "./admin/pages/StaticEditor";
import ReviewsManager from "./admin/pages/ReviewsManager";
// 👇 1. Import your new Admin Demands page
import ReviewsDemands from "./admin/pages/ReviewsDemands";

function Layout() {
  const location = useLocation();

  const isAdmin = location.pathname
    .toLowerCase()
    .startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      {!isAdmin && <Navbar />}

      <main className="flex-grow">
        <Routes>

          {/* =========================
              PUBLIC
          ========================= */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/services"
            element={<Services />}
          />

          <Route
            path="/realisations"
            element={<Realisations />}
          />

          <Route
            path="/informations"
            element={<Informations />}
          />

          <Route
            path="/contact"
            element={<Contact />}
          />

          <Route
            path="/reviews"
            element={<Reviews />}
          />


          {/* =========================
              ADMIN LOGIN
          ========================= */}

          <Route
            path="/admin/login"
            element={<AdminLogin />}
          />


          {/* =========================
              ADMIN APPLICATION
          ========================= */}

          <Route
            path="/admin"
            element={<AdminLayout />}
          >

            <Route
              index
              element={
                <Navigate
                  to="/admin/dashboard"
                  replace
                />
              }
            />

            <Route
              path="dashboard"
              element={<Dashboard />}
            />

            <Route
              path="editeur-dynamique"
              element={<DynamicEditor />}
            />

            <Route
              path="editeur-statique"
              element={<StaticEditor />}
            />

            <Route
              path="avis"
              element={<ReviewsManager />}
            />

            {/* 👇 2. Add the route here: accessible at /admin/demandes-avis */}
            <Route
              path="demandes-avis"
              element={<ReviewsDemands />}
            />

          </Route>


          {/* =========================
              FALLBACK
          ========================= */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>
      </main>

      {!isAdmin && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}