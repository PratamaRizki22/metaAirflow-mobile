import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
    StatusBar,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import authService from '../../services/authService';
import { LinearGradient } from 'expo-linear-gradient';

interface RegisterScreenProps {
    email: string;
    onRegisterSuccess: () => void;
    onBack: () => void;
}

export function RegisterScreen({ email, onRegisterSuccess, onBack }: RegisterScreenProps) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({});

    const handleRegister = async () => {
        setError('');

        const errors: { [key: string]: boolean } = {};
        if (!firstName) errors.firstName = true;
        if (!lastName) errors.lastName = true;
        if (!password) errors.password = true;
        if (!phone) errors.phone = true;
        if (!dateOfBirth) errors.dateOfBirth = true;

        setFieldErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        // Validate date format (MM/DD/YYYY)
        const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!dateRegex.test(dateOfBirth)) {
            setError('Date of birth must be in MM/DD/YYYY format');
            return;
        }

        setIsLoading(true);

        try {
            // Convert date format from MM/DD/YYYY to YYYY-MM-DD for backend
            const [month, day, year] = dateOfBirth.split('/');
            const formattedDate = `${year}-${month}-${day}`;

            const response = await authService.register({
                email,
                password,
                firstName,
                lastName,
                dateOfBirth: formattedDate,
                phone,
            });

            Alert.alert(
                'Success',
                'Registration successful!',
                [
                    {
                        text: 'OK',
                        onPress: onRegisterSuccess,
                    },
                ]
            );
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <View className="flex-1">
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <LinearGradient
                colors={['#FFFFFF', '#DAF3FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="flex-1"
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="flex-1 px-6 pt-16 pb-8">
                            {/* Back Button */}
                            <TouchableOpacity
                                onPress={onBack}
                                className="mb-6 w-6 h-6 items-center justify-center"
                            >
                                <Ionicons name="chevron-back" size={24} color="#334155" />
                            </TouchableOpacity>

                            {/* Title */}
                            <View className="items-center mb-8">
                                <Text className="text-lg font-semibold text-[#0f172a] mb-2">
                                    Sign Up
                                </Text>
                                <Text className="text-sm text-[#475569] text-center px-8">
                                    Join anBacke journey in property search.
                                </Text>
                            </View>

                            {error ? (
                                <View className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
                                    <Text className="text-red-600">{error}</Text>
                                </View>
                            ) : null}

                            {/* Form Fields */}
                            <View className="space-y-4">
                                {/* First Name */}
                                <View className="mb-4">
                                    <Text className="text-sm text-[#475569] mb-2">First Name</Text>
                                    <TextInput
                                        className={`bg-white border ${fieldErrors.firstName ? 'border-red-500' : 'border-[#10A0F7]'
                                            } rounded-md px-4 py-3 text-[#64748b]`}
                                        placeholder="Someone"
                                        placeholderTextColor="#64748b"
                                        value={firstName}
                                        onChangeText={(text) => {
                                            setFirstName(text);
                                            if (text) setFieldErrors((prev) => ({ ...prev, firstName: false }));
                                        }}
                                        editable={!isLoading}
                                    />
                                </View>

                                {/* Last Name */}
                                <View className="mb-4">
                                    <Text className="text-sm text-[#475569] mb-2">Last Name</Text>
                                    <TextInput
                                        className={`bg-white border ${fieldErrors.lastName ? 'border-red-500' : 'border-[#94a3b8]'
                                            } rounded-md px-4 py-3 text-[#64748b]`}
                                        placeholder="Handsome"
                                        placeholderTextColor="#64748b"
                                        value={lastName}
                                        onChangeText={(text) => {
                                            setLastName(text);
                                            if (text) setFieldErrors((prev) => ({ ...prev, lastName: false }));
                                        }}
                                        editable={!isLoading}
                                    />
                                </View>

                                {/* Birthday */}
                                <View className="mb-4">
                                    <Text className="text-sm text-[#475569] mb-2">Birthday</Text>
                                    <TouchableOpacity
                                        onPress={() => !isLoading && setShowDatePicker(true)}
                                        disabled={isLoading}
                                    >
                                        <View
                                            className={`bg-white border ${fieldErrors.dateOfBirth ? 'border-red-500' : 'border-[#94a3b8]'
                                                } rounded-md px-4 py-3 flex-row items-center justify-between`}
                                        >
                                            <Text className={dateOfBirth ? 'text-[#0f172a]' : 'text-[#64748b]'}>
                                                {dateOfBirth || '12/12/2012'}
                                            </Text>
                                            <Ionicons name="calendar-outline" size={16} color="#475569" />
                                        </View>
                                    </TouchableOpacity>
                                    {showDatePicker && (
                                        <DateTimePicker
                                            value={date}
                                            mode="date"
                                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                            onChange={(event, selectedDate) => {
                                                setShowDatePicker(Platform.OS === 'ios');
                                                if (selectedDate) {
                                                    setDate(selectedDate);
                                                    // Format as MM/DD/YYYY
                                                    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                                                    const day = String(selectedDate.getDate()).padStart(2, '0');
                                                    const year = selectedDate.getFullYear();
                                                    const formatted = `${month}/${day}/${year}`;
                                                    setDateOfBirth(formatted);
                                                    setFieldErrors((prev) => ({ ...prev, dateOfBirth: false }));
                                                }
                                            }}
                                            maximumDate={new Date()}
                                        />
                                    )}
                                </View>

                                {/* Phone Number */}
                                <View className="mb-4">
                                    <Text className="text-sm text-[#475569] mb-2">Phone Number</Text>
                                    <View className="relative">
                                        <TextInput
                                            className={`bg-white border ${fieldErrors.phone ? 'border-red-500' : 'border-[#94a3b8]'
                                                } rounded-md px-4 py-3 text-[#64748b]`}
                                            placeholder="+62 812 3456 7890"
                                            placeholderTextColor="#64748b"
                                            value={phone}
                                            onChangeText={(text) => {
                                                setPhone(text);
                                                if (text) setFieldErrors((prev) => ({ ...prev, phone: false }));
                                            }}
                                            keyboardType="phone-pad"
                                            editable={!isLoading}
                                        />
                                    </View>
                                </View>

                                {/* Password */}
                                <View className="mb-4">
                                    <Text className="text-sm text-[#475569] mb-2">Password</Text>
                                    <View className="relative">
                                        <TextInput
                                            className={`bg-white border ${fieldErrors.password ? 'border-red-500' : 'border-[#94a3b8]'
                                                } rounded-md px-4 py-3 pr-12 text-[#64748b]`}
                                            placeholder="********"
                                            placeholderTextColor="#64748b"
                                            value={password}
                                            onChangeText={(text) => {
                                                setPassword(text);
                                                if (text) setFieldErrors((prev) => ({ ...prev, password: false }));
                                            }}
                                            secureTextEntry={!showPassword}
                                            editable={!isLoading}
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-0 bottom-0 justify-center"
                                            disabled={isLoading}
                                        >
                                            <Ionicons
                                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                                size={16}
                                                color="#475569"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            {/* Next Button */}
                            <View className="mt-auto pt-8">
                                <TouchableOpacity
                                    onPress={handleRegister}
                                    disabled={isLoading}
                                    className={isLoading ? 'opacity-50' : ''}
                                    style={{
                                        borderRadius: 8,
                                        overflow: 'hidden',
                                    }}
                                >
                                    <LinearGradient
                                        colors={['#10A0F7', '#01E8AD']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0.65 }}
                                        className="py-3 px-4"
                                        style={{
                                            shadowColor: '#10A0F7',
                                            shadowOffset: { width: 4, height: 4 },
                                            shadowOpacity: 0.4,
                                            shadowRadius: 12,
                                            elevation: 8,
                                        }}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator color="white" />
                                        ) : (
                                            <Text className="text-[#f1f5f9] text-center font-semibold text-sm">
                                                Next
                                            </Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </View>
    );
}

