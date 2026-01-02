import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { Ionicons } from '@expo/vector-icons';

interface CenterMarkerProps {
    coordinate: [number, number];
}

export const CenterMarker: React.FC<CenterMarkerProps> = ({ coordinate }) => {
    return (
        <MapLibreGL.PointAnnotation
            id="center-marker"
            coordinate={coordinate}
        >
            <View style={styles.centerMarker}>
                <Ionicons name="location" size={32} color="#EF4444" />
            </View>
        </MapLibreGL.PointAnnotation>
    );
};

const styles = StyleSheet.create({
    centerMarker: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
