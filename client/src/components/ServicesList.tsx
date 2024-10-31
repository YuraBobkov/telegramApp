import { Box, Button, Card, CardContent, Grid, Typography } from '@mui/material';
import React from 'react';
import { useApp } from '../context/AppContext';
import { Service } from '../types';
import { hapticFeedback, telegram } from '../utils/telegram';

const ServicesList: React.FC = () => {
  const { services, loading, error } = useApp();

  if (loading) return <Typography align='center'>Загрузка сервисов...</Typography>;
  if (error)
    return (
      <Typography color='error' align='center'>
        {error}
      </Typography>
    );

  const handleServiceSelect = (service: Service) => {
    hapticFeedback.impact();
    telegram.sendData(
      JSON.stringify({
        type: 'order_init',
        serviceId: service._id,
        serviceName: service.name,
        price: service.price,
      }),
    );
  };

  return (
    <Box p={2}>
      <Typography variant='h5' gutterBottom align='center'>
        Доступные сервисы
      </Typography>
      <Grid container spacing={2}>
        {services.map((service) => (
          <Grid item xs={12} key={service._id}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  {service.name}
                </Typography>
                <Typography color='textSecondary' paragraph>
                  {service.description}
                </Typography>
                <Box display='flex' justifyContent='space-between' alignItems='center'>
                  <Typography variant='h6' color='primary'>
                    ${service.price}
                  </Typography>
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={() => handleServiceSelect(service)}
                  >
                    Оплатить USDT
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ServicesList;
