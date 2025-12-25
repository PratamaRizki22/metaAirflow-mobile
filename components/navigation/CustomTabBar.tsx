import React, { useEffect } from 'react';
import { View, TouchableOpacity, Text, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { HomeIcon, MessagesIcon, FavoritesIcon, ProfileIcon, AddIcon } from './TabIcons';

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
    const tabBarWidth = width - 32; // 16px margin on each side
    const tabBarHeight = 67;
    const tabCount = state.routes.length;

    // Animated indicator position
    const indicatorPosition = useSharedValue(0);

    // Calculate actual tab width accounting for container padding
    // Container has paddingHorizontal: 16, so content area = tabBarWidth - 32
    const containerPadding = 16;
    const contentWidth = tabBarWidth - (containerPadding * 2);
    const actualTabWidth = contentWidth / tabCount;

    // Indicator should be slightly smaller than tab width for visual spacing
    const indicatorWidth = actualTabWidth - 8; // 4px padding on each side (wider for text)
    const indicatorOffset = 4; // Center the indicator within the tab

    useEffect(() => {
        // Skip animation if Add tab is selected (it has its own visual treatment)
        const currentRoute = state.routes[state.index];
        if (currentRoute.name === 'Add') {
            return;
        }

        // Calculate the actual position based on the current tab index
        // Layout: [Home=0] [Messages=1] [Add=2] [Favorites=3] [Profile=4]
        // Each tab occupies actualTabWidth, indicator aligns with the tab
        // Start from the tab position + offset to center it
        const targetPosition = state.index * actualTabWidth + indicatorOffset;

        indicatorPosition.value = withSpring(targetPosition, {
            damping: 40,
            stiffness: 200,
            overshootClamping: true,
        });
    }, [state.index, state.routes, actualTabWidth, indicatorOffset, indicatorPosition]);

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
            case 'Messages':
                return <MessagesIcon {...iconProps} />;
            case 'Add':
                return <AddIcon width={32} height={32} color="#FFFFFF" />;
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
                bottom: insets.bottom > 0 ? insets.bottom + 14 : 35,
                left: 16,
                right: 16,
                height: tabBarHeight,
                backgroundColor: bgColor,
                borderRadius: 40,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                // Shadow for iOS
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                // Elevation for Android
                elevation: 8,
            }}
        >
            {/* Animated Indicator - Hidden when Add tab is selected */}
            {state.routes[state.index].name !== 'Add' && (
                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            left: 16, // Match container's paddingHorizontal
                            width: indicatorWidth,
                            height: tabBarHeight - 12,
                            backgroundColor: indicatorColor,
                            borderRadius: 100, // More rounded pill shape
                            top: 6,
                            zIndex: 0, // Below the Add button (zIndex: 2)
                        },
                        animatedIndicatorStyle,
                    ]}
                />
            )}

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

                // Render Add button with special elevated design
                if (isAddButton) {
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
                                zIndex: 2,
                                height: '100%',
                            }}
                        >
                            <View
                                style={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: 30,
                                    backgroundColor: indicatorColor,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                    elevation: 8,
                                }}
                            >
                                {getIcon(route.name, true)}
                            </View>
                        </TouchableOpacity>
                    );
                }

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
                            height: '100%',
                        }}
                    >
                        <View style={{ alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                            {getIcon(route.name, isFocused)}
                            <Text
                                style={{
                                    fontSize: 11,
                                    fontWeight: '600',
                                    color: isFocused ? textColorActive : textColorInactive,
                                }}
                            >
                                {label}
                            </Text>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
