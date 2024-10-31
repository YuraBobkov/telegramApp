declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        platform: string;
      };
    };
  }
}

export const TELEGRAM_APP_CONFIG = {
  // Получаем initData из URL
  initData: new URLSearchParams(window.location.hash.slice(1)),

  // Базовые настройки
  settings: {
    appName: 'Payment Service',
    headerColor: '#2196f3',
    buttonColor: '#2196f3',
    buttonTextColor: '#ffffff',
  },

  // Поддерживаемые платформы
  platforms: ['android', 'ios', 'web', 'tdesktop'],

  // Минимальные версии приложения
  minVersions: {
    android: '6.0',
    ios: '6.0',
    web: '0.0.1',
  },
};

// Проверка, запущено ли приложение в Telegram
export const isTelegramWebapp = (): boolean => {
  return Boolean(window.Telegram?.WebApp);
};

// Проверка платформы
export const getPlatform = (): string => {
  if (!isTelegramWebapp()) return 'web';
  return window.Telegram?.WebApp.platform || 'web';
};

// Проверка параметров запуска
export const validateInitData = (): boolean => {
  if (!isTelegramWebapp()) return false;

  const initData = window.Telegram?.WebApp.initData;
  if (!initData) return false;

  try {
    const data = new URLSearchParams(initData);
    return Boolean(data.get('user') || data.get('start_param'));
  } catch {
    return false;
  }
};
