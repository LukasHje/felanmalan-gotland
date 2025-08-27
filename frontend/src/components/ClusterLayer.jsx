import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import supercluster from 'supercluster';

const STROKE = '#2A4F6F'; // samma som övriga cirklar

export default function ClusterLayer({ reports = [] }) {
  const map = useMap();

  // Bygg features
  const points = useMemo(() => {
    return reports.map(r => ({
      type: 'Feature',
      properties: {
        cluster: false,
        reportId: r.id,
        categoryName: r.categoryName,
        description: r.description,
        userName: r.userName
      },
      geometry: { type: 'Point', coordinates: [r.lng, r.lat] }
    }));
  }, [reports]);

  const index = useMemo(() => {
    return new supercluster({
      radius: 60,
      maxZoom: 18,
      minPoints: 2
    }).load(points);
  }, [points]);

  const [clusters, setClusters] = useState([]);
  const [openClusterId, setOpenClusterId] = useState(null);

  function update() {
    const b = map.getBounds();
    const zoom = map.getZoom();
    const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
    const c = index.getClusters(bbox, Math.round(zoom));
    setClusters(c);
  }

  useEffect(() => {
    update();
    const onMove = () => update();
    map.on('moveend zoomend', onMove);
    return () => {
      map.off('moveend zoomend', onMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, map]);

  return (
    <>
      {clusters.map(feature => {
        const [lng, lat] = feature.geometry.coordinates;
        const { cluster, point_count: count, cluster_id } = feature.properties;

        if (cluster) {
          const radius = 10 + Math.min(count, 30) * 0.6;
          return (
            <CircleMarker
              key={`c-${cluster_id}`}
              center={[lat, lng]}
              radius={radius}
              pathOptions={{ color: STROKE, fillColor: STROKE, weight: 2, fillOpacity: 0.18 }}
              eventHandlers={{
                click: () => {
                  const nextZoom = Math.min(index.getClusterExpansionZoom(cluster_id), 18);
                  map.setView([lat, lng], nextZoom, { animate: true });
                  setOpenClusterId(cluster_id);
                }
              }}
            >
              <Tooltip direction="center" permanent opacity={1} className="cluster-label">
                {count}
              </Tooltip>

              {openClusterId === cluster_id && (
                <Popup>
                  <strong>{count} ärenden här</strong>
                  <ul style={{ paddingLeft: 18, maxHeight: 160, overflow: 'auto', marginTop: 6 }}>
                    {index.getLeaves(cluster_id, 10, 0).map((leaf, i) => (
                      <li key={leaf.properties.reportId ?? i}>
                        {leaf.properties.categoryName || 'Rapport'} — {leaf.properties.description?.slice(0, 60)}
                        {leaf.properties.description && leaf.properties.description.length > 60 ? '…' : ''}
                      </li>
                    ))}
                  </ul>
                  {count > 10 && <em>Zooma in för att se fler…</em>}
                </Popup>
              )}
            </CircleMarker>
          );
        }

        // enkel punkt
        return (
          <CircleMarker
            key={`p-${feature.properties.reportId}`}
            center={[lat, lng]}
            radius={8}
            pathOptions={{ color: STROKE, fillColor: STROKE, weight: 2, fillOpacity: 0.18 }}
          >
            <Popup>
              <strong>{feature.properties.categoryName || 'Rapport'}</strong><br />
              {feature.properties.description}<br />
              {lat.toFixed(5)}, {lng.toFixed(5)}<br />
              {feature.properties.userName ? `av ${feature.properties.userName}` : null}
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}
