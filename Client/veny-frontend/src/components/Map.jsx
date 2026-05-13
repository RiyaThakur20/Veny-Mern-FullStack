import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ✅ Fix Leaflet default icon (standard fix — required for webpack/vite)
import markerIcon   from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Marker.prototype.options.icon = L.icon({
    iconUrl:    markerIcon,
    shadowUrl:  markerShadow,
    iconSize:   [25, 41],
    iconAnchor: [12, 41],
});

// ✅ Tip Fixed: Custom glowing marker matching veny-primary theme
const GlowMarker = L.divIcon({
    className: '',
    html: `
        <div style="
            width: 18px;
            height: 18px;
            background: #6366f1;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 0 0 4px rgba(99,102,241,0.25), 0 0 16px rgba(99,102,241,0.7);
        "></div>
    `,
    iconSize:   [18, 18],
    iconAnchor: [9, 9],
});

const Map = ({ center, markers = [], zoom = 13 }) => {
    return (
        <div className="h-full w-full rounded-[2rem] overflow-hidden">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                {/* ✅ Warn Fixed: Dark CartoDB tile — matches app's cosmic theme */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                />

                {markers.map((marker, index) => (
                    <Marker key={index} position={marker.position} icon={GlowMarker}>
                        <Popup className="veny-popup">
                            <div style={{
                                background: '#0f172a',
                                color: 'white',
                                fontWeight: '900',
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                padding: '4px 2px',
                                fontFamily: 'sans-serif',
                            }}>
                                📍 {marker.title}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default Map;