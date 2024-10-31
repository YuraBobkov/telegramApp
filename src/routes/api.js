const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const orderController = require('../controllers/orderController');
const adminAuth = require('../middleware/adminAuth');
const transactionController = require('../controllers/transactionController');
const paymentController = require('../controllers/paymentController');

// Публичные роуты для сервисов
router.get('/services', serviceController.getServices);
router.get('/services/:id', serviceController.getServiceById);

// Админские роуты для управления сервисами
router.get('/admin/services', adminAuth, serviceController.getAllServicesAdmin);
router.post('/admin/services', adminAuth, serviceController.createService);
router.put('/admin/services/:id', adminAuth, serviceController.updateService);
router.delete('/admin/services/:id', adminAuth, serviceController.deleteService);
router.patch('/admin/services/:id/toggle', adminAuth, serviceController.toggleServiceStatus);

// Роуты для заказов
router.post('/orders', orderController.createOrder);
router.get('/orders/user/:userId', orderController.getUserOrders);
router.patch('/orders/:id/status', orderController.updateOrderStatus);

// Роуты для транзакций
router.get('/transactions/order/:orderId', transactionController.getOrderTransactions);
router.get('/transactions/stats', adminAuth, transactionController.getTransactionStats);
router.get('/transactions/:txHash/:currency/status', transactionController.checkTransactionStatus);

// Роуты для проверки платежей
router.get('/payments/:orderId/status', paymentController.checkPaymentStatus);
router.get('/payments/:orderId/details', paymentController.getPaymentDetails);

module.exports = router;
