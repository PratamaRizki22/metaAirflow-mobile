import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MainTabNavigator } from './MainTabNavigator';
import PropertyDetailScreen from '../screens/tenant/PropertyDetailScreen';
import CreateBookingScreen from '../screens/tenant/CreateBookingScreen';
import ExploreScreen from '../screens/tenant/ExploreScreen';
import MyTripsScreen from '../screens/tenant/MyTripsScreen';
import BecomeHostScreen from '../screens/hosting/BecomeHostScreen';
import HostingDashboardScreen from '../screens/hosting/HostingDashboardScreen';
import ManagePropertiesScreen from '../screens/landlord/ManagePropertiesScreen';
import CreatePropertyScreen from '../screens/landlord/CreatePropertyScreen';
import EditPropertyScreen from '../screens/landlord/EditPropertyScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import BookingDetailScreen from '../screens/booking/BookingDetailScreen';
import ChatDetailScreen from '../screens/chat/ChatDetailScreen';

const Stack = createStackNavigator();

export function RootNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: true,
                headerBackTitle: '',
            }}
        >
            {/* Main Tab Navigator */}
            <Stack.Screen
                name="MainTabs"
                component={MainTabNavigator}
                options={{ headerShown: false }}
            />

            {/* Tenant Screens */}
            <Stack.Screen
                name="PropertyDetail"
                component={PropertyDetailScreen}
                options={{ title: 'Property Details' }}
            />
            <Stack.Screen
                name="CreateBooking"
                component={CreateBookingScreen}
                options={{ title: 'Book Property' }}
            />
            <Stack.Screen
                name="Explore"
                component={ExploreScreen}
                options={{ title: 'Explore Properties' }}
            />
            <Stack.Screen
                name="MyTrips"
                component={MyTripsScreen}
                options={{ title: 'My Trips' }}
            />

            {/* Hosting Screens */}
            <Stack.Screen
                name="BecomeHost"
                component={BecomeHostScreen}
                options={{ title: 'Become a Host' }}
            />
            <Stack.Screen
                name="HostingDashboard"
                component={HostingDashboardScreen}
                options={{ title: 'Hosting Dashboard' }}
            />

            {/* Landlord Screens */}
            <Stack.Screen
                name="ManageProperties"
                component={ManagePropertiesScreen}
                options={{ title: 'Manage Properties' }}
            />
            <Stack.Screen
                name="CreateProperty"
                component={CreatePropertyScreen}
                options={{ title: 'Add New Property' }}
            />
            <Stack.Screen
                name="EditProperty"
                component={EditPropertyScreen}
                options={{ title: 'Edit Property' }}
            />

            {/* Booking Screens */}
            <Stack.Screen
                name="BookingDetail"
                component={BookingDetailScreen}
                options={{ title: 'Booking Details' }}
            />

            {/* Chat Screens */}
            <Stack.Screen
                name="ChatDetail"
                component={ChatDetailScreen}
                options={{ headerShown: false }}
            />

            {/* Profile Screens */}
            <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{ title: 'Edit Profile' }}
            />
        </Stack.Navigator>
    );
}
