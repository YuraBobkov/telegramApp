const Service = require('../models/Service');
const Order = require('../models/Order');

// Список админских ID (в реальном приложении лучше хранить в базе данных)
const ADMIN_IDS = process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(',') : [];

// Проверка на админа
const isAdmin = (ctx) => ADMIN_IDS.includes(ctx.from.id.toString());

// Административные команды
const adminCommands = (bot) => {
  // Добавить новый сервис
  bot.command('add_service', async (ctx) => {
    if (!isAdmin(ctx)) {
      return ctx.reply('У вас нет прав для выполнения этой команды');
    }

    try {
      const args = ctx.message.text.split('\n');
      if (args.length < 5) {
        return ctx.reply(
          'Используйте формат:\n/add_service\nНазвание\nОписание\nЦена\nКатегория\nURL иконки',
        );
      }

      const [_, name, description, price, category, icon] = args;

      const service = new Service({
        name,
        description,
        price: Number(price),
        category,
        icon: icon || 'default-icon-url',
        isActive: true,
      });

      await service.save();
      ctx.reply('Сервис успешно добавлен! ✅');
    } catch (error) {
      console.error('Error in add_service:', error);
      ctx.reply('Ошибка при добавлении сервиса');
    }
  });

  // Получить статистику
  bot.command('stats', async (ctx) => {
    if (!isAdmin(ctx)) {
      return ctx.reply('У вас нет прав для выполнения этой команды');
    }

    try {
      const totalServices = await Service.countDocuments();
      const activeServices = await Service.countDocuments({ isActive: true });
      const totalOrders = await Order.countDocuments();
      const pendingOrders = await Order.countDocuments({ status: 'pending' });
      const completedOrders = await Order.countDocuments({ status: 'completed' });

      const message = `
📊 Статистика:

Сервисы:
- Всего: ${totalServices}
- Активных: ${activeServices}

Заказы:
- Всего: ${totalOrders}
- В ожидании: ${pendingOrders}
- Выполнено: ${completedOrders}
`;

      ctx.reply(message);
    } catch (error) {
      console.error('Error in stats:', error);
      ctx.reply('Ошибка при получении статистики');
    }
  });

  // Управление заказами
  bot.command('orders', async (ctx) => {
    if (!isAdmin(ctx)) {
      return ctx.reply('У вас нет прав для выполнения этой команды');
    }

    try {
      const pendingOrders = await Order.find({ status: 'pending' }).populate('service').limit(5);

      if (!pendingOrders.length) {
        return ctx.reply('Нет заказов в ожидании');
      }

      for (const order of pendingOrders) {
        const message = `
🔸 Заказ #${order._id}
📦 Сервис: ${order.service.name}
💰 Сумма: $${order.amount}
💎 Крипто: ${order.cryptoAmount} ${order.cryptoCurrency}
👤 ID пользователя: ${order.userId}
⏰ Создан: ${new Date(order.createdAt).toLocaleString()}
`;

        await ctx.reply(message, {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '✅ Подтвердить',
                  callback_data: `complete_order:${order._id}`,
                },
                {
                  text: '❌ Отменить',
                  callback_data: `cancel_order:${order._id}`,
                },
              ],
            ],
          },
        });
      }
    } catch (error) {
      console.error('Error in orders:', error);
      ctx.reply('Ошибка при получении списка заказов');
    }
  });

  // Обработка кнопок управления заказами
  bot.action(/complete_order:(.+)/, async (ctx) => {
    if (!isAdmin(ctx)) return;

    const orderId = ctx.match[1];
    try {
      const order = await Order.findByIdAndUpdate(orderId, { status: 'completed' }, { new: true });

      if (order) {
        // Уведомляем пользователя о выполнении заказа
        await bot.telegram.sendMessage(
          order.userId,
          `✅ Ваш заказ #${order._id} выполнен!\nСпасибо за использование нашего сервиса!`,
        );
        await ctx.editMessageText('Заказ успешно выполнен ✅');
      }
    } catch (error) {
      console.error('Error completing order:', error);
      ctx.reply('Ошибка при выполнении заказа');
    }
  });

  bot.action(/cancel_order:(.+)/, async (ctx) => {
    if (!isAdmin(ctx)) return;

    const orderId = ctx.match[1];
    try {
      const order = await Order.findByIdAndUpdate(orderId, { status: 'cancelled' }, { new: true });

      if (order) {
        // Уведомляем пользователя об отмене заказа
        await bot.telegram.sendMessage(
          order.userId,
          `❌ Ваш заказ #${order._id} отменен.\nПожалуйста, свяжитесь с поддержкой для получения дополнительной информации.`,
        );
        await ctx.editMessageText('Заказ отменен ❌');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      ctx.reply('Ошибка при отмене заказа');
    }
  });
};

module.exports = adminCommands;
