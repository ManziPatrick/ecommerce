"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Shop {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  latitude: number;
  longitude: number;
  _count: {
    products: number;
  };
}

interface AllShopsMapProps {
  shops: Shop[];
  userLocation: { lat: number; lng: number } | null;
  onShopSelect?: (shop: Shop) => void;
}

export default function AllShopsMap({
  shops,
  userLocation,
  onShopSelect,
}: AllShopsMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initialize map
    if (!mapRef.current) {
      const map = L.map("all-shops-map", {
        center: userLocation
          ? [userLocation.lat, userLocation.lng]
          : shops.length > 0
          ? [shops[0].latitude, shops[0].longitude]
          : [-1.9403, 29.8739], // Rwanda center as fallback
        zoom: userLocation ? 12 : 8,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add user location marker
    if (userLocation && mapRef.current) {
      const userIcon = L.divIcon({
        className: "custom-user-marker",
        html: `
          <div style="
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: 4px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          ">
            <svg width="20" height="20" fill="white" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
            </svg>
            <div style="
              position: absolute;
              top: -30px;
              background: white;
              padding: 4px 8px;
              border-radius: 6px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
              white-space: nowrap;
              font-size: 11px;
              font-weight: 600;
              color: #4f46e5;
            ">You are here</div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
      }).addTo(mapRef.current);

      markersRef.current.push(userMarker);
    }

    // Add shop markers
    shops.forEach((shop, index) => {
      if (!shop.latitude || !shop.longitude || !mapRef.current) return;

      // Create custom icon for shop
      const shopIcon = L.divIcon({
        className: "custom-shop-marker",
        html: `
          <div style="
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 3px 10px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.2s;
          " onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
            <svg width="18" height="18" fill="white" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"/>
            </svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([shop.latitude, shop.longitude], {
        icon: shopIcon,
      }).addTo(mapRef.current);

      // Create popup content
      const popupContent = `
        <div style="min-width: 200px; font-family: system-ui, -apple-system, sans-serif;">
          <div style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px;
            margin: -12px -12px 12px -12px;
            border-radius: 8px 8px 0 0;
          ">
            <h3 style="margin: 0; font-size: 16px; font-weight: 700;">${shop.name}</h3>
            <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">
              <svg style="display: inline; width: 12px; height: 12px; margin-right: 4px;" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
              </svg>
              ${shop.city || "Unknown location"}
            </p>
          </div>
          <div style="padding: 0 4px;">
            <p style="margin: 0 0 12px 0; font-size: 13px; color: #6b7280;">
              <svg style="display: inline; width: 14px; height: 14px; margin-right: 4px; vertical-align: middle;" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"/>
              </svg>
              <strong>${shop._count.products}</strong> products available
            </p>
            <a 
              href="/shop/${shop.slug}" 
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
                transition: transform 0.2s;
              "
              onmouseover="this.style.transform='scale(1.02)'"
              onmouseout="this.style.transform='scale(1)'"
            >
              Visit Shop →
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: "custom-popup",
      });

      marker.on("click", () => {
        if (onShopSelect) {
          onShopSelect(shop);
        }
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (markersRef.current.length > 0 && mapRef.current) {
      const group = L.featureGroup(markersRef.current);
      mapRef.current.fitBounds(group.getBounds().pad(0.1));
    }

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [shops, userLocation, onShopSelect]);

  return (
    <>
      <div id="all-shops-map" style={{ height: "600px", width: "100%" }} />
      <style jsx global>{`
        .custom-user-marker,
        .custom-shop-marker {
          background: transparent !important;
          border: none !important;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
        }
      `}</style>
    </>
  );
}
