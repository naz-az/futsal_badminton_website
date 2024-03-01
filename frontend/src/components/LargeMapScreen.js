import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function LargeMapScreen() {
  const { latitude, longitude } = useParams();

  return (
    <MapContainer center={[parseFloat(latitude), parseFloat(longitude)]} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[parseFloat(latitude), parseFloat(longitude)]}>
        <Popup>
          Location details here.
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default LargeMapScreen;
