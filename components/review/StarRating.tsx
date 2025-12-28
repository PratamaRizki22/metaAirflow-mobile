import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarRatingProps {
    rating: number;
    onRatingChange?: (rating: number) => void;
    size?: number;
    editable?: boolean;
    color?: string;
}

export function StarRating({
    rating,
    onRatingChange,
    size = 24,
    editable = false,
    color = '#FFB800'
}: StarRatingProps) {
    const stars = [1, 2, 3, 4, 5];

    const handlePress = (star: number) => {
        if (editable && onRatingChange) {
            onRatingChange(star);
        }
    };

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {stars.map((star) => {
                const isFilled = star <= rating;
                const isHalf = star === Math.ceil(rating) && rating % 1 !== 0;

                if (editable) {
                    return (
                        <TouchableOpacity
                            key={star}
                            onPress={() => handlePress(star)}
                            style={{ marginRight: 4 }}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={isFilled ? 'star' : 'star-outline'}
                                size={size}
                                color={isFilled ? color : '#D1D5DB'}
                            />
                        </TouchableOpacity>
                    );
                }

                return (
                    <View key={star} style={{ marginRight: 4 }}>
                        <Ionicons
                            name={isFilled ? 'star' : (isHalf ? 'star-half' : 'star-outline')}
                            size={size}
                            color={isFilled || isHalf ? color : '#D1D5DB'}
                        />
                    </View>
                );
            })}
        </View>
    );
}
