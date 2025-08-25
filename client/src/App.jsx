// App.jsx - Router setup
import "./App.css";
import "preline/preline";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { ConfigProvider, theme } from "antd";
import { DeviceProvider } from "./contexts/DeviceContext";
import { PreviewProvider } from "./contexts/PreviewContext";
import Header from "./components/Header/index";
import LandingPage from "./pages/LandingPage";
import StudioPage from "./pages/StudioPage";
import GalleryPage from "./pages/GalleryPage";
import React from "react";

function App() {
  // Theme detection
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

  return (
    <ConfigProvider theme={antdConfig}>
      <DeviceProvider>
        <PreviewProvider>
          <Router>
            <ToastContainer />
            <Header />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/studio" element={<StudioPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
            </Routes>
          </Router>
        </PreviewProvider>
      </DeviceProvider>
    </ConfigProvider>
  );
}

export default App;