import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

interface DateRangePickerProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (startDate: string, endDate: string) => void;
    minDate?: string;
    blockedDates?: string[]; // Dates that are already booked
    initialStartDate?: string;
    initialEndDate?: string;
}

export function DateRangePicker({
    visible,
    onClose,
    onConfirm,
    minDate,
    blockedDates = [],
    initialStartDate,
    initialEndDate,
}: DateRangePickerProps) {
    const { isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const [startDate, setStartDate] = useState<string | undefined>(initialStartDate);
    const [endDate, setEndDate] = useState<string | undefined>(initialEndDate);

    const bgColor = isDark ? '#1E293B' : '#FFFFFF';
    const textColor = isDark ? '#F1F5F9' : '#1E293B';
    const cardBg = isDark ? '#334155' : '#F8FAFC';

    const handleDayPress = (day: DateData) => {
        const selectedDate = day.dateString;

        // Check if date is blocked
        if (blockedDates.includes(selectedDate)) {
            return;
        }

        // If no start date or both dates are set, set as new start date
        if (!startDate || (startDate && endDate)) {
            setStartDate(selectedDate);
            setEndDate(undefined);
        }
        // If start date is set but no end date
        else if (startDate && !endDate) {
            // If selected date is before start date, swap them
            if (selectedDate < startDate) {
                setEndDate(startDate);
                setStartDate(selectedDate);
            } else {
                setEndDate(selectedDate);
            }
        }
    };

    const handleConfirm = () => {
        if (startDate && endDate) {
            onConfirm(startDate, endDate);
            onClose();
        }
    };

    const handleClear = () => {
        setStartDate(undefined);
        setEndDate(undefined);
    };

    // Generate marked dates for calendar
    const getMarkedDates = () => {
        const marked: any = {};

        // Mark blocked dates
        blockedDates.forEach((date) => {
            marked[date] = {
                disabled: true,
                disableTouchEvent: true,
                textColor: '#9CA3AF',
                customStyles: {
                    container: {
                        backgroundColor: isDark ? '#374151' : '#E5E7EB',
                    },
                    text: {
                        color: '#9CA3AF',
                        textDecorationLine: 'line-through',
                    },
                },
            };
        });

        // Mark start date
        if (startDate) {
            marked[startDate] = {
                ...marked[startDate],
                startingDay: true,
                color: '#00D9A3',
                textColor: '#FFFFFF',
                customStyles: {
                    container: {
                        backgroundColor: '#00D9A3',
                        borderTopLeftRadius: 8,
                        borderBottomLeftRadius: 8,
                    },
                    text: {
                        color: '#FFFFFF',
                        fontWeight: 'bold',
                    },
                },
            };
        }

        // Mark end date
        if (endDate) {
            marked[endDate] = {
                ...marked[endDate],
                endingDay: true,
                color: '#00D9A3',
                textColor: '#FFFFFF',
                customStyles: {
                    container: {
                        backgroundColor: '#00D9A3',
                        borderTopRightRadius: 8,
                        borderBottomRightRadius: 8,
                    },
                    text: {
                        color: '#FFFFFF',
                        fontWeight: 'bold',
                    },
                },
            };
        }

        // Mark dates in between
        if (startDate && endDate) {
            let currentDate = new Date(startDate);
            const end = new Date(endDate);

            while (currentDate < end) {
                currentDate.setDate(currentDate.getDate() + 1);
                const dateString = currentDate.toISOString().split('T')[0];

                if (dateString !== endDate && !blockedDates.includes(dateString)) {
                    marked[dateString] = {
                        color: '#00D9A3',
                        textColor: '#FFFFFF',
                        customStyles: {
                            container: {
                                backgroundColor: isDark ? '#00B87C' : '#5EEAD4',
                            },
                            text: {
                                color: isDark ? '#FFFFFF' : '#0F766E',
                            },
                        },
                    };
                }
            }
        }

        return marked;
    };

    const calculateNights = () => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        }
        return 0;
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Select date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, backgroundColor: bgColor }}>
                {/* Gradient Header */}
                <LinearGradient
                    colors={['#00D9A3', '#10A0F7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                        paddingHorizontal: 24,
                        paddingTop: 60,
                        paddingBottom: 20,
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <TouchableOpacity 
                            onPress={onClose}
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 18,
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Ionicons name="close" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', fontFamily: 'VisbyRound-Bold', color: '#FFFFFF' }}>
                            Select Dates
                        </Text>
                        <TouchableOpacity 
                            onPress={handleClear}
                            style={{
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 12,
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            }}
                        >
                            <Text style={{ color: '#FFFFFF', fontWeight: '600', fontFamily: 'VisbyRound-SemiBold' }}>Clear</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Date Summary Cards in Header */}
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        {/* Check-in */}
                        <View style={{ 
                            flex: 1, 
                            backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                            padding: 16, 
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                <Ionicons name="log-in-outline" size={16} color="#FFFFFF" />
                                <Text style={{ fontSize: 12, color: '#FFFFFF', marginLeft: 6, fontFamily: 'VisbyRound-SemiBold' }}>
                                    CHECK-IN
                                </Text>
                            </View>
                            <Text style={{ fontSize: 15, fontFamily: 'VisbyRound-Bold', color: '#FFFFFF' }}>
                                {startDate ? formatDate(startDate).split(',')[0] : 'Select date'}
                            </Text>
                        </View>

                        {/* Check-out */}
                        <View style={{ 
                            flex: 1, 
                            backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                            padding: 16, 
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                <Ionicons name="log-out-outline" size={16} color="#FFFFFF" />
                                <Text style={{ fontSize: 12, color: '#FFFFFF', marginLeft: 6, fontFamily: 'VisbyRound-SemiBold' }}>
                                    CHECK-OUT
                                </Text>
                            </View>
                            <Text style={{ fontSize: 15, fontFamily: 'VisbyRound-Bold', color: '#FFFFFF' }}>
                                {endDate ? formatDate(endDate).split(',')[0] : 'Select date'}
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                <ScrollView style={{ flex: 1 }}>
                    {/* Calendar */}
                    <View style={{ padding: 24 }}>
                        <Calendar
                            minDate={minDate || new Date().toISOString().split('T')[0]}
                            onDayPress={handleDayPress}
                            markingType={'custom'}
                            markedDates={getMarkedDates()}
                            theme={{
                                backgroundColor: bgColor,
                                calendarBackground: bgColor,
                                textSectionTitleColor: '#00D9A3',
                                selectedDayBackgroundColor: '#00D9A3',
                                selectedDayTextColor: '#FFFFFF',
                                todayTextColor: '#10A0F7',
                                dayTextColor: textColor,
                                textDisabledColor: '#9CA3AF',
                                monthTextColor: textColor,
                                textMonthFontWeight: 'bold',
                                textDayFontSize: 16,
                                textMonthFontSize: 18,
                                textDayHeaderFontSize: 14,
                                'stylesheet.calendar.header': {
                                    monthText: {
                                        fontSize: 18,
                                        fontWeight: 'bold',
                                        color: textColor,
                                    },
                                    arrow: {
                                        padding: 8,
                                    },
                                },
                            }}
                            style={{
                                borderRadius: 16,
                                padding: 8,
                                backgroundColor: cardBg,
                            }}
                            renderArrow={(direction) => (
                                <View style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 16,
                                    backgroundColor: isDark ? '#334155' : '#F1F5F9',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Ionicons 
                                        name={direction === 'left' ? 'chevron-back' : 'chevron-forward'} 
                                        size={20} 
                                        color="#00D9A3" 
                                    />
                                </View>
                            )}
                        />

                        {/* Legend */}
                        <View style={{ 
                            marginTop: 24, 
                            padding: 16, 
                            backgroundColor: cardBg, 
                            borderRadius: 12,
                            gap: 12 
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <View
                                    style={{
                                        width: 20,
                                        height: 20,
                                        backgroundColor: '#00D9A3',
                                        borderRadius: 6,
                                    }}
                                />
                                <Text style={{ color: textColor, fontSize: 14, fontFamily: 'VisbyRound-Medium' }}>Selected dates</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <View
                                    style={{
                                        width: 20,
                                        height: 20,
                                        backgroundColor: isDark ? '#374151' : '#E5E7EB',
                                        borderRadius: 6,
                                    }}
                                />
                                <Text style={{ color: textColor, fontSize: 14, fontFamily: 'VisbyRound-Medium' }}>Unavailable</Text>
                            </View>
                        </View>

                        {/* Nights Count */}
                        {startDate && endDate && (
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 16,
                                    borderRadius: 16,
                                    marginTop: 16,
                                    backgroundColor: isDark ? '#1E293B' : '#F0FDF4',
                                    borderWidth: 1,
                                    borderColor: isDark ? '#334155' : '#BBF7D0',
                                }}
                            >
                                <Ionicons name="moon-outline" size={20} color="#00D9A3" />
                                <Text style={{ color: '#00D9A3', fontFamily: 'VisbyRound-Bold', fontSize: 16, marginLeft: 8 }}>
                                    {calculateNights()} {calculateNights() === 1 ? 'Night' : 'Nights'}
                                </Text>
                            </View>
                        )}
                    </View>
                </ScrollView>

                {/* Confirm Button */}
                <View style={{ 
                    padding: 24,
                    paddingTop: 16,
                    paddingBottom: Math.max(insets.bottom, 24),
                    backgroundColor: cardBg,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 8,
                }}>
                    <TouchableOpacity
                        onPress={handleConfirm}
                        disabled={!startDate || !endDate}
                        style={{ borderRadius: 16, overflow: 'hidden' }}
                    >
                        <LinearGradient
                            colors={startDate && endDate ? ['#00D9A3', '#10A0F7'] : ['#9CA3AF', '#9CA3AF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                paddingVertical: 16,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                opacity: startDate && endDate ? 1 : 0.5,
                            }}
                        >
                            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                            <Text style={{ color: '#FFFFFF', fontFamily: 'VisbyRound-Bold', fontSize: 16, marginLeft: 8 }}>
                                Confirm Dates
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
