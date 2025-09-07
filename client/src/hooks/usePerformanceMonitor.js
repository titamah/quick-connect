import { useEffect, useRef } from 'react';
export const usePerformanceMonitor = (componentName, dependencies = []) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(0);
  const lastLogTime = useRef(0);
  if (window.performance) {
    const currentTime = window.performance.now();
    const timeSinceLastRender = lastRenderTime.current ? currentTime - lastRenderTime.current : 0;
    lastRenderTime.current = currentTime;
    renderCount.current += 1;
    const shouldLog = renderCount.current % 10 === 0 || timeSinceLastRender > 100;
    useEffect(() => {
      if (process.env.NODE_ENV === 'development' && shouldLog) {
        console.log(`📊 ${componentName} render #${renderCount.current} (${timeSinceLastRender.toFixed(2)}ms since last render)`);
      }
    });
  } else {
    renderCount.current += 1;
  }
  const prevDeps = useRef([]);
  useEffect(() => {
    const depsChanged = JSON.stringify(dependencies) !== JSON.stringify(prevDeps.current);
    if (process.env.NODE_ENV === 'development' && depsChanged) {
      console.log(`🔍 ${componentName} effect dependencies changed:`, dependencies);
      prevDeps.current = [...dependencies];
    }
  }, dependencies);
  return {
    renderCount: renderCount.current,
    timeSinceLastRender: lastRenderTime.current ? window.performance.now() - lastRenderTime.current : 0,
    logPerformance: (message, data) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`📈 ${componentName}: ${message}`, data);
      }
    }
  };
};
