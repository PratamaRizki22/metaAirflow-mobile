import React, { createContext, useContext, useEffect } from 'react';
import { useSharedValue, SharedValue, withTiming } from 'react-native-reanimated';

interface TabBarAnimationContextType {
    tabBarOpacity: SharedValue<number>;
    tabBarTranslateY: SharedValue<number>;
    hideTabBar: () => void;
    showTabBar: () => void;
}

const TabBarAnimationContext = createContext<TabBarAnimationContextType | undefined>(undefined);

export function TabBarAnimationProvider({ children }: { children: React.ReactNode }) {
    const tabBarOpacity = useSharedValue(1);
    const tabBarTranslateY = useSharedValue(0);

    const hideTabBar = () => {
        tabBarOpacity.value = withTiming(0);
        tabBarTranslateY.value = withTiming(100);
    };

    const showTabBar = () => {
        tabBarOpacity.value = withTiming(1);
        tabBarTranslateY.value = withTiming(0);
    };

    return (
        <TabBarAnimationContext.Provider value={{ tabBarOpacity, tabBarTranslateY, hideTabBar, showTabBar }}>
            {children}
        </TabBarAnimationContext.Provider>
    );
}

export function useTabBarAnimation() {
    const context = useContext(TabBarAnimationContext);
    if (!context) {
        throw new Error('useTabBarAnimation must be used within a TabBarAnimationProvider');
    }
    return context;
}
