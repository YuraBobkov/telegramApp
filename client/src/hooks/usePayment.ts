import axios from 'axios';
import { useState } from 'react';
import { hapticFeedback } from '../utils/telegram';

interface PaymentDetails {
  orderId: string;
  amount: number;
  cryptoAddress: string;
  status: string;
}

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPaymentDetails = async (orderId: string): Promise<PaymentDetails | null> => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/payments/${orderId}/details`,
      );
      return response.data;
    } catch (err) {
      setError('Ошибка при получении деталей платежа');
      hapticFeedback.error();
      return null;
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (orderId: string) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/payments/${orderId}/status`,
      );
      return response.data;
    } catch (err) {
      setError('Ошибка при проверке статуса платежа');
      return null;
    }
  };

  return {
    loading,
    error,
    getPaymentDetails,
    checkPaymentStatus,
  };
};
