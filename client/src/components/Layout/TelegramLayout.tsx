import React, { useEffect } from 'react';
import { Box, useTheme } from '@mui/material';
import { initTelegramApp } from '../../utils/telegram';

interface TelegramLayoutProps {
  children: React.ReactNode;
}

const TelegramLayout: React.FC<TelegramLayoutProps> = ({ children }) => {
  const theme = useTheme();

  useEffect(() => {
    const webapp = initTelegramApp();

    // Используем themeParams для установки цветов
    const bgColor = webapp.themeParams?.bg_color || theme.palette.background.default;
    document.body.style.backgroundColor = bgColor;

    return () => {
      // Очистка при размонтировании
      document.body.style.backgroundColor = '';
    };
  }, [theme.palette.background.default]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        padding: '8px',
        backgroundColor: 'background.default',
      }}
    >
      {children}
    </Box>
  );
};

export default TelegramLayout;
