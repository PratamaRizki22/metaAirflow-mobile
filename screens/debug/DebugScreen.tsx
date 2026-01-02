import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import propertyService from '../../services/propertyService';

const DebugScreen = () => {
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const testEndpoints = async () => {
        setLoading(true);
        const tests = [];

        try {
            // Test 1: Mobile endpoint without filters
            try {
                const mobile = await propertyService.getMobileProperties(1, 10);
                tests.push({ name: 'Mobile Endpoint', success: true, data: mobile });
            } catch (error: any) {
                tests.push({ name: 'Mobile Endpoint', success: false, error: error.message });
            }

            // Test 2: Regular endpoint without filters
            try {
                const regular = await propertyService.getProperties(1, 10);
                tests.push({ name: 'Regular Endpoint', success: true, data: regular });
            } catch (error: any) {
                tests.push({ name: 'Regular Endpoint', success: false, error: error.message });
            }

            // Test 3: Search endpoint
            try {
                const search = await propertyService.searchProperties('Semarang', 1, 10);
                tests.push({ name: 'Search Endpoint', success: true, data: search });
            } catch (error: any) {
                tests.push({ name: 'Search Endpoint', success: false, error: error.message });
            }

            setResults(tests);
        } catch (error) {
            Alert.alert('Error', 'Failed to run tests');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
                API Debug Screen
            </Text>

            <TouchableOpacity
                onPress={testEndpoints}
                disabled={loading}
                style={{
                    backgroundColor: loading ? '#ccc' : '#007AFF',
                    padding: 15,
                    borderRadius: 8,
                    marginBottom: 20,
                }}
            >
                <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                    {loading ? 'Testing...' : 'Test All Endpoints'}
                </Text>
            </TouchableOpacity>

            {results && (
                <View>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                        Results:
                    </Text>
                    {results.map((test: any, index: number) => (
                        <View
                            key={index}
                            style={{
                                backgroundColor: test.success ? '#e8f5e8' : '#ffe8e8',
                                padding: 15,
                                marginBottom: 10,
                                borderRadius: 8,
                            }}
                        >
                            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>
                                {test.name}
                            </Text>
                            <Text style={{ color: test.success ? 'green' : 'red' }}>
                                Status: {test.success ? 'SUCCESS' : 'FAILED'}
                            </Text>
                            {test.success ? (
                                <Text style={{ marginTop: 5 }}>
                                    Properties: {test.data?.data?.properties?.length || 0}
                                </Text>
                            ) : (
                                <Text style={{ color: 'red', marginTop: 5 }}>
                                    Error: {test.error}
                                </Text>
                            )}
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    );
};

export default DebugScreen;
