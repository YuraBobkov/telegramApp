const CryptoApiService = require('./cryptoApiService');
const TransactionService = require('./transactionService');
const NotificationService = require('./notificationService');
const Order = require('../models/Order');

class PaymentVerificationService {
  constructor(bot) {
    this.cryptoApi = new CryptoApiService();
    this.transactionService = new TransactionService(bot);
    this.notificationService = new NotificationService(bot);
    this.verificationInterval = 2 * 60 * 1000; // 2 минуты
  }

  // Запуск автоматической проверки
  startVerification() {
    setInterval(() => this.verifyPendingPayments(), this.verificationInterval);
    console.log('Payment verification started');
  }

  // Проверка ожидающих платежей
  async verifyPendingPayments() {
    try {
      const pendingOrders = await Order.find({ status: 'pending' }).populate('service');

      for (const order of pendingOrders) {
        await this.verifyOrderPayment(order);
      }
    } catch (error) {
      console.error('Error verifying pending payments:', error);
    }
  }

  // Проверка платежа для конкретного заказа
  async verifyOrderPayment(order) {
    try {
      const balance = await this.cryptoApi.checkBalance(order.cryptoAddress, order.cryptoCurrency);

      if (balance.total > 0) {
        // Получаем актуальный курс
        const rate = await this.cryptoApi.getExchangeRate(order.cryptoCurrency);
        const expectedAmount = order.amount / rate;
        const tolerance = 0.001; // 0.1% погрешность

        if (Math.abs(balance.total - expectedAmount) <= tolerance * expectedAmount) {
          // Платёж получен и сумма корректна
          order.status = 'paid';
          await order.save();

          // Создаем запись о транзакции
          await this.transactionService.createTransaction({
            orderId: order._id,
            amount: balance.total,
            currency: order.cryptoCurrency,
            status: 'confirmed',
          });

          // Отправляем уведомления
          await this.notificationService.notifyPaymentReceived(order);
          await this.notificationService.notifyUser(
            order.userId,
            `✅ Оплата подтверждена для заказа #${order._id}!\nМы начинаем обработку вашего заказа.`,
          );
        } else {
          // Получена неверная сумма
          await this.notificationService.notifyUser(
            order.userId,
            `⚠️ Получена неверная сумма для заказа #${order._id}.\nОжидалось: ${expectedAmount} ${order.cryptoCurrency}\nПолучено: ${balance.total} ${order.cryptoCurrency}`,
          );
        }
      }
    } catch (error) {
      console.error(`Error verifying payment for order ${order._id}:`, error);
    }
  }
}

module.exports = PaymentVerificationService;
