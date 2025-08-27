import { MapContainer, TileLayer, ScaleControl, useMap, CircleMarker, Popup } from 'react-leaflet';
import MapAutosize from './MapAutosize.jsx';
import ClusterLayer from './ClusterLayer.jsx';
import { useEffect, useState } from 'react';

const DEFAULT_CENTER = [57.636, 18.294];
const DEFAULT_ZOOM = 9;

function ClickCatcher({ onMapClick }) {
  const map = useMap();
  useEffect(() => {
    const onClick = (e) => onMapClick?.({ lat: e.latlng.lat, lon: e.latlng.lng });
    map.on('click', onClick);
    return () => map.off('click', onClick);
  }, [map, onMapClick]);
  return null;
}

function FocusController({ focus, onDone }) {
  const map = useMap();
  useEffect(() => {
    if (!focus) return;
    map.flyTo([focus.lat, focus.lng], focus.zoom ?? Math.max(map.getZoom(), 15), { animate: true });
    const t = setTimeout(() => onDone?.(), 800);
    return () => clearTimeout(t);
  }, [focus, map, onDone]);
  return null;
}

export default function MapView({ reports = [], draftMarker, onMapClick, focus, onFocused }) {
  const [showDraftPopup, setShowDraftPopup] = useState(false);

  useEffect(() => {
    if (draftMarker?.lat && draftMarker?.lon) {
      setShowDraftPopup(true);
      const t = setTimeout(() => setShowDraftPopup(false), 1500);
      return () => clearTimeout(t);
    }
  }, [draftMarker]);

  return (
    <div className="map-wrap">
      <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} scrollWheelZoom className="map">
        <MapAutosize deps={[reports, !!draftMarker, !!focus]} />
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ScaleControl position="bottomleft" />
        <ClickCatcher onMapClick={onMapClick} />
        <FocusController focus={focus} onDone={onFocused} />

        {/* Klustrade cirklar */}
        <ClusterLayer reports={reports} />

        {/* Draft-markör */}
        {draftMarker?.lat && draftMarker?.lon && (
          <CircleMarker
            center={[draftMarker.lat, draftMarker.lon]}
            radius={9}
            pathOptions={{ color: '#E57C5B', fillColor: '#E57C5B', weight: 2, fillOpacity: 0.25 }}
          >
            {showDraftPopup && (
              <Popup>Vald plats<br />{draftMarker.lat.toFixed(5)}, {draftMarker.lon.toFixed(5)}</Popup>
            )}
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
}
