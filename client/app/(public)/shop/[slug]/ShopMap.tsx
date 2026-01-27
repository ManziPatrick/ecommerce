"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix for default marker icon missing in React Leaflet
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface ShopMapProps {
  latitude: number;
  longitude: number;
  shopName: string;
}

const ShopMap = ({ latitude, longitude, shopName }: ShopMapProps) => {
    // Force a re-render or ensure map invalidates size if in a modal, 
    // but here it's on a page so standard container is fine.
    
  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-sm border border-gray-200 z-0 relative">
      <MapContainer 
        center={[latitude, longitude]} 
        zoom={15} 
        scrollWheelZoom={false} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]} icon={icon}>
          <Popup>
            <div className="text-center font-semibold">
                {shopName} <br /> 
                <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 underline text-xs pt-1 block"
                >
                    Open in Google Maps
                </a>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default ShopMap;
