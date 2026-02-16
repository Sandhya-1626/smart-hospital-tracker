import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Navigation } from 'lucide-react';

// Fix for default Leaflet marker icons not showing in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons
const hospitalIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to recenter map when location changes
const RecenterAutomatically = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
};

const MapView = ({ hospitals, userLocation, onLocationUpdate }) => {
    // Default center (Chennai) if no user location
    const center = userLocation ? [userLocation.lat, userLocation.lng] : [13.0827, 80.2707];

    return (
        <div style={{ height: '500px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0', zIndex: 0 }}>
            <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User Location Marker */}
                {userLocation && (
                    <>
                        <Marker
                            draggable={true}
                            eventHandlers={{
                                dragend: (e) => {
                                    const marker = e.target;
                                    const position = marker.getLatLng();
                                    if (onLocationUpdate) {
                                        onLocationUpdate({ lat: position.lat, lng: position.lng });
                                    }
                                }
                            }}
                            position={[userLocation.lat, userLocation.lng]}
                            icon={userIcon}
                        >
                            <Popup>
                                <div style={{ fontWeight: 'bold' }}>You are here (Drag to move)</div>
                            </Popup>
                        </Marker>
                        <Circle
                            center={[userLocation.lat, userLocation.lng]}
                            radius={2000} // 2km radius visual
                            pathOptions={{ fillColor: 'blue', fillOpacity: 0.1, color: 'blue', weight: 1 }}
                        />
                    </>
                )}

                {/* Hospital Markers */}
                {hospitals.map((hospital) => (
                    <Marker
                        key={hospital.id}
                        position={[hospital.location.lat, hospital.location.lng]}
                        icon={hospitalIcon}
                    >
                        <Popup>
                            <div style={{ minWidth: '200px' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '4px', color: '#1E293B' }}>{hospital.name}</h3>
                                <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#64748B' }}>{hospital.type} • {hospital.city}</p>

                                <div style={{ marginBottom: '8px', fontSize: '0.8rem', color: '#475569' }}>
                                    {hospital.city}, Tamil Nadu
                                </div>

                                {hospital.emergency && (
                                    <div style={{
                                        fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '8px',
                                        color: hospital.emergency.includes('24/7') ? '#16A34A' : '#D97706',
                                        display: 'flex', alignItems: 'center', gap: '4px'
                                    }}>
                                        {hospital.emergency.includes('24/7') ? '●' : '○'} {hospital.emergency}
                                    </div>
                                )}

                                {hospital.distance && (
                                    <div style={{ display: 'inline-block', background: '#EFF6FF', color: '#2563EB', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', marginBottom: '8px' }}>
                                        {hospital.distance} km away
                                    </div>
                                )}

                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${hospital.location.lat},${hospital.location.lng}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                        background: '#2563EB', color: 'white', textDecoration: 'none',
                                        padding: '8px', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '500'
                                    }}
                                >
                                    <Navigation size={14} /> Navigate
                                </a>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {userLocation && <RecenterAutomatically lat={userLocation.lat} lng={userLocation.lng} />}
            </MapContainer>
        </div>
    );
};

export default MapView;
