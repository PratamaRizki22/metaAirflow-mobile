import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';

interface CustomTextProps extends RNTextProps {
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'button';
    bold?: boolean;
    medium?: boolean;
    className?: string;
}

/**
 * Custom Text Component with Visby Round Font
 * 
 * Usage:
 * <Text variant="h1">Header</Text>
 * <Text variant="body" bold>Bold text</Text>
 * <Text className="text-red-500">Custom styling</Text>
 */
export function Text({
    variant = 'body',
    bold = false,
    medium = false,
    className = '',
    style,
    children,
    ...props
}: CustomTextProps) {

    // Determine font family based on variant and modifiers
    const getFontFamily = (): string => {
        // Headers (h1, h2, h3, h4) always use Bold
        if (variant.startsWith('h')) {
            return 'VisbyRound-Bold';
        }

        // Button text uses DemiBold
        if (variant === 'button') {
            return 'VisbyRound-DemiBold';
        }

        // Body and caption can be modified
        if (bold) return 'VisbyRound-Bold';
        if (medium) return 'VisbyRound-Medium';

        return 'VisbyRound-Regular';
    };

    // Get font size based on variant
    const getFontSize = (): number => {
        switch (variant) {
            case 'h1': return 32; // text-3xl equivalent
            case 'h2': return 24; // text-2xl equivalent
            case 'h3': return 20; // text-xl equivalent
            case 'h4': return 18; // text-lg equivalent
            case 'button': return 16; // text-base equivalent
            case 'caption': return 12; // text-xs equivalent
            case 'body':
            default: return 14; // text-sm equivalent
        }
    };

    const textStyle: TextStyle = {
        fontFamily: getFontFamily(),
        fontSize: getFontSize(),
    };

    return (
        <RNText
            className={className}
            style={[textStyle, style]}
            {...props}
        >
            {children}
        </RNText>
    );
}
