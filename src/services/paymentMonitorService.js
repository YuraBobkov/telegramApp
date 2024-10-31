const Order = require('../models/Order');
const CryptoService = require('./cryptoService');
const NotificationService = require('./notificationService');

class PaymentMonitorService {
  constructor(bot) {
    this.cryptoService = new CryptoService();
    this.notificationService = new NotificationService(bot);
    this.monitoringInterval = 5 * 60 * 1000; // 5 минут
  }

  // Запуск мониторинга
  startMonitoring() {
    setInterval(() => this.checkPendingPayments(), this.monitoringInterval);
    console.log('Payment monitoring started');
  }

  // Проверка ожидающих оплаты заказов
  async checkPendingPayments() {
    try {
      const pendingOrders = await Order.find({ status: 'pending' }).populate('service');

      for (const order of pendingOrders) {
        const paymentStatus = await this.cryptoService.checkPaymentStatus(
          order.cryptoAddress,
          order.cryptoAmount,
          order.cryptoCurrency,
        );

        if (paymentStatus.status === 'confirmed') {
          // Обновляем статус заказа
          order.status = 'paid';
          await order.save();

          // Отправляем уведомления
          await this.notificationService.notifyPaymentReceived(order);
          await this.notificationService.notifyUser(
            order.userId,
            `💰 Оплата получена для заказа #${order._id}!\nМы начинаем обработку вашего заказа.`,
          );
        } else if (paymentStatus.status === 'failed') {
          // Обработка неудачного платежа
          order.status = 'cancelled';
          await order.save();

          await this.notificationService.notifyUser(
            order.userId,
            `❌ Оплата заказа #${order._id} не удалась.\nПожалуйста, свяжитесь с поддержкой.`,
          );
        }
      }
    } catch (error) {
      console.error('Error checking pending payments:', error);
    }
  }
}

module.exports = PaymentMonitorService;
