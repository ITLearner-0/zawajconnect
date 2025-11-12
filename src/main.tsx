import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupGlobalErrorHandler } from './errorHandler';
import { ErrorBoundary } from './components/ErrorBoundary';

// Setup global error handler BEFORE anything else
setupGlobalErrorHandler();

try {
  const container = document.getElementById('root');
  if (!container) throw new Error('Failed to find the root element');

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Fatal error during app initialization:', error);
  // Global error handler will catch this and display error page
  throw error;
}
