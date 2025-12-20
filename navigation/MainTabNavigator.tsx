import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CustomTabBar } from '../components/navigation/CustomTabBar';
import { HomeScreen } from '../screens/tabs/HomeScreen';
import { SearchScreen } from '../screens/tabs/SearchScreen';
import { AddPropertyScreen } from '../screens/tabs/AddPropertyScreen';
import { FavoritesScreen } from '../screens/tabs/FavoritesScreen';
import { ProfileScreen } from '../screens/tabs/ProfileScreen';

const Tab = createBottomTabNavigator();

export function MainTabNavigator() {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Home',
                }}
            />
            <Tab.Screen
                name="Search"
                component={SearchScreen}
                options={{
                    tabBarLabel: 'Search',
                }}
            />
            <Tab.Screen
                name="Add"
                component={AddPropertyScreen}
                options={{
                    tabBarLabel: 'Add',
                }}
            />
            <Tab.Screen
                name="Favorites"
                component={FavoritesScreen}
                options={{
                    tabBarLabel: 'Favorites',
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
    );
}
