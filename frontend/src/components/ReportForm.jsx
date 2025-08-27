// src/components/ReportForm.jsx
import { useEffect, useState } from 'react';

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Okategoriserad' },
  { id: 2, name: 'Belysning' },
  { id: 3, name: 'Väg' },
  { id: 4, name: 'Nedskräpning' },
  { id: 5, name: 'Trasig allmänt' },
];

export default function ReportForm({ prefill, onSubmit, onCancel, categories = DEFAULT_CATEGORIES }) {
  const [title, setTitle] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [desc, setDesc] = useState('');
  const [categoryName, setCategoryName] = useState('Okategoriserad');
  const [userName, setUserName] = useState('Anonym');

  useEffect(() => {
    if (prefill?.lat && prefill?.lon) {
      setLat(prefill.lat.toFixed(6));
      setLon(prefill.lon.toFixed(6));
    }
  }, [prefill]);

  function handleSubmit(e) {
    e.preventDefault();
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
      alert('Lat/Lon måste vara siffror.');
      return;
    }
    const payload = {
      title,
      description: desc,
      lat: latNum,
      lon: lonNum,
      categoryId: Number(categoryId),
    };
    onSubmit?.({ title, description: desc, lat, lon, categoryName, userName });
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <label>
        Titel
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Kort rubrik" required />
      </label>

      <label>
        Kategori
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>

      <label>
        Latitud
        <input value={lat} onChange={e => setLat(e.target.value)} placeholder="57.6" required />
      </label>

      <label>
        Longitud
        <input value={lon} onChange={e => setLon(e.target.value)} placeholder="18.2" required />
      </label>

      <label>
        Beskrivning
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Vad är problemet?" rows={4} />
      </label>

      <label>
        Ditt namn (valfritt)
        <input value={userName} onChange={e => setUserName(e.target.value)} placeholder="Anonym" />
      </label>

      <div style={{ display:'flex', gap:10, marginTop:8 }}>
        <button type="submit" className="btn">Spara</button>
        {onCancel && <button type="button" className="btn ghost" onClick={onCancel}>Rensa</button>}
      </div>
    </form>
  );
}
