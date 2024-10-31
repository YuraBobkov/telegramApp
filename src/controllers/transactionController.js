const TransactionService = require('../services/transactionService');
const bot = require('../bot');

const transactionService = new TransactionService(bot);

exports.getOrderTransactions = async (req, res) => {
  try {
    const transactions = await transactionService.getOrderTransactions(req.params.orderId);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTransactionStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await transactionService.getTransactionStats(startDate, endDate);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkTransactionStatus = async (req, res) => {
  try {
    const { txHash, currency } = req.params;
    const status = await transactionService.checkTransactionStatus(txHash, currency);
    if (!status) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(status);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
