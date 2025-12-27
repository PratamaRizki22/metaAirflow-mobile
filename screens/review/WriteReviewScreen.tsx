import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../../hooks';
import { StarRating } from '../../components/review';
import { reviewService } from '../../services';

export default function WriteReviewScreen({ route, navigation }: any) {
    const { bookingId, propertyId, propertyTitle } = route.params;
    const { bgColor, textColor, cardBg, borderColor } = useThemeColors();

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        // Validation
        if (rating === 0) {
            Alert.alert('Rating Required', 'Please select a star rating');
            return;
        }

        if (comment.trim().length < 10) {
            Alert.alert('Comment Too Short', 'Please write at least 10 characters');
            return;
        }

        try {
            setSubmitting(true);
            await reviewService.createReview({
                bookingId,
                propertyId,
                rating,
                comment: comment.trim(),
            });

            Alert.alert(
                'Review Submitted',
                'Thank you for your feedback!',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const getRatingText = (rating: number) => {
        switch (rating) {
            case 1: return 'Poor';
            case 2: return 'Fair';
            case 3: return 'Good';
            case 4: return 'Very Good';
            case 5: return 'Excellent';
            default: return 'Select Rating';
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className={`flex-1 ${bgColor}`}
        >
            <ScrollView className="flex-1">
                <View className="p-6">
                    {/* Header */}
                    <View className="mb-6">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="mb-4"
                        >
                            <Ionicons name="arrow-back" size={24} color={textColor === 'text-text-primary-dark' ? '#F1F5F9' : '#1E293B'} />
                        </TouchableOpacity>
                        <Text className={`text-3xl font-bold mb-2 ${textColor}`}>
                            Write a Review
                        </Text>
                        <Text className="text-text-secondary-light dark:text-text-secondary-dark">
                            {propertyTitle}
                        </Text>
                    </View>

                    {/* Rating Section */}
                    <View className={`${cardBg} p-6 rounded-2xl mb-4`}>
                        <Text className={`text-lg font-semibold mb-4 ${textColor}`}>
                            How was your stay?
                        </Text>
                        <View className="items-center mb-4">
                            <StarRating
                                rating={rating}
                                onRatingChange={setRating}
                                editable={true}
                                size={40}
                            />
                            <Text className={`mt-3 text-base font-semibold ${textColor}`}>
                                {getRatingText(rating)}
                            </Text>
                        </View>
                    </View>

                    {/* Comment Section */}
                    <View className={`${cardBg} p-6 rounded-2xl mb-6`}>
                        <Text className={`text-lg font-semibold mb-3 ${textColor}`}>
                            Share your experience
                        </Text>
                        <TextInput
                            placeholder="Tell us about your stay... (minimum 10 characters)"
                            placeholderTextColor="#9CA3AF"
                            value={comment}
                            onChangeText={setComment}
                            multiline
                            numberOfLines={6}
                            maxLength={500}
                            className={`border ${borderColor} rounded-xl p-4 ${textColor}`}
                            style={{ textAlignVertical: 'top', minHeight: 120 }}
                        />
                        <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs mt-2 text-right">
                            {comment.length}/500
                        </Text>
                    </View>

                    {/* Guidelines */}
                    <View className={`${cardBg} p-4 rounded-2xl mb-6`}>
                        <View className="flex-row items-start mb-2">
                            <Ionicons name="information-circle-outline" size={20} color="#00D9A3" />
                            <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm ml-2 flex-1">
                                Please be honest and respectful in your review
                            </Text>
                        </View>
                        <View className="flex-row items-start">
                            <Ionicons name="shield-checkmark-outline" size={20} color="#00D9A3" />
                            <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm ml-2 flex-1">
                                Your review helps other tenants make informed decisions
                            </Text>
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={submitting || rating === 0}
                        activeOpacity={0.8}
                        className="mb-3"
                    >
                        <LinearGradient
                            colors={rating === 0 ? ['#9CA3AF', '#9CA3AF'] : ['#00D9A3', '#00B87C']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="py-4 rounded-xl items-center"
                        >
                            <Text className="text-white text-lg font-bold">
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className={`py-4 rounded-xl items-center border ${borderColor}`}
                    >
                        <Text className="text-text-secondary-light dark:text-text-secondary-dark">
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
