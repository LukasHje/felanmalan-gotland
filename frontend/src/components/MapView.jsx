import { MapContainer, TileLayer, Popup, ScaleControl, useMapEvents, CircleMarker } from 'react-leaflet';
import MapAutosize from './MapAutosize.jsx';

const DEFAULT_CENTER = [57.636, 18.294];
const DEFAULT_ZOOM = 9;

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) { onMapClick?.({ lat: e.latlng.lat, lon: e.latlng.lng }); },
  });
  return null;
}

export default function MapView({ reports = [], draftMarker, onMapClick }) {
  return (
    <div className="map-wrap">
      <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} scrollWheelZoom className="map">
        <MapAutosize deps={[reports, !!draftMarker]} />
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ScaleControl position="bottomleft" />
        <ClickHandler onMapClick={onMapClick} />

        {/* Sparade rapporter som cirklar */}
        {reports.map(r => (
          <CircleMarker
            key={r.id ?? `${r.lat},${r.lng}`}
            center={[r.lat, r.lng]}
            radius={8}
            pathOptions={{ color: '#2A4F6F', weight: 2, fillOpacity: 0.2 }}
          >
            <Popup>
              <strong>{r.categoryName || 'Rapport'}</strong><br/>
              {r.description}<br/>
              {r.lat.toFixed(5)}, {r.lng.toFixed(5)}<br/>
              {r.userName ? `av ${r.userName}` : null}
            </Popup>
          </CircleMarker>
        ))}

        {/* Draft-markör (klickad punkt) */}
        {draftMarker?.lat && draftMarker?.lon && (
          <CircleMarker
            center={[draftMarker.lat, draftMarker.lon]}
            radius={9}
            pathOptions={{ color: '#E57C5B', weight: 2, fillOpacity: 0.25 }}
          >
            <Popup>Vald plats<br />{draftMarker.lat.toFixed(5)}, {draftMarker.lon.toFixed(5)}</Popup>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
}
