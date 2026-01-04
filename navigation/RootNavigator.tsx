import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MainTabNavigator } from './MainTabNavigator';
import { AuthFlowScreen } from '../screens/auth/AuthFlowScreen';
import PropertyDetailScreen from '../screens/tenant/PropertyDetailScreen';
import CreateBookingScreen from '../screens/tenant/CreateBookingScreen';
import ExploreScreen from '../screens/tenant/ExploreScreen';
import MyTripsScreen from '../screens/tenant/MyTripsScreen';
import BecomeHostScreen from '../screens/hosting/BecomeHostScreen';
import AnalyticsScreen from '../screens/hosting/AnalyticsScreen';
import ManagePropertiesScreen from '../screens/landlord/ManagePropertiesScreen';
import CreatePropertyScreen from '../screens/landlord/CreatePropertyScreen';
import EditPropertyScreen from '../screens/landlord/EditPropertyScreen';
import LandlordProfileScreen from '../screens/landlord/LandlordProfileScreen';
import LandlordPropertiesScreen from '../screens/landlord/LandlordPropertiesScreen';
import RefundRequestsScreen from '../screens/landlord/RefundRequestsScreen';
import StripeConnectScreen from '../screens/landlord/StripeConnectScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import GetHelpScreen from '../screens/profile/GetHelpScreen';
import TermsOfServiceScreen from '../screens/profile/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../screens/profile/PrivacyPolicyScreen';
import OpenSourceLicensesScreen from '../screens/profile/OpenSourceLicensesScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import PaymentDetailScreen from '../screens/payment/PaymentDetailScreen';
import PaymentScreenWrapper from '../screens/payment/PaymentScreenWrapper';
import BookingDetailScreen from '../screens/booking/BookingDetailScreen';
import ChatDetailScreen from '../screens/chat/ChatDetailScreen';
import WriteReviewScreen from '../screens/review/WriteReviewScreen';
import ReviewsListScreen from '../screens/review/ReviewsListScreen';
import { SearchInputScreen } from '../screens/search/SearchInputScreen';
import { LocationPropertiesScreen } from '../screens/search/LocationPropertiesScreen';
import { TopRatedPropertiesScreen } from '../screens/search/TopRatedPropertiesScreen';
import { MapSearchScreen } from '../screens/map/MapSearchScreen';
import { AllWishlistScreen } from '../screens/tabs/AllWishlistScreen';
import { CollectionDetailScreen } from '../screens/tabs/CollectionDetailScreen';
import { OfflineBanner, GradientHeader } from '../components/common';
import { useNetwork } from '../hooks';
import { useTheme } from '../contexts/ThemeContext';
import { useMode } from '../contexts/ModeContext';
import { useAuth } from '../contexts/AuthContext';

const Stack = createStackNavigator();

export function RootNavigator() {
    const { isOffline } = useNetwork();
    const { isDark } = useTheme();
    const { isSwitchingMode, mode } = useMode();
    const { user } = useAuth();

    return (
        <View style={{ flex: 1 }}>
            <Stack.Navigator
                screenOptions={{
                    headerShown: true,
                    headerBackTitle: '',
                    headerBackground: () => <GradientHeader />,
                    headerStyle: {
                        backgroundColor: 'transparent',
                    },
                    headerTintColor: '#FFFFFF',
                    headerTitleStyle: {
                        fontFamily: 'VisbyRound-Bold',
                        fontSize: 18,
                    },
                }}
            >
                {/* Main Tab Navigator or Admin Dashboard based on Role */}
                <Stack.Screen
                    name="MainTabs"
                    component={user?.role === 'ADMIN' ? AdminDashboardScreen : MainTabNavigator}
                    options={{ headerShown: false }}
                />

                {/* Admin Screens */}
                <Stack.Screen
                    name="AdminDashboard"
                    component={AdminDashboardScreen}
                    options={{ headerShown: false }}
                />

                {/* Auth Screens */}
                <Stack.Screen
                    name="Auth"
                    options={{ title: 'Authentication', headerShown: false }}
                >
                    {({ navigation }) => (
                        <AuthFlowScreen
                            onAuthSuccess={() => navigation.goBack()}
                            onClose={() => navigation.goBack()}
                        />
                    )}
                </Stack.Screen>

                {/* Tenant Screens */}
                <Stack.Screen
                    name="PropertyDetail"
                    component={PropertyDetailScreen}
                    options={{ headerShown: false }}
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
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="EditProperty"
                    component={EditPropertyScreen}
                    options={{ title: 'Edit Property' }}
                />
                <Stack.Screen
                    name="LandlordProfile"
                    component={LandlordProfileScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="LandlordProperties"
                    component={LandlordPropertiesScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="RefundRequests"
                    component={RefundRequestsScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="StripeConnect"
                    component={StripeConnectScreen}
                    options={{ headerShown: false }}
                />

                {/* Booking Screens */}
                <Stack.Screen
                    name="BookingDetail"
                    component={BookingDetailScreen}
                    options={{ headerShown: false }}
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
                <Stack.Screen
                    name="GetHelp"
                    component={GetHelpScreen}
                    options={{ title: 'Get Help' }}
                />
                <Stack.Screen
                    name="TermsOfService"
                    component={TermsOfServiceScreen}
                    options={{ title: 'Terms of Service' }}
                />
                <Stack.Screen
                    name="PrivacyPolicy"
                    component={PrivacyPolicyScreen}
                    options={{ title: 'Privacy Policy' }}
                />
                <Stack.Screen
                    name="OpenSourceLicenses"
                    component={OpenSourceLicensesScreen}
                    options={{ title: 'Open Source Licenses' }}
                />

                {/* Payment Screens */}
                <Stack.Screen
                    name="Payment"
                    component={PaymentScreenWrapper}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="PaymentDetail"
                    component={PaymentDetailScreen}
                    options={{ headerShown: false }}
                />

                {/* Search & Map Screens */}
                <Stack.Screen
                    name="SearchInput"
                    component={SearchInputScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="LocationProperties"
                    component={LocationPropertiesScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="TopRatedProperties"
                    component={TopRatedPropertiesScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="MapSearchInfo"
                    component={MapSearchScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="AllWishlist"
                    component={AllWishlistScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="CollectionDetail"
                    component={CollectionDetailScreen}
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
