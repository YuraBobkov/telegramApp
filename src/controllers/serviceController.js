const Service = require('../models/Service');

// Получить все активные сервисы
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Получить сервис по ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Сервис не найден' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Создать новый сервис (для админов)
exports.createService = async (req, res) => {
  try {
    const service = new Service(req.body);
    const newService = await service.save();
    res.status(201).json(newService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Обновить сервис
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      return res.status(404).json({ message: 'Сервис не найден' });
    }

    res.json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Удалить сервис
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Сервис не найден' });
    }

    res.json({ message: 'Сервис успешно удален' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Изменить статус активности сервиса
exports.toggleServiceStatus = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Сервис не найден' });
    }

    service.isActive = !service.isActive;
    await service.save();

    res.json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Получить все сервисы (включая неактивные) для админа
exports.getAllServicesAdmin = async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
