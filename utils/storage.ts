import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Utility untuk reset onboarding status
 * Gunakan ini untuk testing atau jika user ingin melihat onboarding lagi
 */
export async function resetOnboarding() {
    try {
        await AsyncStorage.removeItem('@metaairflow_onboarding');
        return true;
    } catch (error) {
        console.error('Error resetting onboarding:', error);
        return false;
    }
}

/**
 * Utility untuk clear semua app data
 * Gunakan dengan hati-hati! Ini akan menghapus semua data termasuk auth
 */
export async function clearAllData() {
    try {
        await AsyncStorage.clear();
        return true;
    } catch (error) {
        console.error('Error clearing app data:', error);
        return false;
    }
}

/**
 * Utility untuk debug - lihat semua keys di AsyncStorage
 */
export async function debugAsyncStorage() {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const data: Record<string, string | null> = {};

        for (const key of keys) {
            const value = await AsyncStorage.getItem(key);
            data[key] = value;
        }

        return data;
    } catch (error) {
        console.error('Error debugging AsyncStorage:', error);
        return null;
    }
}
