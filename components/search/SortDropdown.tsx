import React from 'react';
import { View, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SortDropdownProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (sortBy: string) => void;
    currentValue: string;
    isDark: boolean;
}

const SORT_OPTIONS = [
    { id: 'latest', label: 'Latest', icon: 'time-outline' },
    { id: 'price-low', label: 'Price: Low to High', icon: 'arrow-up-outline' },
    { id: 'price-high', label: 'Price: High to Low', icon: 'arrow-down-outline' },
    { id: 'popular', label: 'Most Popular', icon: 'star-outline' },
];

/**
 * Sort Dropdown Overlay
 * Displays sorting options in an absolute positioned overlay
 */
export function SortDropdown({ visible, onClose, onSelect, currentValue, isDark }: SortDropdownProps) {
    if (!visible) return null;

    return (
        <Pressable
            onPress={onClose}
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.3)', zIndex: 9999 }]}
        >
            <View style={{ paddingTop: 180, paddingHorizontal: 24 }}>
                <View style={{ alignItems: 'flex-end' }}>
                    <Pressable onPress={(e) => e.stopPropagation()}>
                        <View
                            className={`w-56 rounded-xl shadow-lg ${isDark ? 'bg-surface-dark' : 'bg-white'
                                }`}
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.25,
                                shadowRadius: 16,
                                elevation: 10,
                            }}
                        >
                            {SORT_OPTIONS.map((option, index) => (
                                <TouchableOpacity
                                    key={option.id}
                                    onPress={() => {
                                        onSelect(option.id);
                                        onClose();
                                    }}
                                    className={`flex-row items-center px-4 py-3 ${index === 0 ? 'rounded-t-xl' : ''
                                        } ${index === SORT_OPTIONS.length - 1 ? 'rounded-b-xl' : ''} ${currentValue === option.id
                                            ? 'bg-primary/10'
                                            : isDark ? 'bg-surface-dark' : 'bg-white'
                                        }`}
                                >
                                    <Ionicons
                                        name={option.icon as any}
                                        size={18}
                                        color={currentValue === option.id ? '#14B8A6' : '#9CA3AF'}
                                    />
                                    <Text className={`ml-3 flex-1 ${currentValue === option.id
                                        ? 'text-primary font-semibold'
                                        : isDark ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                        {option.label}
                                    </Text>
                                    {currentValue === option.id && (
                                        <Ionicons name="checkmark" size={20} color="#14B8A6" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Pressable>
                </View>
            </View>
        </Pressable>
    );
}
