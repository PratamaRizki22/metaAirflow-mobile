import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { refundService, type RefundRequest } from '../../services';

export default function RefundRequestsScreen({ navigation }: any) {
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null);
  const [note, setNote] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  useEffect(() => {
    loadRefundRequests();
  }, []);

  const loadRefundRequests = async () => {
    try {
      const requests = await refundService.getRefundRequests();
      setRefundRequests(requests);
    } catch (error) {
      console.error('Load refund requests error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAction = (request: RefundRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setNote('');
    setModalVisible(true);
  };

  const confirmAction = async () => {
    if (!selectedRequest) return;

    try {
      if (actionType === 'approve') {
        await refundService.approveRefund(selectedRequest.id, note);
        Alert.alert('Success', 'Refund approved successfully');
      } else {
        if (!note.trim()) {
          Alert.alert('Error', 'Please provide a reason for rejection');
          return;
        }
        await refundService.rejectRefund(selectedRequest.id, note);
        Alert.alert('Success', 'Refund rejected');
      }
      
      setModalVisible(false);
      loadRefundRequests();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to process refund request');
    }
  };

  const renderRefundRequest = ({ item }: { item: RefundRequest }) => (
    <View className="bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-semibold text-gray-900 flex-1">
          {item.lease.property.title}
        </Text>
        <View className={`px-2 py-1 rounded-full ${
          item.status === 'PENDING' ? 'bg-yellow-100' :
          item.status === 'APPROVED' ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <Text className={`text-xs font-medium ${
            item.status === 'PENDING' ? 'text-yellow-800' :
            item.status === 'APPROVED' ? 'text-green-800' : 'text-red-800'
          }`}>
            {item.status}
          </Text>
        </View>
      </View>

      <Text className="text-gray-600 mb-2">Tenant: {item.tenant.name}</Text>
      <Text className="text-gray-600 mb-2">Amount: RM {item.amount}</Text>
      <Text className="text-gray-700 mb-3">Reason: {item.reason}</Text>

      {item.status === 'PENDING' && (
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={() => handleAction(item, 'approve')}
            className="flex-1 bg-green-500 py-2 rounded-lg"
          >
            <Text className="text-white text-center font-medium">Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleAction(item, 'reject')}
            className="flex-1 bg-red-500 py-2 rounded-lg"
          >
            <Text className="text-white text-center font-medium">Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.landlordNote && (
        <View className="mt-3 p-2 bg-gray-50 rounded">
          <Text className="text-sm text-gray-600">Note: {item.landlordNote}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-gray-900 ml-4">
          Refund Requests
        </Text>
      </View>

      <FlatList
        data={refundRequests}
        renderItem={renderRefundRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadRefundRequests} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Ionicons name="document-text-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 text-lg mt-4">No refund requests</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-xl font-semibold mb-4">
              {actionType === 'approve' ? 'Approve Refund' : 'Reject Refund'}
            </Text>
            
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder={actionType === 'approve' ? 'Optional note...' : 'Reason for rejection...'}
              multiline
              numberOfLines={3}
              className="border border-gray-300 rounded-lg p-3 mb-4"
            />

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="flex-1 bg-gray-200 py-3 rounded-lg"
              >
                <Text className="text-center font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmAction}
                className={`flex-1 py-3 rounded-lg ${
                  actionType === 'approve' ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                <Text className="text-white text-center font-medium">
                  {actionType === 'approve' ? 'Approve' : 'Reject'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
