"use client";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useQuery, gql } from "@apollo/client";

const GET_ALL_SHOPS_LOCATIONS = gql`
  query GetAllShopsLocations {
    shops {
      id
      name
      slug
      city
      latitude
      longitude
    }
  }
`;

interface Shop {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
}

export default function FooterShopsMap() {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { data } = useQuery<{ shops: Shop[] }>(GET_ALL_SHOPS_LOCATIONS, {
    fetchPolicy: "cache-first",
  });

  const shopsWithLocation = data?.shops?.filter(
    (shop) => shop.latitude && shop.longitude
  ) || [];

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Location access denied or unavailable:", error.message);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !shopsWithLocation.length) return;

    // Initialize map only once
    if (!mapRef.current) {
      const initialCenter = userLocation
        ? [userLocation.lat, userLocation.lng]
        : shopsWithLocation.length > 0
        ? [shopsWithLocation[0].latitude!, shopsWithLocation[0].longitude!]
        : [-1.9403, 29.8739]; // Rwanda center

      const map = L.map("footer-shops-map", {
        center: initialCenter as [number, number],
        zoom: userLocation ? 12 : 10,
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: true,
        touchZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add user location marker if available
    if (userLocation && mapRef.current) {
      const userIcon = L.divIcon({
        className: "custom-user-marker",
        html: `
          <div style="position: relative;">
            <div style="
              width: 32px;
              height: 32px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 3px 10px rgba(0,0,0,0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              animation: pulse 2s infinite;
            ">
              <svg width="16" height="16" fill="white" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div style="
              position: absolute;
              top: -32px;
              left: 50%;
              transform: translateX(-50%);
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 4px 10px;
              border-radius: 6px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
              white-space: nowrap;
              font-size: 11px;
              font-weight: 700;
              font-family: system-ui, -apple-system, sans-serif;
            ">
              📍 You are here
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
      }).addTo(mapRef.current);

      markersRef.current.push(userMarker);
    }

    // Add shop markers
    shopsWithLocation.forEach((shop) => {
      if (!shop.latitude || !shop.longitude || !mapRef.current) return;

      const shopIcon = L.divIcon({
        className: "custom-footer-shop-marker",
        html: `
          <div style="
            width: 28px;
            height: 28px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <svg width="14" height="14" fill="white" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"/>
            </svg>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([shop.latitude, shop.longitude], {
        icon: shopIcon,
      }).addTo(mapRef.current);

      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 150px;">
          <div style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px;
            margin: -8px -8px 8px -8px;
            border-radius: 4px 4px 0 0;
          ">
            <h4 style="margin: 0; font-size: 13px; font-weight: 700;">${shop.name}</h4>
            <p style="margin: 2px 0 0 0; font-size: 10px; opacity: 0.9;">${shop.city || "Rwanda"}</p>
          </div>
          <a 
            href="/shop/${shop.slug}" 
            style="
              display: block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-align: center;
              padding: 6px;
              border-radius: 4px;
              text-decoration: none;
              font-weight: 600;
              font-size: 11px;
            "
          >
            Visit Shop →
          </a>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 200,
        className: "custom-footer-popup",
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers (shops + user location)
    if (markersRef.current.length > 0 && mapRef.current) {
      const group = L.featureGroup(markersRef.current);
      mapRef.current.fitBounds(group.getBounds().pad(0.1));
    }

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [shopsWithLocation, userLocation]);

  if (!shopsWithLocation.length) {
    return (
      <div className="rounded-lg overflow-hidden border border-gray-700 bg-gray-800/50 h-[180px] flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading shop locations...</p>
      </div>
    );
  }

  return (
    <>
      <div 
        id="footer-shops-map" 
        className="rounded-lg overflow-hidden border border-gray-700 shadow-lg"
        style={{ height: "180px", width: "100%" }}
      />
      <style jsx global>{`
        .custom-footer-shop-marker,
        .custom-user-marker {
          background: transparent !important;
          border: none !important;
        }
        .custom-footer-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          padding: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        .custom-footer-popup .leaflet-popup-tip {
          background: white;
        }
        .custom-footer-popup .leaflet-popup-content {
          margin: 0;
        }
        #footer-shops-map .leaflet-control-attribution {
          font-size: 9px;
          background: rgba(255, 255, 255, 0.7);
        }
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 3px 10px rgba(0,0,0,0.4), 0 0 0 0 rgba(102, 126, 234, 0.7);
          }
          50% {
            box-shadow: 0 3px 10px rgba(0,0,0,0.4), 0 0 0 8px rgba(102, 126, 234, 0);
          }
        }
      `}</style>
    </>
  );
}
