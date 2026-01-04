import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Platform,
    Pressable,
    Alert,
    Keyboard,
    LayoutAnimation,
    UIManager, // Import UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemeColors } from '../../hooks';
import { collectionService } from '../../services';

interface Collection {
    id: string;
    name: string;
    propertyIds?: string[];
    propertyCount?: number;
}

interface CollectionModalProps {
    visible: boolean;
    onClose: () => void;
    onCollectionCreated?: () => void;
    onCollectionSelected?: (collectionId: string) => void;
    selectedPropertyId?: string | null;
    initialMode?: 'list' | 'create'; // Add initialMode prop
}

export function CollectionModal({
    visible,
    onClose,
    onCollectionCreated,
    onCollectionSelected,
    selectedPropertyId,
    initialMode = 'list', // Default to 'list'
}: CollectionModalProps) {
    const { isDark } = useTheme();
    const { textColor, secondaryTextColor } = useThemeColors();
    const insets = useSafeAreaInsets();

    const [bottomPadding, setBottomPadding] = useState(0);

    // Enable LayoutAnimation for Android
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    // Manual keyboard handling for smoother and more reliable behavior than KeyboardAvoidingView
    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const keyboardWillShow = Keyboard.addListener(showEvent, (e) => {
            // On Android, we just want to ensure we're above the keyboard
            // On iOS, layout animation handles it smoothly
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

            // Calculate padding: Keyboard Height - Safe Area (because keyboard covers safe area)
            // But we add a little extra spacing
            setBottomPadding(e.endCoordinates.height);
        });

        const keyboardWillHide = Keyboard.addListener(hideEvent, () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setBottomPadding(0);
        });

        return () => {
            keyboardWillShow.remove();
            keyboardWillHide.remove();
        };
    }, []);

    const [collections, setCollections] = useState<Collection[]>([]);
    // State for creating new collection
    const [showCreateForm, setShowCreateForm] = useState(initialMode === 'create');
    const [newCollectionName, setNewCollectionName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            setShowCreateForm(initialMode === 'create');
            loadCollections();
        }
    }, [visible, initialMode]);

    const loadCollections = async () => {
        try {
            setLoading(true);
            const response = await collectionService.getCollections();
            setCollections(response.data?.collections || []);
        } catch (error) {
            console.error('Failed to load collections:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCollection = async () => {
        if (!newCollectionName.trim()) {
            Alert.alert('Error', 'Please enter a collection name');
            return;
        }

        try {
            const response = await collectionService.createCollection(newCollectionName.trim());
            setNewCollectionName('');
            setShowCreateForm(false);
            await loadCollections();

            // If there's a selected property, add it to the new collection
            if (selectedPropertyId && response.data?.id && onCollectionSelected) {
                await onCollectionSelected(response.data.id);
            }

            if (onCollectionCreated) {
                onCollectionCreated();
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create collection');
        }
    };

    const handleSelectCollection = async (collectionId: string) => {
        if (onCollectionSelected && selectedPropertyId) {
            await onCollectionSelected(collectionId);
        }
        handleClose();
    };

    const handleClose = () => {
        setShowCreateForm(false);
        setNewCollectionName('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent
            navigationBarTranslucent
            onRequestClose={handleClose}
        >
            {/* Static Backdrop Overlay - Outside KAV so it doesn't shrink */}
            <Pressable
                className="absolute inset-0 bg-black/50"
                onPress={handleClose}
            />

            {/* Content Container with Manual Padding */}
            <View
                className="flex-1 justify-end"
                pointerEvents="box-none"
            >
                {/* Touchable area to close on tap outside (upper part) */}
                <Pressable
                    className="flex-1"
                    onPress={handleClose}
                />

                {/* Content Container */}
                <View
                    className={`rounded-t-3xl ${isDark ? 'bg-surface-dark' : 'bg-white'} px-6 py-6`}
                    style={{
                        maxHeight: '90%',
                        paddingBottom: bottomPadding > 0 ? (bottomPadding + insets.bottom + 60) : (insets.bottom + 20),
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 12,
                        elevation: 20,
                    }}
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className={`text-xl font-bold ${textColor}`}>
                            {showCreateForm ? 'Create Collection' : 'Add to Collection'}
                        </Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Ionicons name="close" size={24} color={isDark ? '#FFF' : '#000'} />
                        </TouchableOpacity>
                    </View>

                    {showCreateForm ? (
                        /* Create New Collection Form */
                        <View className="mb-4">
                            <Text className={`text-sm font-medium mb-2 ${secondaryTextColor}`}>
                                Collection Name
                            </Text>
                            <TextInput
                                value={newCollectionName}
                                onChangeText={setNewCollectionName}
                                placeholder="Enter collection name"
                                placeholderTextColor="#9CA3AF"
                                className={`px-4 py-3 rounded-xl border ${isDark
                                    ? 'bg-gray-800 border-gray-700 text-white'
                                    : 'bg-gray-50 border-gray-200 text-gray-900'
                                    }`}
                                autoFocus
                            />
                            <View className="flex-row gap-3 mt-4">
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowCreateForm(false);
                                        setNewCollectionName('');
                                    }}
                                    className={`flex-1 py-3 rounded-xl border ${isDark ? 'border-gray-700' : 'border-gray-200'
                                        }`}
                                >
                                    <Text className={`text-center font-semibold ${textColor}`}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleCreateCollection}
                                    className="flex-1 py-3 rounded-xl bg-primary"
                                >
                                    <Text className="text-center font-semibold text-white">
                                        Create
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <>
                            {/* Create New Collection Button */}
                            <TouchableOpacity
                                onPress={() => setShowCreateForm(true)}
                                className={`flex-row items-center p-4 rounded-xl mb-4 border-2 border-dashed ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-300 bg-gray-50'
                                    }`}
                            >
                                <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-3">
                                    <Ionicons name="add" size={24} color="#00D9A3" />
                                </View>
                                <View className="flex-1">
                                    <Text className={`text-base font-semibold ${textColor}`}>
                                        Create New Collection
                                    </Text>
                                    <Text className={`text-sm ${secondaryTextColor}`}>
                                        Organize your favorites
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {/* Existing Collections List */}
                            <ScrollView
                                className="max-h-96"
                                showsVerticalScrollIndicator={false}
                            >
                                {collections.length > 0 ? (
                                    collections.map((collection) => (
                                        <TouchableOpacity
                                            key={collection.id}
                                            onPress={() => handleSelectCollection(collection.id)}
                                            className={`flex-row items-center p-4 rounded-xl mb-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'
                                                }`}
                                        >
                                            <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-3">
                                                <Ionicons name="folder" size={24} color="#00D9A3" />
                                            </View>
                                            <View className="flex-1">
                                                <Text className={`text-base font-semibold ${textColor}`}>
                                                    {collection.name}
                                                </Text>
                                                <Text className={`text-sm ${secondaryTextColor}`}>
                                                    {collection.propertyCount || collection.propertyIds?.length || 0} properties
                                                </Text>
                                            </View>
                                            <Ionicons
                                                name="chevron-forward"
                                                size={20}
                                                color={isDark ? '#9CA3AF' : '#6B7280'}
                                            />
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <View className="items-center justify-center py-12">
                                        <Ionicons name="folder-outline" size={64} color="#9CA3AF" />
                                        <Text className={`text-lg font-semibold mt-4 ${textColor}`}>
                                            No Collections Yet
                                        </Text>
                                        <Text className={`text-sm mt-2 ${secondaryTextColor} text-center`}>
                                            Create a collection to organize{'\n'}your favorite properties
                                        </Text>
                                    </View>
                                )}
                            </ScrollView>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
}
