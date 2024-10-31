const UsdtPaymentService = require('../services/usdtPaymentService');
const Order = require('../models/Order');
const NotificationService = require('../services/notificationService');
const bot = require('../bot');

const usdtService = new UsdtPaymentService();
const notificationService = new NotificationService(bot);

exports.checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('service');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const balance = await usdtService.checkBalance(order.cryptoAddress);

    if (balance.balance >= order.cryptoAmount) {
      // Если получена нужная сумма, обновляем статус
      order.status = 'paid';
      await order.save();

      // Отправляем уведомления
      await notificationService.notifyPaymentReceived(order);
      await notificationService.notifyUser(
        order.userId,
        `✅ Оплата подтверждена для заказа #${order._id}!\nМы начинаем обработку ваш��го заказа.`,
      );

      return res.json({
        status: 'success',
        message: 'Payment received',
        order: {
          id: order._id,
          status: order.status,
          receivedAmount: balance.balance,
        },
      });
    }

    // Если оплата еще не получена
    res.json({
      status: 'pending',
      message: 'Waiting for payment',
      order: {
        id: order._id,
        status: order.status,
        expectedAmount: order.cryptoAmount,
        receivedAmount: balance.balance,
        remainingAmount: (order.cryptoAmount - balance.balance).toFixed(2),
      },
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ message: 'Error checking payment status' });
  }
};

exports.getPaymentDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('service');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      orderId: order._id,
      service: order.service.name,
      amount: order.amount,
      cryptoAmount: order.cryptoAmount,
      cryptoAddress: order.cryptoAddress,
      status: order.status,
      createdAt: order.createdAt,
    });
  } catch (error) {
    console.error('Error getting payment details:', error);
    res.status(500).json({ message: 'Error getting payment details' });
  }
};
