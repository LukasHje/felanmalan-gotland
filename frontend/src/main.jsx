import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import 'leaflet/dist/leaflet.css';
import './leaflet-icons'; // <— important! load once globaly
import './index.css'; // Tailwind om du har

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
