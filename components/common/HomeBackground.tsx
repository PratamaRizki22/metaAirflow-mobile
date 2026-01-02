import React from 'react';
import { Dimensions, View, Image } from 'react-native';

const { width } = Dimensions.get('window');
// Kembalikan ke rasio asli 360:270 agar tidak terlalu tinggi/besar
const height = (width * 270) / 360;

export const HomeBackground = () => {
    return (
        <View style={{ width: width, height: height, position: 'absolute', top: 0 }}>
            <Image
                source={require('../../assets/search_background.png')}
                style={{ width: '100%', height: '100%' }}
                // 'stretch' agar gambar dipaksa pas masuk ke kotak (seluruh gambar terlihat)
                // Jika ingin proporsi tetap terjaga sempurna tapi ada sisa space, pakai 'contain'
                resizeMode="stretch"
            />
        </View>
    );
};
