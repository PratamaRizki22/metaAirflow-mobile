import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { MAPTILER_API_KEY } from '@env';

interface MapViewProps {
    centerCoordinate?: [number, number];
    zoomLevel?: number;
    style?: any;
}

// Configure MapLibre
MapLibreGL.setAccessToken(null);

export function MapView({
    centerCoordinate = [101.6869, 3.1390], // Kuala Lumpur
    zoomLevel = 10,
    style = styles.map
}: MapViewProps) {
    const styleURL = `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_API_KEY}`;

    return (
        <View style={style}>
            <MapLibreGL.MapView
                style={styles.map}
                mapStyle={styleURL}
            >
                <MapLibreGL.Camera
                    centerCoordinate={centerCoordinate}
                    zoomLevel={zoomLevel}
                />
            </MapLibreGL.MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    map: {
        flex: 1,
    },
});
