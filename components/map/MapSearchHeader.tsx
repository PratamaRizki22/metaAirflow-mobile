import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MapSearchHeaderProps {
    searchQuery: string;
    hasActiveFilters: boolean;
    onBackPress: () => void;
    onSearchPress: () => void;
    onFilterPress: () => void;
}

export const MapSearchHeader: React.FC<MapSearchHeaderProps> = ({
    searchQuery,
    hasActiveFilters,
    onBackPress,
    onSearchPress,
    onFilterPress,
}) => {
    return (
        <View style={styles.searchBarWrapper}>
            <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.searchInputContainer}
                onPress={onSearchPress}
            >
                <Ionicons name="search" size={20} color="#666" />
                <Text style={styles.searchInputText} numberOfLines={1}>
                    {searchQuery || "Search location..."}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.filterButton}
                onPress={onFilterPress}
                accessibilityLabel="Filter Properties"
            >
                <Ionicons name="options-outline" size={24} color="#333" />
                {hasActiveFilters && (
                    <View style={styles.activeBadge} />
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    searchBarWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 25,
        paddingHorizontal: 15,
        height: 45,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchInputText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
    },
    filterButton: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    activeBadge: {
        position: 'absolute',
        top: 10,
        right: 12,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#00D9A3',
        borderWidth: 2,
        borderColor: '#fff',
    },
});
