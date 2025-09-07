import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ToastContainer } from "react-toastify";
import ConfigProvider from "antd/es/config-provider/index.js";
import theme from "antd/es/theme/index.js";
import { DeviceProvider } from "./contexts/DeviceContext";
import { PreviewProvider } from "./contexts/PreviewContext";
import Header from "./components/Header/index";
import React from "react";

// Lazy load pages
const LandingPage = lazy(() => import("./pages/LandingPage"));
const StartDesignPage = lazy(() => import("./pages/StartDesignPage"));
const StudioPage = lazy(() => import("./pages/StudioPage"));
const RemixPage = lazy(() => import("./pages/RemixPage"));

function App() {
  
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setIsDarkMode(e.matches);
    
    setIsDarkMode(mediaQuery.matches);
    mediaQuery.addEventListener("change", handler);
    
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const antdConfig = React.useMemo(() => ({
    components: {
      Tabs: {
        horizontalItemPadding: 0,
      },
    },
    token: {
      colorPrimary: "#FC6524",
      borderRadius: 4,
    },
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
  }), [isDarkMode]);

  // Loading component for lazy-loaded pages
  const LoadingSpinner = () => (
    <div className="min-h-screen bg-[var(--bg-main)] dark:bg-neutral-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--accent)] mx-auto mb-4"></div>
        <p className="text-[var(--text-secondary)]">Loading...</p>
      </div>
    </div>
  );

  return (
    <ConfigProvider theme={antdConfig}>
      <DeviceProvider>
        <PreviewProvider>
          <Router>
            <ToastContainer />
            <Header />
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/start-design" element={<StartDesignPage />} />
                <Route path="/studio" element={<StudioPage />} />
                <Route path="/remix/:remixId" element={<RemixPage />} />
              </Routes>
            </Suspense>
          </Router>
        </PreviewProvider>
      </DeviceProvider>
    </ConfigProvider>
  );
}

export default App;