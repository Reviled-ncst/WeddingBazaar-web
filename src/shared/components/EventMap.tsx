import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface EventMapProps {
  latitude: number;
  longitude: number;
  eventLocation?: string;
  eventAddress?: string;
  className?: string;
  height?: string;
  zoom?: number;
  interactive?: boolean;
}

const EventMap: React.FC<EventMapProps> = ({
  latitude,
  longitude,
  eventLocation = 'Event Location',
  eventAddress = '',
  className = '',
  height = '300px',
  zoom = 15,
  interactive = true
}) => {
  return (
    <div className={`${className} overflow-hidden rounded-xl border border-rose-200/30`}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={zoom}
        style={{ height, width: '100%' }}
        dragging={interactive}
        touchZoom={interactive}
        doubleClickZoom={interactive}
        scrollWheelZoom={interactive}
        boxZoom={interactive}
        keyboard={interactive}
        zoomControl={interactive}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]}>
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-rose-900 mb-1">{eventLocation}</h3>
              {eventAddress && (
                <p className="text-sm text-gray-600">{eventAddress}</p>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default EventMap;
