// src/App.jsx
import { useEffect, useState } from 'react';
import MapView from './components/MapView';
import ReportForm from './components/ReportForm';
import ReportList from './components/ReportList'; // valfritt
import './index.css';

const API_BASE = 'http://192.168.0.42:8080';
const api = (p) => `${API_BASE}${p}`;

export default function App() {
  const [reports, setReports] = useState([]);
  const [prefillCoords, setPrefillCoords] = useState(null); // to fill and submit form on map-click
  const [showList, setShowList] = useState(false);

  // Get reports (supports both GeoJSON and array)
  async function loadReports() {
    const res = await fetch(api('/api/reports'));
    const data = await res.json();
    if (data?.type === 'FeatureCollection') {
      const flat = data.features.map(f => ({
        id: f.id || f.properties?.id,
        title: f.properties?.title || 'Rapport',
        lat: f.geometry?.coordinates?.[1],
        lon: f.geometry?.coordinates?.[0],
      })).filter(x => Number.isFinite(x.lat) && Number.isFinite(x.lon));
      setReports(flat);
    } else if (Array.isArray(data)) {
      const flat = data.map(r => ({
        id: r.id,
        title: r.title || r.description || 'Rapport',
        lat: r.lat ?? r.latitude,
        lon: r.lon ?? r.longitude,
      })).filter(x => Number.isFinite(x.lat) && Number.isFinite(x.lon));
      setReports(flat);
    } else {
      setReports([]);
    }
  }

  useEffect(() => { loadReports().catch(console.error); }, []);

async function handleCreateReport(formData) {
  const lat = Number(formData.lat);
  const lng = Number(formData.lon ?? formData.lng); // mappar lon → lng
  const payload = {
    description: formData.description ?? '',
    lat,
    lng,
    categoryName: formData.categoryName ?? 'Okategoriserad',
    userName: formData.userName ?? 'Anonym',
  };

  const res = await fetch(api('/api/reports'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    alert('Kunde inte spara rapporten: ' + (text || res.status));
    return;
  }
  setPrefillCoords(null);
  await loadReports();
}


  return (
    <div className="page">
      <header className="topbar">
        Felanmälan Gotland
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => setShowList(v => !v)}>
            {showList ? 'Dölj lista' : 'Visa lista'}
          </button>
          <button className="btn" onClick={loadReports}>Uppdatera</button>
        </div>
      </header>

      <main className="content">
        <div className="layout">
          <section className="panel form-panel">
            <h2>Ny rapport</h2>
            <p style={{ opacity: 0.85, marginTop: -6 }}>
              Tips: klicka på kartan för att förfylla lat/lon.
            </p>
            <ReportForm
              prefill={prefillCoords}             // { lat, lon } if user clicks map
              onSubmit={handleCreateReport}       // callback that POST and reload
              onCancel={() => setPrefillCoords(null)}
            />
            {showList && (
              <>
                <hr className="divider" />
                <h3>Alla rapporter</h3>
                <ReportList items={reports} />
              </>
            )}
          </section>

          <section className="panel map-panel">
            <h2>Karta</h2>
            <MapView
              reports={reports}
              draftMarker={prefillCoords}
              onMapClick={(coords) => setPrefillCoords(coords)}        // fill form
              onMarkerClick={(r) => setPrefillCoords({            // click on marker → populate form
                lat: r.lat, lon: r.lon,
              })}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
