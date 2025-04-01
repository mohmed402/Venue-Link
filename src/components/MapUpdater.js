import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";

const MapUpdater = ({ position }) => {
  const map = useMap();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted && map && position) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [hasMounted, map, position]);

  return null;
};

export default MapUpdater;
