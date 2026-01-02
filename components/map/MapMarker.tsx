import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';

interface MapMarkerProps {
    id: string;
    coordinate: [number, number];
    price: number;
    currencyCode?: string;
    onPress: () => void;
}

export const MapMarker: React.FC<MapMarkerProps> = ({
    id,
    coordinate,
    price,
    currencyCode = 'RM',
    onPress,
}) => {
    return (
        <MapLibreGL.PointAnnotation
            id={`marker-${id}`}
            coordinate={coordinate}
            onSelected={onPress}
        >
            <View style={styles.markerContainer}>
                <Text style={styles.markerText}>
                    {currencyCode}{price.toLocaleString('en-MY', { maximumFractionDigits: 0 })}
                </Text>
            </View>
        </MapLibreGL.PointAnnotation>
    );
};

const styles = StyleSheet.create({
    markerContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 70,
    },
    markerText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
    },
});
