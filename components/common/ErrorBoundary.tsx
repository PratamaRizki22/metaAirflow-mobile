import React, { Component, ReactNode, ErrorInfo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
    children: ReactNode;
    fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary component to catch JavaScript errors anywhere in the child component tree
 * Logs errors and displays a fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to error reporting service (e.g., Sentry, Firebase Crashlytics)
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // TODO: Send to error tracking service
        // Sentry.captureException(error, { extra: errorInfo });
    }

    resetError = () => {
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render() {
        if (this.state.hasError && this.state.error) {
            // Custom fallback UI if provided
            if (this.props.fallback) {
                return this.props.fallback(this.state.error, this.resetError);
            }

            // Default fallback UI
            return (
                <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center px-6">
                    <ScrollView
                        contentContainerStyle={{
                            flexGrow: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingVertical: 40,
                        }}
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="items-center">
                            <Ionicons name="alert-circle" size={80} color="#EF4444" />

                            <Text className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mt-6 text-center">
                                Oops! Something went wrong
                            </Text>

                            <Text className="text-base text-text-secondary-light dark:text-text-secondary-dark mt-3 text-center">
                                We're sorry for the inconvenience. The app encountered an unexpected error.
                            </Text>

                            {__DEV__ && (
                                <View className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl w-full">
                                    <Text className="text-sm font-mono text-red-600 dark:text-red-400">
                                        {this.state.error.toString()}
                                    </Text>
                                    {this.state.error.stack && (
                                        <Text className="text-xs font-mono text-red-500 dark:text-red-500 mt-2">
                                            {this.state.error.stack.substring(0, 200)}...
                                        </Text>
                                    )}
                                </View>
                            )}

                            <TouchableOpacity
                                onPress={this.resetError}
                                className="mt-8 w-full"
                            >
                                <LinearGradient
                                    colors={['#14B8A6', '#0D9488']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    className="py-4 rounded-xl flex-row items-center justify-center"
                                >
                                    <Ionicons name="refresh" size={20} color="#FFF" />
                                    <Text className="text-white font-semibold text-base ml-2">
                                        Try Again
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    // TODO: Navigate to support/help screen
                                    console.log('Report issue');
                                }}
                                className="mt-4"
                            >
                                <Text className="text-primary font-semibold">
                                    Report this issue
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            );
        }

        return this.props.children;
    }
}
