import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MainTabNavigator } from './MainTabNavigator';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import PropertyDetailScreen from '../screens/tenant/PropertyDetailScreen';
import CreateBookingScreen from '../screens/tenant/CreateBookingScreen';
import ExploreScreen from '../screens/tenant/ExploreScreen';
import MyTripsScreen from '../screens/tenant/MyTripsScreen';
import BecomeHostScreen from '../screens/hosting/BecomeHostScreen';
import AnalyticsScreen from '../screens/hosting/AnalyticsScreen';
import ManagePropertiesScreen from '../screens/landlord/ManagePropertiesScreen';
import CreatePropertyScreen from '../screens/landlord/CreatePropertyScreen';
import EditPropertyScreen from '../screens/landlord/EditPropertyScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import PaymentHistoryScreen from '../screens/profile/PaymentHistoryScreen';
import PaymentDetailScreen from '../screens/payment/PaymentDetailScreen';
import PaymentScreenWrapper from '../screens/payment/PaymentScreenWrapper';
import BookingDetailScreen from '../screens/booking/BookingDetailScreen';
import ChatDetailScreen from '../screens/chat/ChatDetailScreen';
import WriteReviewScreen from '../screens/review/WriteReviewScreen';
import ReviewsListScreen from '../screens/review/ReviewsListScreen';
import { OfflineBanner } from '../components/common';
import { useNetwork } from '../hooks';
import { useTheme } from '../contexts/ThemeContext';
import { useMode } from '../contexts/ModeContext';

const Stack = createStackNavigator();

export function RootNavigator() {
    const { isOffline } = useNetwork();
    const { isDark } = useTheme();
    const { isSwitchingMode, mode } = useMode();

    return (
        <View style={{ flex: 1 }}>
            <Stack.Navigator
                screenOptions={{
                    headerShown: true,
                    headerBackTitle: '',
                    headerStyle: {
                        backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                    },
                    headerTintColor: isDark ? '#F1F5F9' : '#1F2937',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            >
                {/* Main Tab Navigator */}
                <Stack.Screen
                    name="MainTabs"
                    component={MainTabNavigator}
                    options={{ headerShown: false }}
                />

                {/* Auth Screens */}
                <Stack.Screen
                    name="Login"
                    options={{ title: 'Login', headerShown: false }}
                >
                    {({ navigation }) => (
                        <LoginScreen
                            onLoginSuccess={() => navigation.goBack()}
                            onNavigateToRegister={() => navigation.replace('Register')}
                        />
                    )}
                </Stack.Screen>
                <Stack.Screen
                    name="Register"
                    options={{ title: 'Register', headerShown: false }}
                >
                    {({ navigation }) => (
                        <RegisterScreen
                            onRegisterSuccess={() => navigation.goBack()}
                            onNavigateToLogin={() => navigation.replace('Login')}
                        />
                    )}
                </Stack.Screen>

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
                    name="Analytics"
                    component={AnalyticsScreen}
                    options={{ title: 'Analytics' }}
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

                {/* Review Screens */}
                <Stack.Screen
                    name="WriteReview"
                    component={WriteReviewScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="ReviewsList"
                    component={ReviewsListScreen}
                    options={{ headerShown: false }}
                />

                {/* Profile Screens */}
                <Stack.Screen
                    name="EditProfile"
                    component={EditProfileScreen}
                    options={{ title: 'Edit Profile' }}
                />

                {/* Payment Screens */}
                <Stack.Screen
                    name="Payment"
                    component={PaymentScreenWrapper}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="PaymentHistory"
                    component={PaymentHistoryScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="PaymentDetail"
                    component={PaymentDetailScreen}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>

            {/* Global Offline Banner */}
            <OfflineBanner isOffline={isOffline} />

            {/* Mode Switching Loading Overlay */}
            {isSwitchingMode && (
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 9999,
                    }}
                >
                    <LinearGradient
                        colors={['rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.9)']}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                        }}
                    />
                    <View style={{ alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#00D9A3" />
                        <Text
                            style={{
                                color: '#FFFFFF',
                                marginTop: 16,
                                fontSize: 16,
                                fontWeight: '600'
                            }}
                        >
                            Switching to {mode === 'tenant' ? 'Landlord' : 'Tenant'} Mode...
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
}
