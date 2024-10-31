const Order = require('../models/Order');

class NotificationService {
  constructor(bot) {
    this.bot = bot;
    this.adminIds = process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(',') : [];
  }

  // Отправка уведомления о новом заказе администраторам
  async notifyNewOrder(order) {
    try {
      const populatedOrder = await Order.findById(order._id).populate('service');

      const message = `
🆕 Новый заказ!

🔸 Заказ #${order._id}
📦 Сервис: ${populatedOrder.service.name}
💰 Сумма: $${order.amount}
💎 Крипто: ${order.cryptoAmount} ${order.cryptoCurrency}
👤 ID пользователя: ${order.userId}
⏰ Создан: ${new Date(order.createdAt).toLocaleString()}

/orders - посмотреть все заказы
`;

      // Отправляем уведомление всем администраторам
      for (const adminId of this.adminIds) {
        await this.bot.telegram.sendMessage(adminId, message);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // Отправка уведомления об оплате заказа
  async notifyPaymentReceived(order) {
    try {
      const message = `
💰 Получена оплата!

🔸 Заказ #${order._id}
💎 Сумма: ${order.cryptoAmount} ${order.cryptoCurrency}
⏰ Время: ${new Date().toLocaleString()}

Нажмите для подтверждения:
/confirm_payment_${order._id}
`;

      for (const adminId of this.adminIds) {
        await this.bot.telegram.sendMessage(adminId, message);
      }
    } catch (error) {
      console.error('Error sending payment notification:', error);
    }
  }

  // Отправка уведомления пользователю о статусе заказа
  async notifyUser(userId, message) {
    try {
      await this.bot.telegram.sendMessage(userId, message);
    } catch (error) {
      console.error('Error sending user notification:', error);
    }
  }
}

module.exports = NotificationService;
