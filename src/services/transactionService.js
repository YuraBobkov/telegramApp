const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const CryptoPaymentService = require('./cryptoPaymentService');
const NotificationService = require('./notificationService');

class TransactionService {
  constructor(bot) {
    this.cryptoService = new CryptoPaymentService();
    this.notificationService = new NotificationService(bot);
  }

  // Создание новой транзакции
  async createTransaction(orderData) {
    try {
      const transaction = new Transaction({
        order: orderData.orderId,
        txHash: orderData.txHash,
        amount: orderData.amount,
        currency: orderData.currency,
        senderAddress: orderData.from,
        receiverAddress: orderData.to,
      });

      await transaction.save();
      return transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  // Обновление статуса транзакции
  async updateTransactionStatus(txHash, status, confirmations) {
    try {
      const transaction = await Transaction.findOneAndUpdate(
        { txHash },
        { status, confirmations },
        { new: true },
      ).populate({
        path: 'order',
        populate: { path: 'service' },
      });

      if (!transaction) return null;

      // Если транзакция подтверждена, обновляем статус заказа
      if (status === 'confirmed' && confirmations >= 3) {
        await Order.findByIdAndUpdate(transaction.order._id, { status: 'paid' });
        await this.notificationService.notifyPaymentReceived(transaction.order);
      }

      return transaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  // Получение истории транзакций для заказа
  async getOrderTransactions(orderId) {
    try {
      return await Transaction.find({ order: orderId }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting order transactions:', error);
      throw error;
    }
  }

  // Получение статистики транзакций
  async getTransactionStats(startDate, endDate) {
    try {
      const stats = await Transaction.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            currencies: { $addToSet: '$currency' },
          },
        },
      ]);

      const volumeByCurrency = await Transaction.aggregate([
        {
          $match: {
            status: 'confirmed',
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
          },
        },
        {
          $group: {
            _id: '$currency',
            volume: { $sum: '$amount' },
          },
        },
      ]);

      return {
        stats,
        volumeByCurrency,
      };
    } catch (error) {
      console.error('Error getting transaction stats:', error);
      throw error;
    }
  }

  // Проверка статуса транзакции в блокчейне
  async checkTransactionStatus(txHash, currency) {
    try {
      const txStatus = await this.cryptoService.checkTransaction(txHash, currency);
      if (!txStatus) return null;

      await this.updateTransactionStatus(
        txHash,
        txStatus.confirmed ? 'confirmed' : 'pending',
        txStatus.confirmations,
      );

      return txStatus;
    } catch (error) {
      console.error('Error checking transaction status:', error);
      throw error;
    }
  }
}

module.exports = TransactionService;
