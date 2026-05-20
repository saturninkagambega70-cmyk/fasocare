import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { ArrowLeft } from 'lucide-react-native';
import { pharmacyService } from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const MAP_HTML = (pharmacies) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; }
    body { background: #f0f0f0; }
    #map { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: true, attributionControl: false }).fitBounds([[9.5, -5.5], [15.1, 2.4]]);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map);

    var pharmacies = ${JSON.stringify(pharmacies || [])};
    pharmacies.forEach(function(p) {
      if (!p.coords) return;
      var color = p.isOpen ? 'green' : 'red';
      var icon = L.divIcon({
        className: '',
        html: '<div style="background:' + color + ';width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      var marker = L.marker([p.coords.latitude, p.coords.longitude], { icon: icon }).addTo(map);
      marker.bindPopup(
        '<b>' + (p.name || 'Pharmacie') + '</b><br>' +
        (p.isOpen ? '✅ Ouverte' : '❌ Fermée') + '<br>' +
        (p.phone || '') + '<br>' +
        '<a href="tel:' + (p.phone || '').replace(/\\s/g, '') + '">📞 Appeler</a> | ' +
        '<a href="https://maps.google.com/?q=' + p.coords.latitude + ',' + p.coords.longitude + '">🗺️ Itinéraire</a>'
      );
    });
  </script>
</body>
</html>
`;

export default function PharmacyDiscoveryScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const webRef = useRef(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await pharmacyService.getPublicPharmacies();
        if (Array.isArray(data)) {
          setPharmacies(data.filter(p => p?.coords?.latitude && p?.coords?.longitude));
        }
      } catch (err) {
        if (__DEV__) console.warn('Pharmacy fetch error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <ArrowLeft color="#fff" size={22} />
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#0d6e3f" style={{ flex: 1 }} />
      ) : (
        <WebView
          ref={webRef}
          style={styles.map}
          source={{ html: MAP_HTML(pharmacies) }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scrollEnabled={false}
          onShouldStartLoadWithRequest={(req) => {
            if (req.url.startsWith('tel:')) {
              Linking.openURL(req.url);
              return false;
            }
            if (req.url.startsWith('https://maps.google')) {
              Linking.openURL(req.url);
              return false;
            }
            return true;
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 15,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(13,110,63,0.9)',
    borderRadius: 12,
  },
  map: { flex: 1 },
});
