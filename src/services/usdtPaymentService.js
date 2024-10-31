const axios = require('axios');
const crypto = require('crypto');

class UsdtPaymentService {
  constructor() {
    this.apiKey = process.env.TRON_API_KEY;
    this.network = process.env.USDT_NETWORK || 'TRC20'; // TRC20 сеть для USDT
    this.baseUrl = process.env.TRON_API_URL;
  }

  // Проверка баланса USDT адреса
  async checkBalance(address) {
    try {
      const response = await axios.get(`${this.baseUrl}/account/${address}`, {
        headers: { 'TRON-PRO-API-KEY': this.apiKey },
      });

      // Ищем USDT токен в списке токенов аккаунта
      const usdtBalance = response.data.trc20.find(
        (token) => token.contract_address === process.env.USDT_CONTRACT_ADDRESS,
      );

      return {
        balance: usdtBalance ? parseFloat(usdtBalance.balance) / 1e6 : 0, // Конвертируем из 6 десятичных знаков
        address,
      };
    } catch (error) {
      console.error('Error checking USDT balance:', error);
      throw error;
    }
  }

  // Проверка транзакции USDT
  async checkTransaction(txHash) {
    try {
      const response = await axios.get(`${this.baseUrl}/transaction/${txHash}`, {
        headers: { 'TRON-PRO-API-KEY': this.apiKey },
      });

      const transaction = response.data;
      return {
        confirmed: transaction.ret[0].contractRet === 'SUCCESS',
        amount: parseFloat(transaction.trigger_info.parameter.amount) / 1e6,
        from: transaction.trigger_info.parameter.from_address,
        to: transaction.trigger_info.parameter.to_address,
        timestamp: transaction.block_timestamp,
        contract: transaction.trigger_info.contract_address,
      };
    } catch (error) {
      console.error('Error checking USDT transaction:', error);
      throw error;
    }
  }

  // Генерация нового адреса для оплаты
  async generatePaymentAddress() {
    // В реальном приложении здесь должна быть интеграция с вашим кошельком
    // для генерации нового адреса. Сейчас возвращаем заглушку
    return process.env.USDT_WALLET_ADDRESS;
  }

  // Расчет суммы в USDT
  async calculateUsdtAmount(usdAmount) {
    // Для USDT обычно 1:1 к USD, но можно добавить комиссию
    const fee = 0.01; // 1% комиссия
    return (usdAmount * (1 + fee)).toFixed(2);
  }
}

module.exports = UsdtPaymentService;
