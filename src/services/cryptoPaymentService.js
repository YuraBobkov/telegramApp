const axios = require('axios');
const crypto = require('crypto');

class CryptoPaymentService {
  constructor() {
    this.apiKey = process.env.CRYPTO_API_KEY;
    this.apiSecret = process.env.CRYPTO_API_SECRET;
    this.baseUrl = process.env.CRYPTO_API_URL;
  }

  // Проверка транзакции в блокчейне
  async checkTransaction(txHash, currency) {
    try {
      // В реальном приложении здесь будет запрос к API блокчейна
      const response = await axios.get(`${this.baseUrl}/transactions/${txHash}`, {
        headers: this.getHeaders(),
      });

      return {
        confirmed: response.data.confirmations >= 3,
        amount: response.data.amount,
        from: response.data.from,
        to: response.data.to,
      };
    } catch (error) {
      console.error('Error checking transaction:', error);
      return null;
    }
  }

  // Проверка баланса адреса
  async checkAddressBalance(address, currency) {
    try {
      const response = await axios.get(`${this.baseUrl}/address/${address}/balance`, {
        headers: this.getHeaders(),
      });

      return {
        balance: response.data.balance,
        unconfirmed: response.data.unconfirmedBalance,
      };
    } catch (error) {
      console.error('Error checking balance:', error);
      return null;
    }
  }

  // Получение текущего курса криптовалюты
  async getExchangeRate(currency) {
    try {
      const response = await axios.get(`${this.baseUrl}/rates/${currency}/USD`, {
        headers: this.getHeaders(),
      });
      return response.data.rate;
    } catch (error) {
      console.error('Error getting exchange rate:', error);
      return null;
    }
  }

  // Генерация заголовков для API
  private getHeaders() {
    const timestamp = Date.now().toString();
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(timestamp)
      .digest('hex');

    return {
      'API-Key': this.apiKey,
      'API-Timestamp': timestamp,
      'API-Signature': signature,
    };
  }
}

module.exports = CryptoPaymentService;
