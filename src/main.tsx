
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import './i18n';

// Import performance monitoring components
import PerformanceMonitor from '@/components/ui/PerformanceMonitor';

// Initialize advanced cache
import { advancedCacheService } from '@/services/caching/advancedCacheService';

// Initialize WebSocket service
import { websocketService } from '@/services/realtime/websocketService';

// Performance monitoring
if (typeof window !== 'undefined') {
  // Start WebSocket heartbeat
  websocketService.startHeartbeat();
  
  // Preload critical resources
  advancedCacheService.preload([
    {
      key: 'demo-personas',
      fetcher: () => import('@/data/demoPersonas').then(m => m.demoPersonas),
      config: { ttl: 60 * 60 * 1000, persistent: true }
    },
    {
      key: 'islamic-resources',
      fetcher: () => import('@/data/islamicResources').then(m => m.islamicResources),
      config: { ttl: 24 * 60 * 60 * 1000, persistent: true }
    }
  ]);
  
  // Memory optimization
  window.addEventListener('beforeunload', () => {
    websocketService.cleanup();
  });
  
  // Handle memory pressure
  if ('memory' in performance) {
    const checkMemory = () => {
      const memory = (performance as any).memory;
      const usage = memory.usedJSHeapSize / memory.totalJSHeapSize;
      
      if (usage > 0.8) {
        console.warn('High memory usage detected, clearing caches');
        advancedCacheService.clear();
      }
    };
    
    setInterval(checkMemory, 30000);
  }
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
    <PerformanceMonitor />
  </BrowserRouter>
);
