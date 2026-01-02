import React from 'react';
import Svg, { Circle, Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

export const NoFavoritesIllustration = () => {
    return (
        <Svg width="162" height="158" viewBox="0 0 162 158" fill="none">
            <Circle cx="85" cy="81" r="77" fill="#10A0F7" fillOpacity="0.1" />
            <Path
                d="M110.667 84.3333C116.13 78.98 121.667 72.5633 121.667 64.1667C121.667 58.8181 119.542 53.6887 115.76 49.9067C111.978 46.1247 106.848 44 101.5 44C95.0466 44 90.4999 45.8333 84.9999 51.3333C79.4999 45.8333 74.9533 44 68.4999 44C63.1514 44 58.0219 46.1247 54.2399 49.9067C50.4579 53.6887 48.3333 58.8181 48.3333 64.1667C48.3333 72.6 53.8333 79.0167 59.3333 84.3333L84.9999 110L110.667 84.3333Z"
                fill="#0F172A"
                fillOpacity="0.45"
                stroke="#CBD5E1"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <Path
                d="M47.633 104.094C47.2834 103.666 47.3466 103.036 47.7741 102.687L131 34.633C131.428 34.2834 132.058 34.3466 132.407 34.7741C132.757 35.2017 132.694 35.8317 132.266 36.1813L49.0402 104.235C48.6126 104.585 47.9826 104.521 47.633 104.094Z"
                fill="#0F172A"
            />
            <Rect y="34" width="72" height="28" rx="8" fill="white" />
            <Rect x="12" y="42" width="48" height="4" rx="2" fill="url(#paint0_linear_174_1519)" />
            <Rect x="12" y="50" width="48" height="4" rx="2" fill="#CBD5E1" />
            <Circle cx="70" cy="36" r="3" fill="url(#paint1_linear_174_1519)" />
            <Circle cx="85" cy="73" r="4" fill="url(#paint2_linear_174_1519)" />
            <Defs>
                <LinearGradient id="paint0_linear_174_1519" x1="12" y1="45.2696" x2="13.6933" y2="32.6317" gradientUnits="userSpaceOnUse">
                    <Stop stopColor="#10A0F7" />
                    <Stop offset="1" stopColor="#01E8AD" />
                </LinearGradient>
                <LinearGradient id="paint1_linear_174_1519" x1="67" y1="37.9044" x2="75.6543" y2="32.5216" gradientUnits="userSpaceOnUse">
                    <Stop stopColor="#10A0F7" />
                    <Stop offset="1" stopColor="#01E8AD" />
                </LinearGradient>
                <LinearGradient id="paint2_linear_174_1519" x1="81" y1="75.5391" x2="92.5391" y2="68.3621" gradientUnits="userSpaceOnUse">
                    <Stop stopColor="#10A0F7" />
                    <Stop offset="1" stopColor="#01E8AD" />
                </LinearGradient>
            </Defs>
        </Svg>
    );
};
