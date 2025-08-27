export default function ReportList({ items = [] }) {
  if (!items.length) return <p style={{ opacity: 0.7 }}>Inga rapporter ännu.</p>;
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
      {items.map(r => (
        <li key={r.id} style={{
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 10,
          background: 'var(--card)',
        }}>
          <div style={{ fontWeight: 700, color: 'var(--deep)' }}>{r.categoryName || 'Rapport'}</div>
          <div style={{ opacity: 0.9 }}>{r.description}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            {r.lat.toFixed(5)}, {r.lng.toFixed(5)} {r.userName ? `• av ${r.userName}` : ''}
          </div>
        </li>
      ))}
    </ul>
  );
}
