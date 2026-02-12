import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Toaster } from 'react-hot-toast';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <App />
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 2500,
        style: {
          fontSize: '14px',
          borderRadius: '10px',
          padding: '10px 14px',
          fontWeight: 500,
          background: '#fff',
          color: '#333',
          boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
        },
        success: {
          iconTheme: {
            primary: '#22c55e', // hijau cerah
            secondary: '#fff',
          },
          style: { color: '#22c55e' },
        },
        error: {
          iconTheme: {
            primary: '#ef4444', // merah cerah
            secondary: '#fff',
          },
          style: { color: '#ef4444' },
        },
        loading: {
          iconTheme: {
            primary: '#f59e0b', // amber cerah
            secondary: '#fff',
          },
          style: { color: '#d97706' },
        },
      }}
    />
  </>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(reg => {
        console.log("✅ Service Worker registered:", reg);
      })
      .catch(err => {
        console.error("❌ Service Worker registration failed:", err);
      });
  });
}
