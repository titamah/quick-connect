import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ToastProvider } from "./components/Toast";
import { DeviceProvider } from "./contexts/DeviceContext";
import { PreviewProvider } from "./contexts/PreviewContext";
import Header from "./components/Header/index";
import LoadingSpinner from "./components/LoadingSpinner";
import React from "react";
const LandingPage = lazy(() => import("./pages/LandingPage"));
const StartDesignPage = lazy(() => import("./pages/StartDesignPage"));
const StudioPage = lazy(() => import("./pages/StudioPage"));
const RemixPage = lazy(() => import("./pages/RemixPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
function App() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setIsDarkMode(e.matches);
    setIsDarkMode(mediaQuery.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);
  const AppLoadingSpinner = () => (
    <div className="min-h-screen bg-[var(--bg-main)] dark:bg-neutral-900 flex items-center justify-center">
      <LoadingSpinner size="xlarge" variant="logo" showText={true} text="Loading Quick Connect..." />
    </div>
  );
  return (
    <ToastProvider>
      <DeviceProvider>
        <PreviewProvider>
          <Router>
            <Header />
            <Suspense fallback={<AppLoadingSpinner />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/start-design" element={<StartDesignPage />} />
                <Route path="/studio" element={<StudioPage />} />
                <Route path="/remix/:remixId" element={<RemixPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Router>
        </PreviewProvider>
      </DeviceProvider>
    </ToastProvider>
  );
}
export default App;