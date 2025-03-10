
import { useEffect, useRef } from 'react';
import { WishlistItem } from '@/types/wishlist';
import { useWishlistStore } from '@/store/wishlistStore';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ExperiencesMapProps {
  className?: string;
}

const ExperiencesMap = ({ className }: ExperiencesMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const items = useWishlistStore((state) => state.items);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = L.map(mapContainer.current).setView([0, 0], 1);

    L.tileLayer('https://maps.geoapify.com/v1/tile/carto/{z}/{x}/{y}.png?&apiKey=e3ceb15f23c544ac82e43add8dd3e5ad', {
      maxZoom: 20,
      attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a>'
    }).addTo(map);

    // Add markers for each destination
    items.forEach((item) => {
      if (item.destination) {
        // Here you would need to geocode the destination to get coordinates
        // For now, we'll just use a placeholder
        // You should implement proper geocoding using the Geoapify Geocoding API
        L.marker([0, 0]).addTo(map)
          .bindPopup(item.title);
      }
    });

    return () => {
      map.remove();
    };
  }, [items]);

  return (
    <div className={`w-full h-64 rounded-lg overflow-hidden shadow-lg ${className}`}>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default ExperiencesMap;
