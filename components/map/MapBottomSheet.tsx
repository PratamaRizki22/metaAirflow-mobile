import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { PropertyCard } from '../property/PropertyCard';
import { DEFAULT_IMAGES } from '../../constants/images';

interface Property {
    id: string;
    title: string;
    price: number;
    city: string;
    state: string;
    bedrooms: number;
    bathrooms: number;
    areaSqm: number;
    images?: string[];
    propertyType?: { name: string };
}

interface MapBottomSheetProps {
    listings: Property[];
    isFavorited: (id: string) => boolean;
    onPropertyPress: (id: string) => void;
    onFavoriteToggle: (id: string) => void;
}

export const MapBottomSheet: React.FC<MapBottomSheetProps> = ({
    listings,
    isFavorited,
    onPropertyPress,
    onFavoriteToggle,
}) => {
    if (listings.length === 0) return null;

    return (
        <View style={styles.bottomSheetContainer}>
            <View style={styles.bottomSheetHandle} />
            <Text style={styles.bottomSheetHeader}>
                Lebih dari {listings.length} rumah
            </Text>

            <FlatList
                data={listings}
                keyExtractor={(item) => `${item.id}-${isFavorited(item.id)}`}
                renderItem={({ item }) => (
                    <PropertyCard
                        property={{
                            id: item.id,
                            title: item.title,
                            price: item.price,
                            location: `${item.city}, ${item.state}`,
                            bedrooms: item.bedrooms,
                            bathrooms: item.bathrooms,
                            area: item.areaSqm,
                            image: item.images?.[0] || DEFAULT_IMAGES.PROPERTY,
                            type: (item.propertyType?.name?.toLowerCase() || 'house') as 'house' | 'apartment' | 'villa' | 'land',
                            isFavorited: isFavorited(item.id),
                        }}
                        onPress={() => onPropertyPress(item.id)}
                        onFavoriteToggle={onFavoriteToggle}
                        variant="compact"
                        style={styles.propertyCard}
                    />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    bottomSheetContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 12,
        paddingHorizontal: 20,
        paddingBottom: 20,
        maxHeight: '45%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    bottomSheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    bottomSheetHeader: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginBottom: 16,
    },
    propertyCard: {
        marginBottom: 16,
        width: '100%',
    },
    listContent: {
        paddingBottom: 20,
    },
});
