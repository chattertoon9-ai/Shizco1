import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for offline field access & caching
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[Al Asad PWA] Service Worker registered with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('[Al Asad PWA] Service Worker registration:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
