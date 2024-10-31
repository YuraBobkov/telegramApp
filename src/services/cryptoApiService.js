const axios = require('axios');
const crypto = require('crypto');

class CryptoApiService {
  constructor() {
    this.providers = {
      BTC: {
        api: process.env.BTC_API_URL,
        key: process.env.BTC_API_KEY,
        secret: process.env.BTC_API_SECRET
      },
      ETH: {
        api: process.env.ETH_API_URL,
        key: process.env.ETH_API_KEY,
        secret: process.env.ETH_API_SECRET
      },
      USDT: {
        api: process.env.USDT_API_URL,
        key: process.env.USDT_API_KEY,
        secret: process.env.USDT_API_SECRET
      }
    };
  }

  // Проверка баланса адреса для разных криптовалют
  async checkBalance(address, currency) {
    const provider = this.providers[currency];
    if (!provider) throw new Error(`Unsupported currency: ${currency}`);

    try {
      const endpoint = `${provider.api}/address/${address}/balance`;
      const headers = this.getHeaders(provider);

      const response = await axios.get(endpoint, { headers });
      return {
        confirmed: response.data.confirmed,
        unconfirmed: response.data.unconfirmed,
        total: response.data.total
      };
    } catch (error) {
      console.error(`Error checking ${currency} balance:`, error);
      throw error;
    }
  }

  // Получение информации о транзакции
  async getTransaction(txHash, currency) {
    const provider = this.providers[currency];
    if (!provider) throw new Error(`Unsupported currency: ${currency}`);

    try {
      const endpoint = `${provider.api}/tx/${txHash}`;
      const headers = this.getHeaders(provider);

      const response = await axios.get(endpoint, { headers });
      return {
        confirmed: response.data.confirmations >= this.getMinConfirmations(currency),
        amount: response.data.amount,
        fee: response.data.fee,
        from: response.data.from,
        to: response.data.to,
        confirmations: response.data.confirmations
      };
    } catch (error) {
      console.error(`Error getting ${currency} transaction:`, error);
      throw error;
    }
  }

  // Получение текущего курса криптовалюты
  async getExchangeRate(currency) {
    try {
      const response = await axios.get(
        `${process.env.EXCHANGE_API_URL}/v1/rates/${currency}/USD`
      );
      return response.data.rate;
    } catch (error) {
      console.error(`Error getting ${currency} exchange rate:`, error);
      throw error;
    }
  }

  // Генерация заголовков для API запросов
  private getHeaders(provider) {
    const timestamp = Date.now().toString();
    const signature = crypto
      .createHmac('sha256', provider.secret)
      .update(timestamp)
      .digest('hex');

    return {
      'API-Key': provider.key,
      'API-Timestamp': timestamp,
      'API-Signature': signature
    };
  }

  // Получение минимального количества подтверждений для разных криптовалют
  private getMinConfirmations(currency) {
    const confirmations = {
      BTC: 3,
      ETH: 12,
      USDT: 6
    };
    return confirmations[currency] || 3;
  }
}

module.exports = CryptoApiService;
