const Order = require('../models/Order');
const CryptoPaymentService = require('./cryptoPaymentService');
const NotificationService = require('./notificationService');

class PaymentProcessingService {
  constructor(bot) {
    this.cryptoService = new CryptoPaymentService();
    this.notificationService = new NotificationService(bot);
    this.processingInterval = 2 * 60 * 1000; // 2 минуты
  }

  // Запуск обработки платежей
  startProcessing() {
    setInterval(() => this.processPayments(), this.processingInterval);
    console.log('Payment processing started');
  }

  // Обработка всех ожидающих платежей
  async processPayments() {
    try {
      const pendingOrders = await Order.find({ status: 'pending' }).populate('service');

      for (const order of pendingOrders) {
        await this.processOrder(order);
      }
    } catch (error) {
      console.error('Error processing payments:', error);
    }
  }

  // Обработка конкретного заказа
  async processOrder(order) {
    try {
      const balance = await this.cryptoService.checkAddressBalance(
        order.cryptoAddress,
        order.cryptoCurrency,
      );

      if (!balance) return;

      const rate = await this.cryptoService.getExchangeRate(order.cryptoCurrency);
      if (!rate) return;

      const expectedAmount = order.amount / rate;
      const tolerance = 0.001; // Допустимая погрешность 0.1%

      if (Math.abs(balance.balance - expectedAmount) <= tolerance * expectedAmount) {
        // Платёж получен
        order.status = 'paid';
        await order.save();

        // Отправляем уведомления
        await this.notificationService.notifyPaymentReceived(order);
        await this.notificationService.notifyUser(
          order.userId,
          `✅ Оплата получена для заказа #${order._id}!\nМы начинаем обработку вашего заказа.`,
        );

        // Запускаем процесс выполнения заказа
        await this.processSuccessfulPayment(order);
      } else if (balance.balance > 0) {
        // Получена неверная сумма
        await this.notificationService.notifyUser(
          order.userId,
          `⚠️ Для заказа #${order._id} получена неверная сумма.\nОжидалось: ${expectedAmount} ${order.cryptoCurrency}\nПолучено: ${balance.balance} ${order.cryptoCurrency}\nПожалуйста, свяжитесь с поддержкой.`,
        );
      }
    } catch (error) {
      console.error(`Error processing order ${order._id}:`, error);
    }
  }

  // Обработка успешного платежа
  async processSuccessfulPayment(order) {
    try {
      // Здесь может быть автоматическая обработка заказа
      // Например, отправка ключей, генерация доступов и т.д.

      // В данном примере просто уведомляем администраторов
      await this.notificationService.notifyAdmins(
        `🎉 Новый оплаченный заказ #${order._id}\nТребуется обработка!`,
      );
    } catch (error) {
      console.error(`Error processing successful payment for order ${order._id}:`, error);
    }
  }
}

module.exports = PaymentProcessingService;
