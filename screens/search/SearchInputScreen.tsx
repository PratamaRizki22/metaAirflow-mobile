import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, SectionList, StatusBar, SafeAreaView, Platform, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';
import { useNavigation } from '@react-navigation/native';
import { MAPTILER_API_KEY } from '@env';
import { propertyService } from '../../services';

// Added AsyncStorage and updated logic
import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_HISTORY_KEY = 'search_history';

export const SearchInputScreen = () => {
    const navigation = useNavigation<any>();
    const { bgColor, textColor, secondaryTextColor, isDark } = useThemeColors();
    const [query, setQuery] = useState('');
    const [searchHistory, setSearchHistory] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    // Calculate top padding for Android
    const topPadding = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

    useEffect(() => {
        loadHistory();
    }, []);

    useEffect(() => {
        // Search location and properties
        const searchTimer = setTimeout(() => {
            performSearch(query);
        }, 300); // Debounce 300ms

        return () => clearTimeout(searchTimer);
    }, [query]);

    const loadHistory = async () => {
        try {
            const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
            if (history) {
                setSearchHistory(JSON.parse(history));
            }
        } catch (error) {
            console.log('Failed to load history', error);
        }
    };

    const performSearch = async (searchQuery: string) => {
        if (!searchQuery || searchQuery.length < 3) {
            setSuggestions([]);
            return;
        }

        setSearching(true);
        const results: any[] = [];

        try {
            // 1. Search Properties (Backend)
            try {
                console.log(`🔍 Searching properties for: "${searchQuery}"`);
                const propertyResponse = await propertyService.getMobileProperties(1, 5, {
                    search: searchQuery
                });

                console.log('📦 Property Search Response Success:', propertyResponse.success);

                if (propertyResponse.success && propertyResponse.data.properties) {
                    console.log(`✅ Found ${propertyResponse.data.properties.length} properties matching "${searchQuery}"`);
                    const propertyResults = propertyResponse.data.properties.map(p => ({
                        id: `property-${p.id}`,
                        title: p.title,
                        subtitle: `${p.city}, ${p.state} • ${p.propertyType?.name || 'Property'}`,
                        icon: 'home-outline',
                        type: 'property',
                        data: p
                    }));
                    results.push(...propertyResults);
                } else {
                    console.log('⚠️ No properties found or success false');
                }
            } catch (propError) {
                console.log('❌ Property search error:', propError);
            }

            // 2. Search Locations (MapTiler)
            if (MAPTILER_API_KEY) {
                try {
                    const response = await fetch(
                        `https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=${MAPTILER_API_KEY}&limit=5`
                    );

                    if (response.ok) {
                        const contentType = response.headers.get('content-type');
                        if (contentType && contentType.includes('application/json')) {
                            const data = await response.json();
                            const locationResults = (data.features || []).map((f: any) => ({
                                id: `location-${f.id}`,
                                title: f.place_name || f.text,
                                subtitle: f.place_type?.join(', ') || 'Location',
                                icon: 'location-outline',
                                type: 'location',
                                data: f
                            }));
                            results.push(...locationResults);
                        }
                    }
                } catch (locError) {
                    console.log('Location search error:', locError);
                }
            } else {
                console.log('MAPTILER_API_KEY not configured, skipping location search');
            }

            setSuggestions(results);
        } catch (error) {
            console.error('Search error:', error);
            setSuggestions([]);
        } finally {
            setSearching(false);
        }
    };

    const saveHistory = async (newHistory: any[]) => {
        try {
            await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
            setSearchHistory(newHistory);
        } catch (error) {
            console.log('Failed to save history', error);
        }
    };

    const handleSearch = async (item?: any) => {
        // If searching via enter key (no item selected explicitly)
        // We'll treat it as a location search query navigation map
        if (!item) {
            if (!query.trim()) return;

            // Add to history
            const newItem = {
                id: Date.now().toString(),
                title: query,
                subtitle: 'Search query',
                icon: 'search-outline',
                type: 'query'
            };
            addToHistory(newItem);

            navigation.navigate('MapSearchInfo', {
                searchQuery: query
            });
            return;
        }

        // Add to history
        const historyItem = {
            id: Date.now().toString(),
            title: item.title,
            subtitle: item.subtitle,
            icon: item.icon,
            type: item.type,
            data: item.data // Store data for history retrieval if needed
        };
        addToHistory(historyItem);

        // Clear state
        setSuggestions([]);
        setQuery('');

        // Navigate based on type
        if (item.type === 'property') {
            navigation.navigate('PropertyDetail', {
                propertyId: item.data.id
            });
        } else {
            // Location or Generic Query
            navigation.navigate('MapSearchInfo', {
                searchQuery: item.title
            });
        }
    };

    const addToHistory = async (item: any) => {
        const existingIndex = searchHistory.findIndex((h) => h.title.toLowerCase() === item.title.toLowerCase());
        let newHistory = [...searchHistory];

        if (existingIndex !== -1) {
            newHistory.splice(existingIndex, 1);
        }

        newHistory.unshift(item);
        if (newHistory.length > 10) newHistory.pop();

        await saveHistory(newHistory);
    };

    const clearHistory = async () => {
        await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
        setSearchHistory([]);
    };

    return (
        <View className={`flex-1 ${bgColor}`} style={{ paddingTop: topPadding }}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

            {/* Header: Back + Title */}
            <View className="px-4 py-3 flex-row items-center justify-center relative">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="absolute left-4 p-2"
                >
                    <Ionicons name="chevron-back" size={24} color={isDark ? '#FFF' : '#000'} />
                </TouchableOpacity>
                <Text className={`text-lg font-bold ${textColor}`}>Search</Text>
            </View>

            {/* Search Bar */}
            <View className="px-6 mt-4">
                <View
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 5,
                        elevation: 2,
                    }}
                    className={`flex-row items-center rounded-2xl px-4 py-3 border border-gray-100 dark:border-gray-800 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                >
                    <Ionicons name="search-outline" size={20} color="#9CA3AF" />
                    <TextInput
                        className={`flex-1 ml-3 text-base ${textColor}`}
                        placeholder="Search properties or locations..."
                        placeholderTextColor="#9CA3AF"
                        autoFocus={true}
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={() => handleSearch()}
                        returnKeyType="search"
                    />
                    {searching && (
                        <ActivityIndicator size="small" color="#9CA3AF" />
                    )}
                    {query.length > 0 && !searching && (
                        <TouchableOpacity onPress={() => {
                            setQuery('');
                            setSuggestions([]);
                        }}>
                            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Recent Searches or Suggestions Title - Removed individual header, moved to SectionList */}

            {/* List */}
            <SectionList
                sections={
                    query.length > 0
                        ? [
                            {
                                title: 'Properties',
                                data: suggestions.filter(s => s.type === 'property'),
                            },
                            {
                                title: 'Locations',
                                data: suggestions.filter(s => s.type === 'location'),
                            },
                        ].filter(section => section.data.length > 0)
                        : searchHistory.length > 0
                            ? [{ title: 'Recent Searches', data: searchHistory }]
                            : []
                }
                keyExtractor={(item: any) => item.id || item.title}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
                keyboardShouldPersistTaps="handled"
                stickySectionHeadersEnabled={false}
                renderSectionHeader={({ section: { title, data } }: { section: { title: string, data: any[] } }) => (
                    <View className="mt-6 mb-4 flex-row justify-between items-center">
                        <Text className={`text-sm font-medium ${secondaryTextColor}`}>
                            {title}
                        </Text>
                        {title === 'Recent Searches' && (
                            <TouchableOpacity onPress={clearHistory}>
                                <Text className="text-primary text-xs">Clear All</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                renderItem={({ item }: { item: any }) => (
                    <TouchableOpacity
                        className="flex-row items-center mb-6"
                        onPress={() => handleSearch(item)}
                    >
                        <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            {item.type === 'property' && item.data?.images?.[0] ? (
                                <Image
                                    source={{ uri: item.data.images[0] }}
                                    style={{ width: 40, height: 40, borderRadius: 12 }}
                                />
                            ) : (
                                <Ionicons
                                    name={item.icon as any || 'time-outline'}
                                    size={20}
                                    color={item.type === 'property' ? '#10A0F7' : '#6B7280'}
                                />
                            )}
                        </View>
                        <View className="flex-1">
                            <Text className={`font-semibold text-base ${textColor}`} numberOfLines={1}>{item.title}</Text>
                            <Text className={`text-xs mt-0.5 ${secondaryTextColor}`} numberOfLines={1}>{item.subtitle}</Text>
                        </View>
                        <TouchableOpacity>
                            <Ionicons name="chevron-forward" size={18} color={secondaryTextColor} />
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-10">
                        <Text className={`text-center ${secondaryTextColor}`}>
                            {query.length > 0 ? 'No results found' : 'No recent searches'}
                        </Text>
                    </View>
                }
            />
        </View>
    );
};
