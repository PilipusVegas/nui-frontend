import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Toaster } from 'react-hot-toast';

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
