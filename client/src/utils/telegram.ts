import { WebApp } from '@twa-dev/sdk';
import { TELEGRAM_APP_CONFIG } from '../config/telegram';

export const initTelegramApp = () => {
  // Инициализация веб-приложения
  WebApp.ready();

  // Настройка темы
  const { bg_color, text_color } = WebApp.themeParams;
  document.documentElement.style.setProperty('--tg-theme-bg-color', bg_color);
  document.documentElement.style.setProperty('--tg-theme-text-color', text_color);

  // Настройка главной кнопки
  WebApp.MainButton.setParams({
    text: 'Открыть каталог',
    color: TELEGRAM_APP_CONFIG.settings.buttonColor,
    text_color: TELEGRAM_APP_CONFIG.settings.buttonTextColor,
  });

  // Включаем haptic feedback
  WebApp.enableClosingConfirmation();

  return WebApp;
};

// Хелперы для работы с Telegram
export const telegram = {
  close: () => {
    try {
      WebApp.close();
    } catch (e) {
      console.error('Error closing WebApp:', e);
    }
  },

  sendData: (data: any) => {
    try {
      WebApp.sendData(JSON.stringify(data));
    } catch (e) {
      console.error('Error sending data:', e);
    }
  },

  expand: () => {
    try {
      WebApp.expand();
    } catch (e) {
      console.error('Error expanding WebApp:', e);
    }
  },
};

export const hapticFeedback = {
  success: () => WebApp.HapticFeedback.notificationOccurred('success'),
  warning: () => WebApp.HapticFeedback.notificationOccurred('warning'),
  error: () => WebApp.HapticFeedback.notificationOccurred('error'),
  impact: () => WebApp.HapticFeedback.impactOccurred('medium'),
};
