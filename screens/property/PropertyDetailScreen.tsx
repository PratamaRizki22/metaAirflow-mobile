import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { LoginPrompt } from '../../components/auth';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Property Detail Screen with Guest Mode implementation
 * Users can view details without login
 * But need login for: save favorite, contact seller, make offer
 */
export function PropertyDetailScreen() {
    const { isDark } = useTheme();
    const { isLoggedIn } = useAuth();

    // Setup auth requirement untuk favorite
    const {
        requireAuth: requireAuthForFavorite,
        showPrompt: showFavoritePrompt,
        handleLogin: handleFavoriteLogin,
        handleRegister: handleFavoriteRegister,
        handleClose: handleFavoriteClose,
    } = useRequireAuth({
        title: 'Save to Favorites',
        message: 'Login to save your favorite properties and access them anytime',
    });

    // Setup auth requirement untuk contact
    const {
        requireAuth: requireAuthForContact,
        showPrompt: showContactPrompt,
        handleLogin: handleContactLogin,
        handleRegister: handleContactRegister,
        handleClose: handleContactClose,
    } = useRequireAuth({
        title: 'Contact Seller',
        message: 'Login to contact the property owner',
    });

    // Action yang butuh auth
    const handleSaveFavorite = requireAuthForFavorite(() => {
        // Logic untuk save favorite akan ditambahkan di sini
    });

    const handleContactSeller = requireAuthForContact(() => {
        // Logic untuk contact seller akan ditambahkan di sini
    });

    // Action yang TIDAK butuh auth (bisa dilakukan guest)
    const handleShare = () => {
        // Share functionality akan ditambahkan di sini
    };

    const textColor = isDark ? 'text-text-primary-dark' : 'text-text-primary-light';
    const bgColor = isDark ? 'bg-background-dark' : 'bg-background-light';

    return (
        <View className={`flex-1 ${bgColor}`}>
            <ScrollView className="flex-1 p-4">
                {/* Property Info - Accessible to everyone */}
                <View className="mb-6">
                    <Text className={`text-2xl font-bold mb-2 ${textColor}`}>
                        Modern Apartment in Jakarta
                    </Text>
                    <Text className={`text-xl font-semibold text-primary mb-4`}>
                        Rp 2.5M / month
                    </Text>
                    <Text className={`text-base ${textColor}`}>
                        Beautiful 2BR apartment with city view...
                    </Text>
                </View>

                {/* Action Buttons */}
                <View className="gap-3">
                    {/* Favorite - Requires Auth */}
                    <TouchableOpacity
                        onPress={handleSaveFavorite}
                        className="bg-primary py-4 rounded-2xl"
                        activeOpacity={0.8}
                    >
                        <Text className="text-white text-center font-semibold">
                            {isLoggedIn ? '❤️ Save to Favorites' : '🔒 Save to Favorites (Login Required)'}
                        </Text>
                    </TouchableOpacity>

                    {/* Contact - Requires Auth */}
                    <TouchableOpacity
                        onPress={handleContactSeller}
                        className="bg-primary py-4 rounded-2xl"
                        activeOpacity={0.8}
                    >
                        <Text className="text-white text-center font-semibold">
                            {isLoggedIn ? '💬 Contact Seller' : '🔒 Contact Seller (Login Required)'}
                        </Text>
                    </TouchableOpacity>

                    {/* Share - No Auth Required */}
                    <TouchableOpacity
                        onPress={handleShare}
                        className="bg-primary/10 py-4 rounded-2xl"
                        activeOpacity={0.8}
                    >
                        <Text className="text-primary text-center font-semibold">
                            📤 Share Property
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Login Prompts */}
            <LoginPrompt
                visible={showFavoritePrompt}
                title="Save to Favorites"
                message="Login to save your favorite properties and access them anytime"
                onLogin={handleFavoriteLogin}
                onRegister={handleFavoriteRegister}
                onClose={handleFavoriteClose}
            />

            <LoginPrompt
                visible={showContactPrompt}
                title="Contact Seller"
                message="Login to contact the property owner"
                onLogin={handleContactLogin}
                onRegister={handleContactRegister}
                onClose={handleContactClose}
            />
        </View>
    );
}
