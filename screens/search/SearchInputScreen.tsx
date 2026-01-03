import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StatusBar, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks';
import { useNavigation } from '@react-navigation/native';
import { MAPTILER_API_KEY } from '@env';

// Added AsyncStorage and updated logic
import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_HISTORY_KEY = 'search_history';

export const SearchInputScreen = () => {
    const navigation = useNavigation<any>();
    const { bgColor, textColor, secondaryTextColor, isDark } = useThemeColors();
    const [query, setQuery] = useState('');
    const [searchHistory, setSearchHistory] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [searchingLocation, setSearchingLocation] = useState(false);

    // Calculate top padding for Android
    const topPadding = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

    useEffect(() => {
        loadHistory();
    }, []);

    useEffect(() => {
        // Search location using MapTiler Geocoding API
        const searchTimer = setTimeout(() => {
            searchLocationByQuery(query);
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

    const searchLocationByQuery = async (searchQuery: string) => {
        if (!searchQuery || searchQuery.length < 3) {
            setSuggestions([]);
            return;
        }

        // Check if API key is available
        if (!MAPTILER_API_KEY) {
            console.error('MAPTILER_API_KEY is not configured');
            setSuggestions([]);
            return;
        }

        try {
            setSearchingLocation(true);
            const response = await fetch(
                `https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=${MAPTILER_API_KEY}&limit=5`
            );
            
            // Check if response is ok
            if (!response.ok) {
                console.error('MapTiler API error:', response.status, response.statusText);
                setSuggestions([]);
                return;
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.error('MapTiler API returned non-JSON response');
                setSuggestions([]);
                return;
            }

            const data = await response.json();
            setSuggestions(data.features || []);
        } catch (error) {
            console.error('Location search error:', error);
            setSuggestions([]);
        } finally {
            setSearchingLocation(false);
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
        const searchText = item ? item.title : query;
        if (!searchText) return;

        // Save to history if it's a new query
        const existingIndex = searchHistory.findIndex((h) => h.title.toLowerCase() === searchText.toLowerCase());
        let newHistory = [...searchHistory];

        if (existingIndex !== -1) {
            // Move to top
            newHistory.splice(existingIndex, 1);
        }

        const newItem = {
            id: Date.now().toString(),
            title: searchText,
            subtitle: 'Recent search',
            icon: 'time-outline'
        };

        newHistory.unshift(newItem);
        // Limit to 10 items
        if (newHistory.length > 10) newHistory.pop();

        await saveHistory(newHistory);

        // Clear suggestions after selecting
        setSuggestions([]);
        setQuery('');

        navigation.navigate('MapSearchInfo', {
            searchQuery: searchText
        });
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
                        placeholder="Search locations"
                        placeholderTextColor="#9CA3AF"
                        autoFocus={true}
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={() => handleSearch()}
                    />
                    {searchingLocation && (
                        <ActivityIndicator size="small" color="#9CA3AF" />
                    )}
                    {query.length > 0 && !searchingLocation && (
                        <TouchableOpacity onPress={() => {
                            setQuery('');
                            setSuggestions([]);
                        }}>
                            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Recent Searches or Suggestions Title */}
            <View className="px-6 mt-8 mb-4 flex-row justify-between items-center">
                <Text className={`text-sm font-medium ${secondaryTextColor}`}>
                    {suggestions.length > 0 ? 'Suggestions' : 'Recent searches'}
                </Text>
                {searchHistory.length > 0 && suggestions.length === 0 && (
                    <TouchableOpacity onPress={clearHistory}>
                        <Text className="text-primary text-xs">Clear All</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* List */}
            <FlatList
                data={suggestions.length > 0 ? suggestions.map((s, idx) => ({ 
                    id: `suggestion-${idx}`, 
                    title: s.place_name || s.text,
                    subtitle: s.place_type?.join(', ') || 'Location', 
                    icon: 'location-outline',
                    raw: s
                })) : searchHistory}
                keyExtractor={(item) => item.id || item}
                contentContainerStyle={{ paddingHorizontal: 24 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        className="flex-row items-center mb-6"
                        onPress={() => handleSearch(item)}
                    >
                        <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <Ionicons name={item.icon as any || 'time-outline'} size={20} color="#6B7280" />
                        </View>
                        <View className="flex-1">
                            <Text className={`font-semibold text-base ${textColor}`}>{item.title}</Text>
                            <Text className={`text-xs mt-0.5 ${secondaryTextColor}`}>{item.subtitle}</Text>
                        </View>
                        <TouchableOpacity>
                            <Ionicons name="navigate-outline" size={18} color="#10A0F7" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-10">
                        <Text className={`text-center ${secondaryTextColor}`}>
                            {query.length > 0 ? 'No suggestions found' : 'No recent searches'}
                        </Text>
                    </View>
                }
            />
        </View>
    );
};
