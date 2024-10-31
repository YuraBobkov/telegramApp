const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database');
const apiRoutes = require('./routes/api');
const bot = require('./bot');
const PaymentMonitorService = require('./services/paymentMonitorService');
const PaymentProcessingService = require('./services/paymentProcessingService');
const PaymentVerificationService = require('./services/paymentVerificationService');

// Загружаем переменные окружения
dotenv.config();

// Подключаемся к базе данных
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Роуты API
app.use('/api', apiRoutes);

// Добавляем обслуживание статических файлов админ-панели
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Обслуживание статических файлов React приложения
app.use(express.static(path.join(__dirname, 'public')));

// Все остальные GET-запросы отправляем на index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Инициализация мониторинга платежей
const paymentMonitor = new PaymentMonitorService(bot);
paymentMonitor.startMonitoring();

// Инициализация обработки платежей
const paymentProcessor = new PaymentProcessingService(bot);
paymentProcessor.startProcessing();

// Инициализация проверки платежей
const paymentVerification = new PaymentVerificationService(bot);
paymentVerification.startVerification();

// Базовый роут для проверки
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Запускаем бота
bot
  .launch()
  .then(() => {
    console.log('Telegram bot started');
  })
  .catch((err) => {
    console.error('Error starting Telegram bot:', err);
  });

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
