import React, { useEffect, useMemo, useRef, useState } from 'react';
import MapView from './components/MapView.jsx';
import ReportForm from './components/ReportForm.jsx';
import ReportList from './components/ReportList.jsx';
import './index.css';

// ---- API-bas (proxas i dev om VITE_API_BASE=/api) ----
const RAW = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE)
  ? String(import.meta.env.VITE_API_BASE)
  : '/api';
const CLEAN = RAW.trim();
const API_BASE = CLEAN.endsWith('/') ? CLEAN.slice(0, -1) : CLEAN;
const api = (p) => `${API_BASE}${p.startsWith('/') ? p : '/' + p}`;


// Kategori-lista för UI (mappas id -> name i submit)
const CATEGORIES = [
  { id: 0, name: 'Okategoriserad' },
  { id: 1, name: 'Belysning' },
  { id: 2, name: 'Väg' },
  { id: 3, name: 'Nedskräpning' },
  { id: 4, name: 'Trasig allmänt' },
];
const FILTERS = ['Alla', ...CATEGORIES.map(c => c.name)];

export default function App() {
  const [reports, setReports] = useState([]);
  const [prefillCoords, setPrefillCoords] = useState(null);
  const [showList, setShowList] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);
  const [toastMsg, setToastMsg] = useState(null);
  const [mapFocus, setMapFocus] = useState(null);

  // Filter – dropdown i Karta-raden
  const [activeFilter, setActiveFilter] = useState('Alla');

  const toastTimer = useRef(null);

  function showToast(msg, ms = 2500) {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), ms);
  }

  async function loadReports() {
    try {
      const res = await fetch(api('/reports'));
      if (!res.ok) {
        console.error('GET /reports failed:', res.status, await res.text().catch(() => ''));
        return;
      }
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
    } catch (err) {
      console.error('GET /reports error:', err);
    }
  }

  useEffect(() => {
    loadReports();
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredReports = useMemo(() => {
    if (activeFilter === 'Alla') return reports;
    return reports.filter(r => (r.categoryName || '').toLowerCase() === activeFilter.toLowerCase());
  }, [reports, activeFilter]);

  async function handleCreateReport(form) {
    const selected = CATEGORIES.find(c => c.id === Number(form.categoryId));
    const payload = {
      description: form.description ?? '',
      lat: Number(form.lat),
      lng: Number(form.lon ?? form.lng),
      categoryName: selected?.name ?? (form.categoryName ?? 'Okategoriserad'),
      userName: (form.userName?.trim() || 'Anonym'),
      userEmail: (form.userEmail?.trim() || ''),
    };

    try {
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

      // Rensa draft + formulär, visa bekräftelse och ladda om
      setPrefillCoords(null);
      setFormResetKey(k => k + 1);
      showToast('Ärendet har skickats och kommer att hanteras.');
      await loadReports();
    } catch (err) {
      console.error('POST /reports error:', err);
      alert('Kunde inte spara rapporten (nätverksfel i frontend). Se Console.');
    }
  }

  return (
    <div className="page">
      <header className="topbar">
        Felanmälan Gotland
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn secondary" onClick={() => setShowList(v => !v)}>
            {showList ? 'Dölj lista' : 'Visa lista'}
          </button>
          <button className="btn" onClick={() => loadReports()}>
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
              key={formResetKey}                 // re-mount => rensar fälten
              categories={CATEGORIES}
              prefill={prefillCoords}
              onSubmit={handleCreateReport}
              onCancel={() => {                  // Rensa-knapp
                setPrefillCoords(null);
                setFormResetKey(k => k + 1);
              }}
            />
            {showList && (
              <>
                <hr className="divider" />
                <h3>Alla rapporter</h3>
                <p style={{ marginTop: -6, color: 'var(--muted)' }}>
                  Visar {filteredReports.length} av {reports.length}
                </p>
                <ReportList
                  items={filteredReports}
                  onSelect={(r) => setMapFocus({ lat: r.lat, lng: r.lng, zoom: 16 })}
                />
              </>
            )}
          </section>

          <section className="panel map-panel">
            <div className="panel-header">
              <h2>Karta</h2>
              <div className="select">
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  aria-label="Filtrera kategori"
                >
                  <option value="Alla">Alla kategorier</option>
                  {CATEGORIES.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <MapView
              reports={filteredReports}
              draftMarker={prefillCoords}
              onMapClick={(coords) => setPrefillCoords(coords)}
              focus={mapFocus}
              onFocused={() => setMapFocus(null)}
            />
          </section>
        </div>
      </main>

      {toastMsg && <div className="toast success">{toastMsg}</div>}
    </div>
  );
}