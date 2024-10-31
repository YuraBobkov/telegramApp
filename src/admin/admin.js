const ADMIN_TOKEN = localStorage.getItem('adminToken');
const API_URL = 'http://localhost:3000/api';

// Проверка авторизации
if (!ADMIN_TOKEN) {
  const token = prompt('Введите админский токен:');
  if (token) {
    localStorage.setItem('adminToken', token);
    location.reload();
  } else {
    alert('Доступ запрещен');
    window.location.href = '/';
  }
}

// Функция для выполнения API запросов
async function fetchAPI(endpoint, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'admin-token': ADMIN_TOKEN,
    },
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    alert('Произошла ошибка при выполнении запроса');
    throw error;
  }
}

// Загрузка списка сервисов
async function loadServices() {
  const services = await fetchAPI('/admin/services');
  const servicesList = document.getElementById('servicesList');
  servicesList.innerHTML = '';

  services.forEach((service) => {
    const serviceElement = document.createElement('div');
    serviceElement.className = `service-card ${service.isActive ? '' : 'inactive'}`;
    serviceElement.innerHTML = `
            <div class="service-info">
                <h3>${service.name}</h3>
                <p>${service.description}</p>
                <p>Цена: ${service.price}</p>
                <p>Категория: ${service.category}</p>
            </div>
            <div class="service-actions">
                <button onclick="toggleService('${service._id}')" class="btn-toggle">
                    ${service.isActive ? 'Деактивировать' : 'Активировать'}
                </button>
                <button onclick="deleteService('${
                  service._id
                }')" class="btn-delete">Удалить</button>
            </div>
        `;
    servicesList.appendChild(serviceElement);
  });
}

// Создание нового сервиса
document.getElementById('serviceForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    name: document.getElementById('name').value,
    description: document.getElementById('description').value,
    price: Number(document.getElementById('price').value),
    category: document.getElementById('category').value,
    icon: document.getElementById('icon').value,
    isActive: true,
  };

  await fetchAPI('/admin/services', {
    method: 'POST',
    body: JSON.stringify(formData),
  });

  e.target.reset();
  loadServices();
});

// Переключение статуса сервиса
async function toggleService(id) {
  await fetchAPI(`/admin/services/${id}/toggle`, {
    method: 'PATCH',
  });
  loadServices();
}

// Удаление сервиса
async function deleteService(id) {
  if (confirm('Вы уверены, что хотите удалить этот сервис?')) {
    await fetchAPI(`/admin/services/${id}`, {
      method: 'DELETE',
    });
    loadServices();
  }
}

// Загружаем сервисы при загрузке страницы
loadServices();
