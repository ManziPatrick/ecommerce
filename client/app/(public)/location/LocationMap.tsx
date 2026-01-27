"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function LocationMap() {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Shop coordinates
    const shopLat = -2.3102;
    const shopLng = 30.8379;

    // Initialize map
    if (!mapRef.current) {
      const map = L.map("location-map", {
        center: [shopLat, shopLng],
        zoom: 16,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom marker for the shop
      const shopIcon = L.divIcon({
        className: "custom-shop-location-marker",
        html: `
          <div style="position: relative;">
            <div style="
              width: 50px;
              height: 50px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border: 4px solid white;
              border-radius: 50%;
              box-shadow: 0 4px 15px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              animation: bounce 2s infinite;
            ">
              <svg width="24" height="24" fill="white" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div style="
              position: absolute;
              bottom: -40px;
              left: 50%;
              transform: translateX(-50%);
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 8px 16px;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.2);
              white-space: nowrap;
              font-size: 14px;
              font-weight: 700;
              font-family: system-ui, -apple-system, sans-serif;
            ">
              📍 macyemacye Store
            </div>
          </div>
        `,
        iconSize: [50, 50],
        iconAnchor: [25, 25],
      });

      const marker = L.marker([shopLat, shopLng], {
        icon: shopIcon,
      }).addTo(map);

      // Popup with detailed information
      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 250px;">
          <div style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px;
            margin: -12px -12px 12px -12px;
            border-radius: 8px 8px 0 0;
          ">
            <h3 style="margin: 0; font-size: 18px; font-weight: 700;">macyemacye</h3>
            <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Premium Shopping Store</p>
          </div>
          <div style="padding: 0 4px;">
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #4b5563;">
              <strong>📍 Address:</strong><br/>
              kkt39j, Nyakarambi<br/>
              Kigali, Rwanda<br/>
              <em style="font-size: 12px; color: #6b7280;">Near Bank of Kigali</em>
            </p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #4b5563;">
              <strong>📞 Phone:</strong> <a href="tel:+250790706170" style="color: #667eea;">+250 790 706 170</a>
            </p>
            <p style="margin: 0 0 12px 0; font-size: 13px; color: #4b5563;">
              <strong>✉️ Email:</strong> <a href="mailto:support@macyemacye.com" style="color: #667eea;">support@macyemacye.com</a>
            </p>
            <a 
              href="https://www.google.com/maps/search/?api=1&query=${shopLat},${shopLng}" 
              target="_blank"
              rel="noopener noreferrer"
              style="
                display: block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-align: center;
                padding: 10px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                font-size: 13px;
                margin-top: 8px;
              "
            >
              Get Directions →
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: "custom-location-popup",
      });

      // Open popup by default
      marker.openPopup();

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <div
        id="location-map"
        className="rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg"
        style={{ height: "600px", width: "100%" }}
      />
      <style jsx global>{`
        .custom-shop-location-marker {
          background: transparent !important;
          border: none !important;
        }
        .custom-location-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }
        .custom-location-popup .leaflet-popup-tip {
          background: white;
        }
        .custom-location-popup .leaflet-popup-content {
          margin: 0;
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </>
  );
}
