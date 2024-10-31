declare module '@twa-dev/sdk' {
  interface MainButton {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    setParams: (params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }) => void;
  }

  interface HapticFeedback {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  }

  interface ThemeParams {
    bg_color: string;
    text_color: string;
    hint_color: string;
    link_color: string;
    button_color: string;
    button_text_color: string;
    secondary_bg_color: string;
  }

  export const WebApp: {
    ready: () => void;
    sendData: (data: string) => void;
    MainButton: MainButton;
    HapticFeedback: HapticFeedback;
    enableClosingConfirmation: () => void;
    setHeaderColor: (color: string) => void;
    onEvent: (eventType: string, callback: () => void) => void;
    offEvent: (eventType: string, callback: () => void) => void;
    themeParams: ThemeParams;
    backgroundColor: string;
    headerColor: string;
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
    initData: string;
    initDataUnsafe: any;
    platform: string;
    colorScheme: 'light' | 'dark';
    close: () => void;
    expand: () => void;
    switchInlineQuery: (query: string) => void;
  };
}
