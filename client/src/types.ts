export interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  icon: string;
  isActive: boolean;
}

export interface Order {
  _id: string;
  userId: string;
  service: Service;
  amount: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  cryptoAddress: string;
  cryptoAmount: number;
  cryptoCurrency: string;
  createdAt: string;
  updatedAt: string;
}
