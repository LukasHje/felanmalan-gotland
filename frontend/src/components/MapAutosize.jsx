import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export default function MapAutosize({ deps = [] }) {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(container);

    const onReady = () => setTimeout(() => map.invalidateSize(), 0);
    map.on('load', onReady);
    setTimeout(() => map.invalidateSize(), 0);

    const onWin = () => map.invalidateSize();
    window.addEventListener('resize', onWin);

    return () => {
      ro.disconnect();
      map.off('load', onReady);
      window.removeEventListener('resize', onWin);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, ...deps]);

  return null;
}
