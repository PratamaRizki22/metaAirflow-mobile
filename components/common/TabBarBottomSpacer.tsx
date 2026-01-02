import React from 'react';
import { View } from 'react-native';

export const TabBarBottomSpacer = ({ height = 200 }: { height?: number }) => {
    return <View style={{ height }} />;
};
