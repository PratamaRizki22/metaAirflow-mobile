import api from './api';

export interface RefundRequest {
  id: string;
  leaseId: string;
  reason: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  landlordNote?: string;
  createdAt: string;
  lease: {
    property: {
      title: string;
      images: string[];
    };
  };
  tenant: {
    name: string;
    email: string;
  };
}

class RefundService {
  // Create refund request (tenant)
  async createRefundRequest(leaseId: string, reason: string): Promise<RefundRequest> {
    const response = await api.post('/refunds/request', {
      leaseId,
      reason
    });
    return response.data.data;
  }

  // Get refund requests (filtered by role)
  async getRefundRequests(): Promise<RefundRequest[]> {
    const response = await api.get('/refunds');
    return response.data.data;
  }

  // Approve refund (landlord)
  async approveRefund(refundRequestId: string, note?: string): Promise<void> {
    await api.post(`/refunds/${refundRequestId}/approve`, { note });
  }

  // Reject refund (landlord)
  async rejectRefund(refundRequestId: string, note: string): Promise<void> {
    await api.post(`/refunds/${refundRequestId}/reject`, { note });
  }
}

export const refundService = new RefundService();
