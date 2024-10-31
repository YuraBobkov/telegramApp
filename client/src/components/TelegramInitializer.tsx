import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { validateInitData } from '../config/telegram';
import { initTelegramApp } from '../utils/telegram';

interface TelegramInitializerProps {
  children: React.ReactNode;
}

const TelegramInitializer: React.FC<TelegramInitializerProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        if (!validateInitData()) {
          throw new Error('Invalid Telegram Web App init data');
        }

        initTelegramApp();
        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize Telegram Web App');
      }
    };

    initialize();
  }, []);

  if (error) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
        <Typography color='error'>{error}</Typography>
      </Box>
    );
  }

  if (!isInitialized) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
};

export default TelegramInitializer;
