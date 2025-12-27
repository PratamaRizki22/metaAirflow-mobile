import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface RoleSelectionSheetProps {
    visible: boolean;
    email: string;
    onSelectRole: (role: 'seeker' | 'advertiser') => void;
    onChangeEmail: () => void;
}

export function RoleSelectionSheet({
    visible,
    email,
    onSelectRole,
    onChangeEmail,
}: RoleSelectionSheetProps) {
    const [selectedRole, setSelectedRole] = useState<'seeker' | 'advertiser'>('seeker');

    const handleConfirm = () => {
        onSelectRole(selectedRole);
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            statusBarTranslucent
        >
            <Pressable 
                className="flex-1 bg-black/40 justify-end"
                onPress={onChangeEmail}
            >
                <Pressable onPress={(e) => e.stopPropagation()}>
                    <LinearGradient
                        colors={['#FFFFFF', '#DAF3FF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="rounded-t-3xl px-6 py-4"
                    >
                        {/* Email Info */}
                        <View className="mb-6">
                            <Text className="text-sm text-[#0f172a] text-center mb-2">
                                Email <Text className="font-semibold">{email}</Text>
                            </Text>
                            <Text className="text-sm text-[#0f172a] text-center">
                                not registered yet
                            </Text>
                            <Text className="text-sm text-[#64748b] text-center mt-2">
                                Continue as
                            </Text>
                        </View>

                        {/* Role Selection */}
                        <View className="mb-6">
                            {/* Property Seekers */}
                            <TouchableOpacity
                                onPress={() => setSelectedRole('seeker')}
                                className="mb-4"
                            >
                                <LinearGradient
                                    colors={selectedRole === 'seeker' ? ['#FFFFFF', '#DAF3FF'] : ['#FFFFFF', '#FFFFFF']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    className="rounded-md px-4 py-3 flex-row items-center justify-between"
                                >
                                    <Text
                                        className={`text-sm ${
                                            selectedRole === 'seeker' ? 'text-[#10A0F7] font-medium' : 'text-[#475569]'
                                        }`}
                                    >
                                        property seekers
                                    </Text>
                                    <View
                                        className={`w-4 h-4 rounded-full border ${
                                            selectedRole === 'seeker'
                                                ? 'border-[#10A0F7] bg-[#10A0F7]'
                                                : 'border-[#94a3b8]'
                                        } items-center justify-center`}
                                    >
                                        {selectedRole === 'seeker' && (
                                            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                                        )}
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Property Advertisers */}
                            <TouchableOpacity
                                onPress={() => setSelectedRole('advertiser')}
                            >
                                <View className="bg-white rounded-md px-4 py-3 flex-row items-center justify-between border border-[#cbd5e1]">
                                    <Text
                                        className={`text-sm ${
                                            selectedRole === 'advertiser' ? 'text-[#10A0F7] font-medium' : 'text-[#475569]'
                                        }`}
                                    >
                                        property advertisers
                                    </Text>
                                    <View
                                        className={`w-4 h-4 rounded-full border ${
                                            selectedRole === 'advertiser'
                                                ? 'border-[#10A0F7] bg-[#10A0F7]'
                                                : 'border-[#94a3b8]'
                                        } items-center justify-center`}
                                    >
                                        {selectedRole === 'advertiser' && (
                                            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Action Buttons */}
                        <View className="flex-row gap-3 mb-4">
                            {/* Change Email */}
                            <TouchableOpacity
                                onPress={onChangeEmail}
                                className="flex-1"
                            >
                                <LinearGradient
                                    colors={['#FFFFFF', '#DAF3FF']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    className="rounded-md px-4 py-3 border border-[#cbd5e1]"
                                >
                                    <Text className="text-sm text-[#475569] text-center font-medium">
                                        Change Email
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Yes, Sign up */}
                            <TouchableOpacity
                                onPress={handleConfirm}
                                className="flex-1"
                            >
                                <LinearGradient
                                    colors={['#10A0F7', '#01E8AD']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    className="rounded-md px-4 py-3 border border-[#10A0F7]"
                                >
                                    <Text className="text-sm text-[#f1f5f9] text-center font-medium">
                                        Yes, Sign up
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
