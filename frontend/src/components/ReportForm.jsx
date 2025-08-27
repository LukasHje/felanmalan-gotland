import { useEffect, useState } from 'react';

export default function ReportForm({ prefill, onSubmit, onCancel, categories = [] }) {
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? 1);
  const [userName, setUserName] = useState('Anonym');

  useEffect(() => {
    if (prefill?.lat && prefill?.lon) {
      setLat(prefill.lat.toFixed(6));
      setLon(prefill.lon.toFixed(6));
    }
  }, [prefill]);

  function handleSubmit(e) {
    e.preventDefault();
    const latNum = Number(lat);
    const lonNum = Number(lon);
    if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
      alert('Lat/Lon måste vara siffror.');
      return;
    }
    onSubmit?.({ lat: latNum, lon: lonNum, description, categoryId, userName });
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>Beskrivning
        <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Kort beskrivning" required />
      </label>

      <label>Kategori
        <select value={categoryId} onChange={e => setCategoryId(Number(e.target.value))}>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>

      <label>Latitud
        <input value={lat} onChange={e => setLat(e.target.value)} placeholder="57.636" required />
      </label>

      <label>Longitud
        <input value={lon} onChange={e => setLon(e.target.value)} placeholder="18.294" required />
      </label>

      <label>Ditt namn (valfritt)
        <input value={userName} onChange={e => setUserName(e.target.value)} placeholder="Anonym" />
      </label>

      <div style={{ display:'flex', gap:10, marginTop:8 }}>
        <button type="submit" className="btn">Spara</button>
        {onCancel && <button type="button" className="btn ghost" onClick={onCancel}>Rensa</button>}
      </div>
    </form>
  );
}
