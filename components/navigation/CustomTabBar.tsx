import React, { useEffect } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { HomeIcon, MessagesIcon, TripsIcon, FavoritesIcon, ProfileIcon, SearchIcon } from './TabIcons';
import { useTabBarAnimation } from '../../contexts/TabBarAnimationContext';

interface CustomTabBarProps {
    state: any;
    descriptors: any;
    navigation: any;
}

export function CustomTabBar({ state, descriptors, navigation }: CustomTabBarProps) {
    const { isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const { tabBarOpacity } = useTabBarAnimation();





    // Animation for the entire Tab Bar container
    const animatedContainerStyle = useAnimatedStyle(() => {
        return {
            opacity: tabBarOpacity.value,
            // Remove translateY to keep tab bar fixed in position
        };
    });

    const getIcon = (routeName: string, isFocused: boolean) => {
        const color = isFocused
            ? '#FFFFFF' // White for active
            : '#9CA3AF'; // Gray for inactive

        const iconProps = { width: 24, height: 24, color };

        switch (routeName) {
            // Tenant Mode Tabs
            case 'Home':
                return <HomeIcon {...iconProps} />;
            case 'Explore':
                return <SearchIcon {...iconProps} />;
            case 'Messages':
                return <MessagesIcon {...iconProps} />;
            case 'Trips':
                return <TripsIcon {...iconProps} />;
            case 'Favorites':
                return <FavoritesIcon {...iconProps} />;
            case 'Profile':
                return <ProfileIcon {...iconProps} />;

            // Landlord Mode Tabs
            case 'Today':
                return <HomeIcon {...iconProps} />;
            case 'Properties':
                return <HomeIcon {...iconProps} />;
            case 'Bookings':
                return <TripsIcon {...iconProps} />;
            case 'Inbox':
                return <MessagesIcon {...iconProps} />;

            default:
                return null;
        }
    };

    const bgColor = isDark ? '#1E293B' : '#FFFFFF';
    const tabBarHeight = 60 + (insets.bottom > 0 ? insets.bottom : 20);

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    bottom: 10,
                    left: 0,
                    right: 0,
                    height: tabBarHeight,
                    backgroundColor: bgColor,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 20,
                    paddingTop: 10,
                    borderTopWidth: 1,
                    borderTopColor: isDark ? '#374151' : '#E5E7EB',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 10,
                },
                animatedContainerStyle
            ]}
        >
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
                            alignItems: 'center',
                            justifyContent: 'center',
                            flex: 1,
                        }}
                    >
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            {isFocused ? (
                                <MaskedView
                                    style={{ flexDirection: 'column', alignItems: 'center' }}
                                    maskElement={
                                        <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                            {getIcon(route.name, isFocused)}
                                            <Text
                                                style={{
                                                    fontSize: 12,
                                                    fontWeight: '600',
                                                    marginTop: 4,
                                                }}
                                            >
                                                {label}
                                            </Text>
                                        </View>
                                    }
                                >
                                    <LinearGradient
                                        colors={['#10A0F7', '#01E8AD']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={{ flexDirection: 'column', alignItems: 'center' }}
                                    >
                                        {/* Render invisible duplicates to maintain layout size for the gradient to cover */}
                                        <View style={{ opacity: 0, flexDirection: 'column', alignItems: 'center' }}>
                                            {getIcon(route.name, isFocused)}
                                            <Text
                                                style={{
                                                    fontSize: 12,
                                                    fontWeight: '600',
                                                    marginTop: 4,
                                                }}
                                            >
                                                {label}
                                            </Text>
                                        </View>
                                    </LinearGradient>
                                </MaskedView>
                            ) : (
                                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                    {getIcon(route.name, isFocused)}
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                );
            })}
        </Animated.View >
    );
}
