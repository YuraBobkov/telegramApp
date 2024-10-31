const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');
const adminCommands = require('./adminCommands');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Конфигурация веб-приложения
const webAppUrl = process.env.WEBAPP_URL || 'https://your-webapp-url.com';

// Добавляем админские команды
adminCommands(bot);

// Обработка команды /start
bot.command('start', async (ctx) => {
  try {
    await ctx.reply('Добро пожаловать в сервис оплаты! 🚀', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Открыть каталог сервисов',
              web_app: { url: webAppUrl },
            },
          ],
        ],
      },
    });
  } catch (error) {
    console.error('Error in start command:', error);
    ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
  }
});

// Обработка команды /help
bot.command('help', async (ctx) => {
  const isAdmin = process.env.ADMIN_IDS?.split(',').includes(ctx.from.id.toString());

  let helpText = `
🔹 Доступные команды:
/start - Запустить бота
/services - Показать доступные сервисы
/orders - Показать ваши заказы
/help - Показать это сообщение

По всем вопросам обращайтесь к @admin_username
  `;

  if (isAdmin) {
    helpText += `
👑 Админские команды:
/add_service - Добавить новый сервис
/stats - Показать статистику
/orders - Управление заказами
    `;
  }

  await ctx.reply(helpText);
});

// Обработка команды /services
bot.command('services', async (ctx) => {
  try {
    const services = await fetch(`${process.env.API_URL}/api/services`).then((res) => res.json());

    if (!services.length) {
      return ctx.reply('В данный момент нет доступных сервисов.');
    }

    const servicesMessage = services
      .map((service) => `🔸 ${service.name}\nЦена: $${service.price}\n${service.description}\n`)
      .join('\n');

    await ctx.reply(servicesMessage, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Открыть каталог',
              web_app: { url: webAppUrl },
            },
          ],
        ],
      },
    });
  } catch (error) {
    console.error('Error in services command:', error);
    ctx.reply('Не удалось загрузить список сервисов. Попробуйте позже.');
  }
});

// Обработка данных из веб-приложения
bot.on('web_app_data', async (ctx) => {
  try {
    const data = JSON.parse(ctx.webAppData.data);

    if (data.type === 'order_init') {
      // Отправляем сообщение с подтверждением заказа
      await ctx.reply(
        `Подтвердите заказ:

📦 Сервис: ${data.serviceName}
💰 Цена: $${data.price}

Выберите криптовалюту для оплаты:`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: 'USDT', callback_data: `crypto_select:${data.serviceId}:USDT` },
                { text: 'BTC', callback_data: `crypto_select:${data.serviceId}:BTC` },
                { text: 'ETH', callback_data: `crypto_select:${data.serviceId}:ETH` },
              ],
            ],
          },
        },
      );
    }
  } catch (error) {
    console.error('Error processing web app data:', error);
    ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
});

// Обработка выбора криптовалюты
bot.action(/crypto_select:(.+):(.+)/, async (ctx) => {
  try {
    const [serviceId, cryptoCurrency] = ctx.match.slice(1);

    // Создаем заказ
    const order = await fetch(`${process.env.API_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: ctx.from.id.toString(),
        serviceId,
        cryptoCurrency,
      }),
    }).then((res) => res.json());

    // Отправляем информацию об оплате
    await ctx.editMessageText(
      `🎉 Заказ #${order._id} создан!

📦 Сервис: ${order.service.name}
💰 Сумма: $${order.amount}
💎 К оплате: ${order.cryptoAmount} ${order.cryptoCurrency}

Отправьте указанную сумму на адрес:
\`${order.cryptoAddress}\`

⚠️ Важно: отправляйте точную сумму, иначе платеж может не пройти автоматически`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '✅ Я оплатил', callback_data: `check_payment:${order._id}` }],
          ],
        },
      },
    );
  } catch (error) {
    console.error('Error processing crypto selection:', error);
    ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
});

// Проверка оплаты
bot.action(/check_payment:(.+)/, async (ctx) => {
  const orderId = ctx.match[1];
  await ctx.reply(
    'Мы проверяем ваш платеж. Это может занять несколько минут. Мы уведомим вас, как только платеж будет подтвержден.',
  );
});

// Обработка ошибок
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
  ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
});

module.exports = bot;
