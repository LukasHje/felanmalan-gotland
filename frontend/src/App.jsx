import { useEffect, useState } from 'react';
import MapView from './components/MapView.jsx';
import ReportForm from './components/ReportForm.jsx';
import ReportList from './components/ReportList.jsx';
import './index.css';

// Robust bas-URL: '/api' i dev (proxas av Vite), eller full URL i prod
const RAW = (import.meta.env.VITE_API_BASE ?? '/api').trim();
const API_BASE = RAW.endsWith('/') ? RAW.slice(0, -1) : RAW;
const api = (p) => `${API_BASE}${p.startsWith('/') ? p : '/' + p}`;


// Kategori-lista för UI (mappas id -> name i submit)
const CATEGORIES = [
  { id: 0, name: 'Okategoriserad' },
  { id: 1, name: 'Belysning' },
  { id: 2, name: 'Väg' },
  { id: 3, name: 'Nedskräpning' },
  { id: 4, name: 'Trasig allmänt' },
];

export default function App() {
  const [reports, setReports] = useState([]);
  const [prefillCoords, setPrefillCoords] = useState(null);
  const [showList, setShowList] = useState(false);

  async function loadReports() {
    const res = await fetch(api('/reports'));
    if (!res.ok) throw new Error('GET /reports ' + res.status);
    const data = await res.json();
    const flat = Array.isArray(data)
      ? data.map(r => ({
          id: r.id,
          description: r.description,
          lat: Number(r.lat),
          lng: Number(r.lng),
          categoryName: r.categoryName,
          userName: r.userName,
        }))
      : [];
    setReports(flat.filter(x => Number.isFinite(x.lat) && Number.isFinite(x.lng)));
  }

  useEffect(() => { loadReports().catch(console.error); }, []);

  async function handleCreateReport(form) {
    const selected = CATEGORIES.find(c => c.id === Number(form.categoryId));
    const payload = {
      description: form.description ?? '',
      lat: Number(form.lat),
      lng: Number(form.lon ?? form.lng), // lon i form -> lng i backend
      categoryName: selected?.name ?? (form.categoryName ?? 'Okategoriserad'),
      userName: (form.userName?.trim() || 'Anonym'),
    };
    const res = await fetch(api('/reports'), {
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
          <button className="btn secondary" onClick={() => setShowList(v => !v)}>
            {showList ? 'Dölj lista' : 'Visa lista'}
          </button>
          <button className="btn" onClick={() => loadReports().catch(console.error)}>
            Uppdatera
          </button>
        </div>
      </header>

      <main className="content">
        <div className="layout">
          <section className="panel form-panel">
            <h2>Ny rapport</h2>
            <p style={{ opacity: 0.8, marginTop: -6 }}>Klicka i kartan för att fylla lat/lng.</p>
            <ReportForm
              categories={CATEGORIES}
              prefill={prefillCoords}
              onSubmit={handleCreateReport}
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
              onMapClick={(coords) => setPrefillCoords(coords)}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
