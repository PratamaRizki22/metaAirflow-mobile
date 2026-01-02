import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LocationNotFound from '../../assets/locationNotFound.svg';

interface LocationNotFoundViewProps {
    searchQuery: string;
    onBackPress: () => void;
    onSearchPress: () => void;
}

export const LocationNotFoundView: React.FC<LocationNotFoundViewProps> = ({
    searchQuery,
    onBackPress,
    onSearchPress,
}) => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.topContainer}>
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
                </View>
            </View>

            {/* Not Found Content */}
            <View style={styles.notFoundContainer}>
                <View style={styles.notFoundIconContainer}>
                    <LocationNotFound width={80} height={80} />
                </View>

                <Text style={styles.notFoundTitle}>The location does not exist</Text>
                <Text style={styles.notFoundSubtitle}>
                    Please enable your location services for more optional result
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    topContainer: {
        paddingTop: 50,
        paddingHorizontal: 20,
        zIndex: 10,
    },
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
    notFoundContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        backgroundColor: '#E6F7FF',
        marginTop: 60,
    },
    notFoundIconContainer: {
        width: 120,
        height: 120,
        backgroundColor: '#F0F9FF',
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 5,
        borderColor: '#fff',
    },
    notFoundTitle: {
        fontFamily: 'VisbyRound-Bold',
        fontSize: 18,
        color: '#111827',
        textAlign: 'center',
        marginBottom: 8,
    },
    notFoundSubtitle: {
        fontFamily: 'VisbyRound-Regular',
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
});
