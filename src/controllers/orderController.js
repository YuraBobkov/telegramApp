const Order = require('../models/Order');
const Service = require('../models/Service');
const CryptoService = require('../services/cryptoService');
const NotificationService = require('../services/notificationService');

const cryptoService = new CryptoService();
const notificationService = new NotificationService(require('../bot'));

// Создать новый заказ
exports.createOrder = async (req, res) => {
  try {
    const { userId, serviceId, cryptoCurrency } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Сервис не найден' });
    }

    // Генерируем адрес и рассчитываем сумму в криптовалюте
    const cryptoAddress = await cryptoService.generatePaymentAddress(cryptoCurrency);
    const cryptoAmount = await cryptoService.calculateCryptoAmount(service.price, cryptoCurrency);

    const order = new Order({
      userId,
      service: serviceId,
      amount: service.price,
      cryptoAddress,
      cryptoAmount,
      cryptoCurrency,
    });

    const newOrder = await order.save();
    const populatedOrder = await Order.findById(newOrder._id).populate('service');

    // Уведомляем админов о новом заказе
    await notificationService.notifyNewOrder(populatedOrder);

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({ message: error.message });
  }
};

// Получить заказы пользователя
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate('service')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Обновить статус заказа
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate(
      'service',
    );

    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    // Отправляем уведомление пользователю в зависимости от статуса
    let userMessage = '';
    switch (status) {
      case 'completed':
        userMessage = `✅ Ваш заказ #${order._id} выполнен!\n\nСервис: ${order.service.name}\nСпасибо за использование нашего сервиса!`;
        break;
      case 'cancelled':
        userMessage = `❌ Ваш заказ #${order._id} отменен.\n\nПожалуйста, свяжитесь с поддержкой для получения дополнительной информации.`;
        break;
      case 'paid':
        userMessage = `💰 Оплата получена для заказа #${order._id}!\n\nМы начинаем обработку вашего заказа.`;
        // Уведомляем админов о получении оплаты
        await notificationService.notifyPaymentReceived(order);
        break;
    }

    if (userMessage) {
      await notificationService.notifyUser(order.userId, userMessage);
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
