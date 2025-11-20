// src/main.tsx or index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import App from './App';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { NotificationsProvider } from './context/NotificationsContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>

    <Provider store={store}>
       <NotificationsProvider>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
      </NotificationsProvider>
    </Provider>
  </React.StrictMode>
);