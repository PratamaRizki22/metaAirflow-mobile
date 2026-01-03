import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Image, RefreshControl, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { favoriteService, collectionService } from '../../services';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useThemeColors } from '../../hooks';
import { LoadingState, EmptyState, NoFavoritesIllustration, Button, ConfirmationBottomSheet } from '../../components/common';
import { LinearGradient } from 'expo-linear-gradient';

export function FavoritesScreen({ navigation }: any) {
    const { isDark } = useTheme();
    const { toggleFavorite, refreshFavorites } = useFavorites();
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Modal State
    const [isModalVisible, setModalVisible] = useState(false);
    const [collectionName, setCollectionName] = useState('');
    const maxLength = 20;

    // Custom Collections State
    const [customCollections, setCustomCollections] = useState<any[]>([]);

    // Collection Menu State
    const [selectedCollection, setSelectedCollection] = useState<any>(null);
    const [showCollectionMenu, setShowCollectionMenu] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [renameValue, setRenameValue] = useState('');
    const [longPressedItem, setLongPressedItem] = useState<string | null>(null);

    const handleCreateCollection = async () => {
        if (!collectionName.trim()) return;

        try {
            const response = await collectionService.createCollection(collectionName.trim());

            // Add to local state
            setCustomCollections([...customCollections, {
                ...response.data,
                type: 'collection',
                count: 0,
                image: null
            }]);

            setCollectionName('');
            setModalVisible(false);
            Alert.alert('Success', 'Collection created successfully');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create collection');
        }
    };

    const handleLongPressCollection = (collection: any) => {
        // Don't show menu for "All Wishlist" or "Add New" button
        if (collection.id === 'all' || collection.type === 'add') return;

        setSelectedCollection(collection);
        setShowCollectionMenu(true);
    };

    const handleDeleteCollection = () => {
        setShowCollectionMenu(false);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteCollection = async () => {
        if (!selectedCollection) return;

        try {
            await collectionService.deleteCollection(selectedCollection.id);

            setCustomCollections(customCollections.filter(c => c.id !== selectedCollection.id));
            setShowDeleteConfirm(false);
            setSelectedCollection(null);
            Alert.alert('Success', 'Collection deleted successfully');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to delete collection');
        }
    };

    const handleRenameCollection = () => {
        setShowCollectionMenu(false);
        setRenameValue(selectedCollection?.name || '');
        setShowRenameModal(true);
    };

    const confirmRenameCollection = async () => {
        if (!selectedCollection || !renameValue.trim()) return;

        try {
            await collectionService.updateCollection(selectedCollection.id, renameValue.trim());

            setCustomCollections(customCollections.map(c =>
                c.id === selectedCollection.id
                    ? { ...c, name: renameValue.trim() }
                    : c
            ));

            setShowRenameModal(false);
            setRenameValue('');
            setSelectedCollection(null);
            Alert.alert('Success', 'Collection renamed successfully');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to rename collection');
        }
    };

    const { bgColor, textColor, cardBg } = useThemeColors();

    // Auto-load favorites when screen is focused
    useFocusEffect(
        useCallback(() => {
            if (user) {
                loadFavorites(isInitialLoad);
                loadCollections();
                if (isInitialLoad) {
                    setIsInitialLoad(false);
                }
            } else {
                setLoading(false);
            }
        }, [user, isInitialLoad])
    );

    const loadCollections = async () => {
        try {
            const response = await collectionService.getCollections();
            setCustomCollections(response.data.collections.map(c => ({
                ...c,
                type: 'collection',
                count: c._count?.favorites || 0,
                image: null // TODO: Get first image from collection
            })));
        } catch (error: any) {
            console.error('Load collections error:', error);
            // Don't show alert, just log
        }
    };

    const loadFavorites = async (isInitialLoad = false) => {
        try {
            // Only show full-screen loading on initial load
            if (isInitialLoad) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            console.log('=== Loading Favorites ===');
            const response = await favoriteService.getFavorites(1, 50);
            console.log('Favorites API response:', {
                success: response.success,
                hasData: !!response.data,
                favoritesCount: response.data?.favorites?.length || 0
            });

            if (response.data?.favorites) {
                console.log('First 2 favorites:', response.data.favorites.slice(0, 2).map((f: any) => ({
                    id: f.id,
                    hasProperty: !!f.property,
                    propertyId: f.property?.id,
                    propertyTitle: f.property?.title
                })));
            }

            setFavorites(response.data?.favorites || []);
        } catch (error: any) {
            console.error('Load favorites error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            // Don't show Alert to prevent infinite loop
            setFavorites([]); // Set empty array on error
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadFavorites();
    };

    const handleRemoveFavorite = async (propertyId: string, title: string) => {
        Alert.alert(
            'Remove Favorite',
            `Remove "${title}" from favorites?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await toggleFavorite(propertyId);
                            await refreshFavorites();
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        }
                    }
                }
            ]
        );
    };

    const handlePropertyPress = (propertyId: string) => {
        navigation.navigate('PropertyDetail', { propertyId });
    };

    if (loading) {
        return <LoadingState message="Loading favorites..." />;
    }

    return (
        <View className={`flex-1 ${bgColor}`}>
            <View className="px-6 pt-12 pb-4 flex-row items-center justify-between relative bg-transparent z-10">
                {/* Empty View for spacing to balance the header */}
                <View className="w-8" />

                <Text className={`text-xl font-['VisbyRound-Bold'] text-center flex-1 ${textColor}`}>
                    Favorites
                </Text>

                <TouchableOpacity
                    className="w-8 h-8 items-center justify-center"
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons name="add" size={28} color="#10A0F7" />
                </TouchableOpacity>
            </View>

            {/* Collections Grid */}
            <FlatList
                data={[
                    // Always show "All Wishlist" collection
                    { id: 'all', type: 'collection', name: 'All Wishlist', count: favorites.length, image: favorites[0]?.property?.images[0] },
                    ...customCollections,
                    // Placeholder for "New Collection" button
                    { id: 'add_new', type: 'add' }
                ]}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingBottom: 200,
                    paddingTop: 10,
                }}
                renderItem={({ item }) => {
                    const CARD_WIDTH = '48%';

                    if (item.type === 'add') {
                        return (
                            <TouchableOpacity
                                onPress={() => setModalVisible(true)}
                                style={{ width: CARD_WIDTH, aspectRatio: 1.2 }}
                                className={`rounded-2xl border-2 border-dashed ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-blue-100 bg-blue-50/50'} items-center justify-center`}
                            >
                                <Ionicons name="add" size={32} color="#10A0F7" />
                                <Text className={`text-sm mt-2 font-['VisbyRound-Medium'] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    New Collection
                                </Text>
                            </TouchableOpacity>
                        );
                    }

                    // Collection Card
                    return (
                        <TouchableOpacity
                            onPress={() => {
                                if (item.id === 'all') {
                                    // Navigate to All Wishlist screen with favorites data
                                    navigation.navigate('AllWishlist', { favorites });
                                } else if (item.type === 'collection') {
                                    // Navigate to Collection Detail screen
                                    navigation.navigate('CollectionDetail', { 
                                        collectionId: item.id,
                                        collectionName: item.name 
                                    });
                                } else {
                                    console.log('Open Collection:', item.name);
                                }
                            }}
                            onPressIn={() => setLongPressedItem(item.id)}
                            onPressOut={() => setLongPressedItem(null)}
                            onLongPress={() => handleLongPressCollection(item)}
                            delayLongPress={300}
                            activeOpacity={0.8}
                            style={{
                                width: CARD_WIDTH,
                                transform: [{ scale: longPressedItem === item.id ? 0.95 : 1 }]
                            }}
                            className="mb-6"
                        >
                            <View
                                style={{
                                    aspectRatio: 1.2,
                                    opacity: longPressedItem === item.id ? 0.7 : 1
                                }}
                                className={`rounded-2xl overflow-hidden mb-3 relative bg-gray-200 dark:bg-gray-700`}
                            >
                                {item.image ? (
                                    <Image
                                        source={{ uri: item.image }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    // Placeholder pattern if empty
                                    <View className="flex-1 items-center justify-center">
                                        <Ionicons name="image-outline" size={32} color={isDark ? '#64748B' : '#94A3B8'} />
                                    </View>
                                )}

                                {/* Gradient Overlay */}
                                <LinearGradient
                                    colors={['transparent', 'rgba(16, 160, 247, 0.4)']}
                                    className="absolute bottom-0 left-0 right-0 h-1/2"
                                />
                            </View>

                            <Text className={`font-['VisbyRound-Bold'] text-base ${textColor}`}>
                                {item.name}
                            </Text>
                            <Text className={`font-['VisbyRound-Regular'] text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {item.count || 0} {(item.count || 0) > 1 ? 'Places' : 'Place'}
                            </Text>
                        </TouchableOpacity>
                    );
                }}
            />

            {/* Create Collection Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
                    className="flex-1"
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => setModalVisible(false)}
                        className="flex-1 justify-end bg-black/50"
                    >
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={(e) => e.stopPropagation()}
                            className={`w-full ${bgColor} rounded-t-3xl p-6 pb-10 shadow-xl`}
                        >
                            <Text className={`text-xl font-['VisbyRound-Bold'] mb-6 ${textColor}`}>
                                Make new collection
                            </Text>

                            <View className="mb-2">
                                <TextInput
                                    className={`border ${isDark ? 'border-gray-600 text-white' : 'border-gray-200 text-gray-800'} rounded-xl px-4 py-3 font-['VisbyRound-Regular']`}
                                    placeholder="Collection name"
                                    placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
                                    value={collectionName}
                                    onChangeText={setCollectionName}
                                    maxLength={maxLength}
                                    autoFocus
                                />
                                <Text className={`text-right text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {collectionName.length}/{maxLength}
                                </Text>
                            </View>

                            <Text className={`text-sm mb-8 leading-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Only you can see this Collection, unless you share it with others.
                            </Text>

                            <View className="flex-row gap-3">
                                <View className="flex-1">
                                    <Button
                                        onPress={() => {
                                            setModalVisible(false);
                                            setCollectionName('');
                                        }}
                                        variant="secondary"
                                        className={isDark ? 'bg-gray-800' : 'bg-gray-100'}
                                    >
                                        Cancel
                                    </Button>
                                </View>

                                <View className="flex-1">
                                    <Button
                                        onPress={handleCreateCollection}
                                        disabled={!collectionName.trim()}
                                        variant={collectionName.trim() ? "primary" : "outline"}
                                    >
                                        Create
                                    </Button>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </Modal>

            {/* Collection Menu Bottom Sheet */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showCollectionMenu}
                onRequestClose={() => setShowCollectionMenu(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setShowCollectionMenu(false)}
                    className="flex-1 justify-end bg-black/50"
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                        className={`w-full ${bgColor} rounded-t-3xl p-6 pb-24 shadow-xl`}
                    >
                        {/* Collection Info */}
                        <View className="mb-4">
                            <Text className={`text-lg font-['VisbyRound-Bold'] ${textColor}`}>
                                {selectedCollection?.name}
                            </Text>
                            <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {selectedCollection?.count || 0} {(selectedCollection?.count || 0) > 1 ? 'properties' : 'property'}
                            </Text>
                        </View>

                        {/* Menu Options */}
                        <TouchableOpacity
                            onPress={handleRenameCollection}
                            className={`flex-row items-center py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                        >
                            <Ionicons name="pencil-outline" size={22} color={isDark ? '#E5E7EB' : '#374151'} />
                            <Text className={`ml-4 text-base font-['VisbyRound-Medium'] ${textColor}`}>
                                Rename Collection
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleDeleteCollection}
                            className="flex-row items-center py-4"
                        >
                            <Ionicons name="trash-outline" size={22} color="#EF4444" />
                            <Text className="ml-4 text-base font-['VisbyRound-Medium'] text-red-500">
                                Delete Collection
                            </Text>
                        </TouchableOpacity>


                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* Delete Confirmation Bottom Sheet */}
            <ConfirmationBottomSheet
                visible={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDeleteCollection}
                title={`Delete "${selectedCollection?.name}"?`}
                message={`This will remove ${selectedCollection?.count || 0} ${(selectedCollection?.count || 0) > 1 ? 'properties' : 'property'} from this collection. This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                confirmVariant="danger"
            />

            {/* Rename Collection Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showRenameModal}
                onRequestClose={() => setShowRenameModal(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
                    className="flex-1"
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => setShowRenameModal(false)}
                        className="flex-1 justify-end bg-black/50"
                    >
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={(e) => e.stopPropagation()}
                            className={`w-full ${bgColor} rounded-t-3xl p-6 pb-24 shadow-xl`}
                        >
                            <Text className={`text-xl font-['VisbyRound-Bold'] mb-6 ${textColor}`}>
                                Rename collection
                            </Text>

                            <View className="mb-2">
                                <TextInput
                                    className={`border ${isDark ? 'border-gray-600 text-white' : 'border-gray-200 text-gray-800'} rounded-xl px-4 py-3 font-['VisbyRound-Regular']`}
                                    placeholder="Collection name"
                                    placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
                                    value={renameValue}
                                    onChangeText={setRenameValue}
                                    maxLength={maxLength}
                                    autoFocus
                                />
                                <Text className={`text-right text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {renameValue.length}/{maxLength}
                                </Text>
                            </View>

                            <View className="flex-row gap-3 mt-6">
                                <View className="flex-1">
                                    <Button
                                        onPress={() => {
                                            setShowRenameModal(false);
                                            setRenameValue('');
                                        }}
                                        variant="secondary"
                                        className={isDark ? 'bg-gray-800' : 'bg-gray-100'}
                                    >
                                        Cancel
                                    </Button>
                                </View>

                                <View className="flex-1">
                                    <Button
                                        onPress={confirmRenameCollection}
                                        disabled={!renameValue.trim()}
                                        variant={renameValue.trim() ? "primary" : "outline"}
                                    >
                                        Save
                                    </Button>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}
