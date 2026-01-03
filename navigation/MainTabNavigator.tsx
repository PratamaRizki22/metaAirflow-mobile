import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CustomTabBar } from '../components/navigation/CustomTabBar';
import { useMode } from '../contexts/ModeContext';
import { useAuth } from '../contexts/AuthContext';
import { TabBarAnimationProvider } from '../contexts/TabBarAnimationContext';

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

export const MainTabNavigator = () => {
    const { isLandlordMode } = useMode();
    const { user } = useAuth();

    if (isLandlordMode) {
        return (
            <TabBarAnimationProvider>
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
                    <Tab.Screen
                        name="Profile"
                        component={ProfileScreen}
                        options={{
                            tabBarLabel: 'Profile',
                        }}
                    />
                </Tab.Navigator>
            </TabBarAnimationProvider>
        );
    }

    // Tenant Mode Navigation (Default)
    return (
        <TabBarAnimationProvider>
            <Tab.Navigator
                tabBar={(props) => <CustomTabBar {...props} />}
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Tab.Screen
                    name="Explore"
                    component={SearchScreen}
                    options={{
                        tabBarLabel: 'Explore',
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
                                e.preventDefault();
                                navigation.getParent()?.navigate('Auth');
                            }
                        },
                    })}
                />
                <Tab.Screen
                    name="Messages"
                    component={MessagesScreen}
                    options={{
                        tabBarLabel: 'Messages',
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
                <Tab.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{
                        tabBarLabel: 'Profile',
                    }}
                />
            </Tab.Navigator>
        </TabBarAnimationProvider>
    );
};
