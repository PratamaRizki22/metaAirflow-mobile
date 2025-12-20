import React, { useEffect } from 'react';
import { View, TouchableOpacity, Text, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { HomeIcon, SearchIcon, FavoritesIcon, ProfileIcon, AddIcon } from './TabIcons';

const { width } = Dimensions.get('window');

interface CustomTabBarProps {
    state: any;
    descriptors: any;
    navigation: any;
}

export function CustomTabBar({ state, descriptors, navigation }: CustomTabBarProps) {
    const { isDark } = useTheme();
    const insets = useSafeAreaInsets();

    // Tab bar dimensions
    const tabBarWidth = width - 48; // 24px margin on each side
    const tabBarHeight = 67;
    const tabCount = state.routes.length;
    const tabWidth = tabBarWidth / tabCount;

    // Animated indicator position
    const indicatorPosition = useSharedValue(0);

    useEffect(() => {
        indicatorPosition.value = withSpring(state.index * tabWidth, {
            damping: 20,
            stiffness: 150,
        });
    }, [state.index, tabWidth]);

    const animatedIndicatorStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: indicatorPosition.value }],
        };
    });

    const getIcon = (routeName: string, isFocused: boolean) => {
        const color = isFocused
            ? '#FFFFFF'
            : isDark
                ? '#14B8A6'
                : '#0D9488';

        const iconProps = { width: 22, height: 22, color };

        switch (routeName) {
            case 'Home':
                return <HomeIcon {...iconProps} />;
            case 'Search':
                return <SearchIcon {...iconProps} />;
            case 'Add':
                return <AddIcon {...iconProps} color="#FFFFFF" />;
            case 'Favorites':
                return <FavoritesIcon {...iconProps} />;
            case 'Profile':
                return <ProfileIcon {...iconProps} />;
            default:
                return null;
        }
    };

    const bgColor = isDark ? '#1E293B' : '#FFFFFF';
    const indicatorColor = isDark ? '#14B8A6' : '#0D9488';
    const textColorActive = '#FFFFFF';
    const textColorInactive = isDark ? '#14B8A6' : '#0D9488';

    return (
        <View
            style={{
                position: 'absolute',
                bottom: insets.bottom > 0 ? insets.bottom : 21,
                left: 24,
                right: 24,
                height: tabBarHeight,
                backgroundColor: bgColor,
                borderRadius: 40,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 6,
                // Shadow for iOS
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                // Elevation for Android
                elevation: 8,
            }}
        >
            {/* Animated Indicator */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        left: 6,
                        width: tabWidth - 12,
                        height: tabBarHeight - 12,
                        backgroundColor: indicatorColor,
                        borderRadius: 40,
                    },
                    animatedIndicatorStyle,
                ]}
            />

            {/* Tab Items */}
            {state.routes.map((route: any, index: number) => {
                const { options } = descriptors[route.key];
                const label = options.tabBarLabel ?? route.name;
                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                // Special styling for Add button
                const isAddButton = route.name === 'Add';

                return (
                    <TouchableOpacity
                        key={route.key}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1,
                        }}
                    >
                        <View style={{ alignItems: 'center', gap: 4 }}>
                            {getIcon(route.name, isFocused)}
                            {!isAddButton && (
                                <Text
                                    style={{
                                        fontSize: 11,
                                        fontWeight: '600',
                                        color: isFocused ? textColorActive : textColorInactive,
                                    }}
                                >
                                    {label}
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
