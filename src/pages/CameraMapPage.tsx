import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type CameraLocation = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
};

const cameras: CameraLocation[] = [
  { id: 1, name: "Camera Quận 7 #01", latitude: 10.724502, longitude: 106.759857, address: "229 Điện Biên Phủ, Quận 7, TP.HCM" },
  { id: 2, name: "Camera Quận 2 #02", latitude: 10.738449, longitude: 106.63488, address: "90 Nguyễn Trãi, Quận 2, TP.HCM" },
];

const CameraMapPage = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    if (!mapContainer.current) return;
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [106.6519, 10.9803],
      zoom: 15,
    });

    // Thêm marker cho từng camera
    cameras.forEach((cam) => {
      new mapboxgl.Marker({ color: "red" })
        .setLngLat([cam.longitude, cam.latitude])
        .setPopup(new mapboxgl.Popup().setText(cam.name))
        .addTo(map.current!);
    });
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Bản đồ vị trí camera</h2>
      <div
        ref={mapContainer}
        className="w-full h-[600px] rounded-lg shadow-lg border"
      />
    </div>
  );
};

export default CameraMapPage;
