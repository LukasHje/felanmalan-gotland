// src/components/MapView.jsx
import { MapContainer, TileLayer, Marker, Popup, ScaleControl, useMapEvents } from 'react-leaflet';
import L from '../leaflet-icons';
import MapAutosize from './MapAutosize';

const DEFAULT_CENTER = [57.636, 18.294];
const DEFAULT_ZOOM = 9;

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick?.({ lat: e.latlng.lat, lon: e.latlng.lng });
    },
  });
  return null;
}

export default function MapView({ reports = [], draftMarker, onMapClick, onMarkerClick }) {
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

        {/* ordinary marker */}
        {reports.map(m => (
          <Marker
            key={m.id ?? `${m.lat},${m.lon}`}
            position={[m.lat, m.lon]}
            eventHandlers={onMarkerClick ? { click: () => onMarkerClick(m) } : undefined}
          >
            <Popup>
              <strong>{m.title ?? 'Rapport'}</strong><br />
              {m.lat.toFixed(5)}, {m.lon.toFixed(5)}
            </Popup>
          </Marker>
        ))}

        {/* draft-marker (is seen directly on click) */}
        {draftMarker?.lat && draftMarker?.lon && (
          <Marker position={[draftMarker.lat, draftMarker.lon]}>
            <Popup>Vald plats<br/>{draftMarker.lat.toFixed(5)}, {draftMarker.lon.toFixed(5)}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
