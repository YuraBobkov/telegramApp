import { Box, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { hapticFeedback, telegram } from '../utils/telegram';

interface PaymentStatusData {
  status: 'pending' | 'success';
  message: string;
  order: {
    id: string;
    status: string;
    expectedAmount: number;
    receivedAmount: number;
    remainingAmount: number;
  };
}

const PaymentStatus: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [status, setStatus] = useState<PaymentStatusData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/payments/${orderId}/status`,
        );
        setStatus(response.data);

        if (response.data.status === 'success') {
          hapticFeedback.success();
          telegram.sendData(
            JSON.stringify({
              type: 'payment_success',
              orderId: orderId,
            }),
          );
          setTimeout(() => {
            try {
              telegram.close();
            } catch (e) {
              console.error('Error closing WebApp:', e);
            }
          }, 1500);
        }
      } catch (err) {
        setError('Ошибка при проверке статуса платежа');
        hapticFeedback.error();
      }
    };

    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (error) {
    return (
      <Box p={2}>
        <Typography color='error' align='center'>
          {error}
        </Typography>
      </Box>
    );
  }

  if (!status) {
    return (
      <Box display='flex' justifyContent='center' p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Card>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Статус оплаты
          </Typography>
          <Typography paragraph>Заказ #{status.order.id}</Typography>
          <Typography paragraph>Статус: {status.message}</Typography>
          {status.status === 'pending' && (
            <>
              <Typography>Ожидается: {status.order.expectedAmount} USDT</Typography>
              <Typography>Получено: {status.order.receivedAmount} USDT</Typography>
              <Typography>Осталось: {status.order.remainingAmount} USDT</Typography>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentStatus;
