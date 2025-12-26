import React from 'react';
import { View, Text } from 'react-native';
import { StarRating } from './StarRating';
import { useThemeColors } from '../../hooks';

interface ReviewCardProps {
    rating: number;
    comment: string;
    userName: string;
    userPhoto?: string;
    date: string;
}

export function ReviewCard({ rating, comment, userName, date }: ReviewCardProps) {
    const { cardBg, textColor, secondaryTextColor } = useThemeColors();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
        if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
        return `${Math.floor(diffInDays / 365)} years ago`;
    };

    return (
        <View className={`${cardBg} p-4 rounded-2xl mb-3`}>
            {/* User Info */}
            <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 rounded-full bg-primary items-center justify-center mr-3">
                    <Text className="text-white font-bold text-base">
                        {userName.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View className="flex-1">
                    <Text className={`font-semibold ${textColor}`}>
                        {userName}
                    </Text>
                    <Text className={`text-xs ${secondaryTextColor}`}>
                        {formatDate(date)}
                    </Text>
                </View>
            </View>

            {/* Rating */}
            <View className="mb-2">
                <StarRating rating={rating} size={16} />
            </View>

            {/* Comment */}
            {comment && (
                <Text className={`${textColor} leading-5`}>
                    {comment}
                </Text>
            )}
        </View>
    );
}
