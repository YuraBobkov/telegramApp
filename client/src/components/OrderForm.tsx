import { Box, Button, Card, CardContent, MenuItem, TextField, Typography } from '@mui/material';
import { WebApp } from '@twa-dev/sdk';
import React, { ChangeEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const CRYPTO_CURRENCIES = ['BTC', 'ETH', 'USDT'];

const OrderForm: React.FC = () => {
  const { selectedService } = useApp();
  const navigate = useNavigate();
  const [cryptoCurrency, setCryptoCurrency] = useState('USDT');

  if (!selectedService) {
    navigate('/');
    return null;
  }

  const handleSubmit = () => {
    WebApp.sendData(
      JSON.stringify({
        type: 'order',
        serviceId: selectedService._id,
        cryptoCurrency,
      }),
    );
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCryptoCurrency(e.target.value);
  };

  return (
    <Box p={2}>
      <Card>
        <CardContent>
          <Typography variant='h5' gutterBottom>
            Оформление заказа
          </Typography>

          <Box my={2}>
            <Typography variant='h6'>{selectedService.name}</Typography>
            <Typography color='text.secondary'>{selectedService.description}</Typography>
            <Typography variant='h6' color='primary' mt={1}>
              ${selectedService.price}
            </Typography>
          </Box>

          <TextField
            select
            fullWidth
            label='Криптовалюта'
            value={cryptoCurrency}
            onChange={handleCurrencyChange}
            margin='normal'
          >
            {CRYPTO_CURRENCIES.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant='contained'
            color='primary'
            fullWidth
            size='large'
            onClick={handleSubmit}
            sx={{ mt: 2 }}
          >
            Оформить заказ
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OrderForm;
