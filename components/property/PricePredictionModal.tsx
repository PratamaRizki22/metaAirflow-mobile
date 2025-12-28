import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { predictionService, PredictionInput, PredictionResult } from '../../services';
import { useThemeColors } from '../../hooks';

interface PricePredictionModalProps {
    visible: boolean;
    onClose: () => void;
    onApplyPrice: (price: number) => void;
    propertyData: {
        area: number;
        bathrooms: number;
        bedrooms: number;
        furnished: boolean;
        location: string;
        propertyType: string;
    };
}

export function PricePredictionModal({
    visible,
    onClose,
    onApplyPrice,
    propertyData,
}: PricePredictionModalProps) {
    const { isDark, textColor } = useThemeColors();
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState<PredictionResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [serviceEnabled, setServiceEnabled] = useState(true);

    useEffect(() => {
        if (visible) {
            checkServiceStatus();
        }
    }, [visible]);

    const checkServiceStatus = async () => {
        try {
            const status = await predictionService.getStatus();
            setServiceEnabled(status.isEnabled);
            if (status.isEnabled) {
                getPrediction();
            }
        } catch (err: any) {
            console.error('Failed to check prediction service status:', err);
            setServiceEnabled(false);
        }
    };

    const getPrediction = async () => {
        try {
            setLoading(true);
            setError(null);

            const input: PredictionInput = {
                area: propertyData.area,
                bathrooms: propertyData.bathrooms,
                bedrooms: propertyData.bedrooms,
                furnished: propertyData.furnished ? 'Yes' : 'No',
                location: propertyData.location,
                property_type: propertyData.propertyType,
            };

            const result = await predictionService.predictPrice(input);
            setPrediction(result);
        } catch (err: any) {
            setError(err.message || 'Failed to get price prediction');
            console.error('Prediction error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyPrice = () => {
        if (prediction) {
            onApplyPrice(prediction.predicted_price);
            onClose();
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return '#10B981'; // Green
        if (confidence >= 0.6) return '#F59E0B'; // Yellow
        return '#EF4444'; // Red
    };

    const getConfidenceLabel = (confidence: number) => {
        if (confidence >= 0.8) return 'High Confidence';
        if (confidence >= 0.6) return 'Medium Confidence';
        return 'Low Confidence';
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-center items-center px-6">
                <View
                    className={`w-full max-w-md rounded-3xl p-6 ${isDark ? 'bg-[#1E293B]' : 'bg-white'
                        }`}
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 12,
                        elevation: 8,
                    }}
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                                <Ionicons name="analytics" size={20} color="#00B87C" />
                            </View>
                            <Text className={`text-xl font-bold ${textColor}`}>
                                AI Price Prediction
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons
                                name="close-circle"
                                size={28}
                                color={isDark ? '#9CA3AF' : '#6B7280'}
                            />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="max-h-96">
                        {!serviceEnabled ? (
                            <View className="py-8 items-center">
                                <Ionicons name="warning-outline" size={48} color="#F59E0B" />
                                <Text className={`text-center mt-4 font-semibold ${textColor}`}>
                                    Service Unavailable
                                </Text>
                                <Text className="text-center text-text-secondary-light dark:text-text-secondary-dark mt-2">
                                    Price prediction service is currently disabled
                                </Text>
                            </View>
                        ) : loading ? (
                            <View className="py-8 items-center">
                                <ActivityIndicator size="large" color="#00B87C" />
                                <Text className="text-text-secondary-light dark:text-text-secondary-dark mt-4">
                                    Analyzing property data...
                                </Text>
                            </View>
                        ) : error ? (
                            <View className="py-8 items-center">
                                <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
                                <Text className={`text-center mt-4 font-semibold ${textColor}`}>
                                    Prediction Failed
                                </Text>
                                <Text className="text-center text-text-secondary-light dark:text-text-secondary-dark mt-2">
                                    {error}
                                </Text>
                                <TouchableOpacity
                                    onPress={getPrediction}
                                    className="bg-primary rounded-xl px-6 py-3 mt-4"
                                >
                                    <Text className="text-white font-semibold">Try Again</Text>
                                </TouchableOpacity>
                            </View>
                        ) : prediction ? (
                            <>
                                {/* Property Summary */}
                                <View
                                    className={`rounded-2xl p-4 mb-4 ${isDark ? 'bg-[#0F172A]' : 'bg-gray-50'
                                        }`}
                                >
                                    <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs mb-2">
                                        Based on:
                                    </Text>
                                    <View className="flex-row flex-wrap">
                                        <View className="flex-row items-center mr-4 mb-2">
                                            <Ionicons name="resize-outline" size={14} color="#6B7280" />
                                            <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs ml-1">
                                                {propertyData.area} sq ft
                                            </Text>
                                        </View>
                                        <View className="flex-row items-center mr-4 mb-2">
                                            <Ionicons name="bed-outline" size={14} color="#6B7280" />
                                            <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs ml-1">
                                                {propertyData.bedrooms} beds
                                            </Text>
                                        </View>
                                        <View className="flex-row items-center mr-4 mb-2">
                                            <Ionicons name="water-outline" size={14} color="#6B7280" />
                                            <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs ml-1">
                                                {propertyData.bathrooms} baths
                                            </Text>
                                        </View>
                                        <View className="flex-row items-center mb-2">
                                            <Ionicons name="home-outline" size={14} color="#6B7280" />
                                            <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs ml-1">
                                                {propertyData.furnished ? 'Furnished' : 'Unfurnished'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Predicted Price */}
                                <View className="items-center py-6">
                                    <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-2">
                                        Recommended Price
                                    </Text>
                                    <Text className={`text-4xl font-bold ${textColor}`}>
                                        MYR {prediction.predicted_price.toLocaleString('en-MY', {
                                            minimumFractionDigits: 2,
                                        })}
                                    </Text>
                                    <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs mt-1">
                                        per night
                                    </Text>
                                </View>

                                {/* Confidence Indicator */}
                                <View
                                    className="rounded-xl p-4 mb-4"
                                    style={{
                                        backgroundColor: `${getConfidenceColor(prediction.confidence)}20`,
                                    }}
                                >
                                    <View className="flex-row items-center justify-between mb-2">
                                        <Text
                                            className="font-semibold"
                                            style={{ color: getConfidenceColor(prediction.confidence) }}
                                        >
                                            {getConfidenceLabel(prediction.confidence)}
                                        </Text>
                                        <Text
                                            className="font-bold"
                                            style={{ color: getConfidenceColor(prediction.confidence) }}
                                        >
                                            {(prediction.confidence * 100).toFixed(0)}%
                                        </Text>
                                    </View>
                                    <View className="h-2 bg-white/30 rounded-full overflow-hidden">
                                        <View
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${prediction.confidence * 100}%`,
                                                backgroundColor: getConfidenceColor(prediction.confidence),
                                            }}
                                        />
                                    </View>
                                </View>

                                {/* Info */}
                                <View
                                    className={`rounded-xl p-3 mb-4 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'
                                        }`}
                                >
                                    <View className="flex-row">
                                        <Ionicons
                                            name="information-circle"
                                            size={16}
                                            color="#3B82F6"
                                            style={{ marginRight: 8, marginTop: 2 }}
                                        />
                                        <Text className="flex-1 text-xs text-blue-600 dark:text-blue-400">
                                            This prediction is based on AI analysis of similar properties in your
                                            area. Consider market conditions and property features when setting
                                            your final price.
                                        </Text>
                                    </View>
                                </View>

                                {/* Action Buttons */}
                                <View className="flex-row gap-3">
                                    <TouchableOpacity
                                        onPress={onClose}
                                        className={`flex-1 rounded-xl py-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'
                                            }`}
                                    >
                                        <Text
                                            className={`text-center font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'
                                                }`}
                                        >
                                            Cancel
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={handleApplyPrice}
                                        className="flex-1 bg-primary rounded-xl py-3"
                                    >
                                        <Text className="text-white text-center font-semibold">
                                            Apply Price
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : null}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
