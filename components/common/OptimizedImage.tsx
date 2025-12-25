import React, { useState } from 'react';
import { Image, View, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OptimizedImageProps {
    uri: string;
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
    style?: any;
}

export function OptimizedImage({
    uri,
    width = '100%',
    height = 200,
    borderRadius = 0,
    resizeMode = 'cover',
    style,
}: OptimizedImageProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    return (
        <View style={[{ width, height, borderRadius, overflow: 'hidden', backgroundColor: '#E5E7EB' }, style]}>
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#14B8A6" />
                </View>
            )}

            {error ? (
                <View style={styles.errorContainer}>
                    <Ionicons name="image-outline" size={48} color="#9CA3AF" />
                </View>
            ) : (
                <Image
                    source={{ uri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode={resizeMode}
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                    onError={() => {
                        setLoading(false);
                        setError(true);
                    }}
                    // Performance optimizations
                    fadeDuration={300}
                    progressiveRenderingEnabled={true}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E5E7EB',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
});
