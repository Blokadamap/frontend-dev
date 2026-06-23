import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Map from "./pages/Map/Map";
import AboutPage from "./pages/About/AboutPage";
import AuthorsPage from "./pages/Authors/AuthorsPage";
import AuthorDetailPage from "./pages/Authors/AuthorDetailPage";
import EvidencePage from "./pages/Evidence/EvidencePage";
import SiteLayout from "./components/layout/SiteLayout";
import { LoginPage } from "./pages/Auth/LoginPage";
import { RequireAuth } from "./components/auth/RequireAuth";
import { AdminPage } from "./pages/AdminPage/AdminPage";
import PrivacyPage from "./pages/Privacy/PrivacyPage";
import CookieBanner from "./components/layout/CookieBanner";
import { useYandexMetrika } from "./hooks/useYandexMetrika";

function MetrikaTracker() {
  useYandexMetrika();
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <MetrikaTracker />
      <Routes>
        <Route
          path="/"
          element={
            <SiteLayout>
              <AboutPage />
            </SiteLayout>
          }
        />
        <Route path="/map" element={<Map />} />
        <Route
          path="/authors"
          element={
            <SiteLayout>
              <AuthorsPage />
            </SiteLayout>
          }
        />
        <Route
          path="/authors/:id"
          element={
            <SiteLayout>
              <AuthorDetailPage />
            </SiteLayout>
          }
        />
        <Route
          path="/evidence"
          element={
            <SiteLayout>
              <EvidencePage />
            </SiteLayout>
          }
        />
        <Route
          path="/privacy"
          element={
            <SiteLayout>
              <PrivacyPage />
            </SiteLayout>
          }
        />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminPage />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <CookieBanner />
    </BrowserRouter>
  );
}

export default App;
