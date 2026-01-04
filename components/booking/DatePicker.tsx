import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

interface DatePickerProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (date: string) => void;
    minDate?: string;
    blockedDates?: string[];
    initialDate?: string;
    title?: string;
}

export function DatePicker({
    visible,
    onClose,
    onConfirm,
    minDate,
    blockedDates = [],
    initialDate,
    title = 'Select Date',
}: DatePickerProps) {
    const { isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const [selectedDate, setSelectedDate] = useState<string | undefined>(initialDate);

    useEffect(() => {
        if (visible) {
            setSelectedDate(initialDate);
        }
    }, [visible, initialDate]);

    const handleDayPress = (day: DateData) => {
        // Check if date is blocked
        if (blockedDates.includes(day.dateString)) {
            return;
        }
        setSelectedDate(day.dateString);
    };

    const handleConfirm = () => {
        if (selectedDate) {
            onConfirm(selectedDate);
            onClose();
        }
    };

    const handleClear = () => {
        setSelectedDate(undefined);
    };

    const getMarkedDates = () => {
        const marked: any = {};

        // Mark blocked dates
        blockedDates.forEach(date => {
            marked[date] = {
                disabled: true,
                disableTouchEvent: true,
                textColor: '#9CA3AF',
                customStyles: {
                    container: {
                        backgroundColor: isDark ? '#374151' : '#F3F4F6',
                    },
                    text: {
                        color: '#9CA3AF',
                        textDecorationLine: 'line-through',
                    },
                },
            };
        });

        // Mark selected date
        if (selectedDate) {
            marked[selectedDate] = {
                selected: true,
                selectedColor: '#00B87C',
                selectedTextColor: '#FFFFFF',
            };
        }

        return marked;
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not selected';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/50">
                <View
                    className={`rounded-t-3xl ${isDark ? 'bg-surface-dark' : 'bg-white'}`}
                    style={{ paddingBottom: Math.max(insets.bottom, 16) }}
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
                        <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {title}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons
                                name="close-circle"
                                size={28}
                                color={isDark ? '#9CA3AF' : '#6B7280'}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Selected Date Display */}
                    <View className="px-6 pb-4">
                        <View className={`rounded-2xl p-4 ${isDark ? 'bg-card-dark' : 'bg-gray-50'}`}>
                            <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs mb-1">
                                SELECTED DATE
                            </Text>
                            <Text className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {formatDate(selectedDate)}
                            </Text>
                        </View>
                    </View>

                    {/* Calendar */}
                    <View className="px-6">
                        <Calendar
                            current={selectedDate || minDate || new Date().toISOString().split('T')[0]}
                            minDate={minDate}
                            onDayPress={handleDayPress}
                            markedDates={getMarkedDates()}
                            markingType="custom"
                            theme={{
                                backgroundColor: 'transparent',
                                calendarBackground: 'transparent',
                                textSectionTitleColor: isDark ? '#9CA3AF' : '#6B7280',
                                selectedDayBackgroundColor: '#00B87C',
                                selectedDayTextColor: '#FFFFFF',
                                todayTextColor: '#00B87C',
                                dayTextColor: isDark ? '#F3F4F6' : '#1F2937',
                                textDisabledColor: '#9CA3AF',
                                monthTextColor: isDark ? '#F3F4F6' : '#1F2937',
                                textMonthFontWeight: 'bold',
                                textDayFontSize: 16,
                                textMonthFontSize: 18,
                                textDayHeaderFontSize: 14,
                            }}
                            style={{
                                borderRadius: 16,
                                padding: 8,
                            }}
                        />
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row gap-3 px-6 pt-6">
                        <TouchableOpacity
                            onPress={handleClear}
                            className={`flex-1 rounded-xl py-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                        >
                            <Text className={`text-center font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Clear
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleConfirm}
                            disabled={!selectedDate}
                            className={`flex-1 rounded-xl py-3 ${selectedDate ? 'bg-primary' : isDark ? 'bg-gray-700' : 'bg-gray-300'
                                }`}
                        >
                            <Text
                                className={`text-center font-semibold ${selectedDate ? 'text-white' : isDark ? 'text-gray-500' : 'text-gray-400'
                                    }`}
                            >
                                Confirm
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
