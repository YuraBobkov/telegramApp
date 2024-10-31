import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import Router from './Router';
import { AppProvider } from './context/AppContext';
import theme from './theme';
import TelegramLayout from './components/Layout/TelegramLayout';
import TelegramInitializer from './components/TelegramInitializer';

const App: React.FC = () => {
  return (
    <TelegramInitializer>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AppProvider>
            <TelegramLayout>
              <Router />
            </TelegramLayout>
          </AppProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TelegramInitializer>
  );
};

export default App;
