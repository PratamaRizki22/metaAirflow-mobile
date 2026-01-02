import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CustomTabBar } from '../components/navigation/CustomTabBar';
import { useMode } from '../contexts/ModeContext';
import { useAuth } from '../contexts/AuthContext';

// Tenant Mode Screens
import { SearchScreen } from '../screens/tabs/SearchScreen';
import { MessagesScreen } from '../screens/tabs/MessagesScreen';
import MyTripsScreen from '../screens/tenant/MyTripsScreen';
import { FavoritesScreen } from '../screens/tabs/FavoritesScreen';
import { ProfileScreen } from '../screens/tabs/ProfileScreen';

// Landlord Mode Screens
import { LandlordTodayScreen } from '../screens/landlord/LandlordTodayScreen';
import { LandlordInboxScreen } from '../screens/landlord/LandlordInboxScreen';
import ManagePropertiesScreen from '../screens/landlord/ManagePropertiesScreen';
import { LandlordBookingsScreen } from '../screens/landlord/LandlordBookingsScreen';

const Tab = createBottomTabNavigator();

export function MainTabNavigator() {
    const { isLandlordMode } = useMode();
    const { user } = useAuth();

    if (isLandlordMode) {
        // Landlord Mode Navigation
        return (
            <Tab.Navigator
                tabBar={(props) => <CustomTabBar {...props} />}
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Tab.Screen
                    name="Today"
                    component={LandlordTodayScreen}
                    options={{
                        tabBarLabel: 'Today',
                    }}
                />
                <Tab.Screen
                    name="Properties"
                    component={ManagePropertiesScreen}
                    options={{
                        tabBarLabel: 'Properties',
                    }}
                />
                <Tab.Screen
                    name="Bookings"
                    component={LandlordBookingsScreen}
                    options={{
                        tabBarLabel: 'Bookings',
                    }}
                />
                {/* Inbox Tab - Disabled until WebSocket is implemented */}
                {/* <Tab.Screen
                    name="Inbox"
                    component={LandlordInboxScreen}
                    options={{
                        tabBarLabel: 'Chat',
                    }}
                /> */}
                <Tab.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{
                        tabBarLabel: 'Profile',
                    }}
                />
            </Tab.Navigator>
        );
    }

    // Tenant Mode Navigation (Default)
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Search"
                component={SearchScreen}
                options={{
                    tabBarLabel: 'Search',
                }}
            />
            <Tab.Screen
                name="Favorites"
                component={FavoritesScreen}
                options={{
                    tabBarLabel: 'Favorites',
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        if (!user) {
                            // Prevent default navigation
                            e.preventDefault();
                            // Navigate to Login instead
                            navigation.getParent()?.navigate('Auth');
                        }
                    },
                })}
            />
            <Tab.Screen
                name="Trips"
                component={MyTripsScreen}
                options={{
                    tabBarLabel: 'Trips',
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        if (!user) {
                            e.preventDefault();
                            navigation.getParent()?.navigate('Auth');
                        }
                    },
                })}
            />
            {/* Messages Tab - Disabled until WebSocket is implemented */}
            {/* <Tab.Screen
                name="Messages"
                component={MessagesScreen}
                options={{
                    tabBarLabel: 'Chat',
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        if (!user) {
                            e.preventDefault();
                            navigation.getParent()?.navigate('Auth');
                        }
                    },
                })}
            /> */}
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                }}
            />
        </Tab.Navigator>
    );
}
