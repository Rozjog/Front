import axios from "axios";

// Создаем клиент
const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
    "accept": "application/json",
  }
});

// Автоматически добавляет токен к каждому запросу
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Автоматически обновляет токен, если он истек
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Если ошибка 401 и это не повторный запрос
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Пробуем обновить токен
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          // Нет refresh-токена - выкидываем на логин
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        // Отправляем запрос на обновление
        const response = await axios.post('http://localhost:3000/api/auth/refresh', {
          refreshToken
        });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // Сохраняем новые токены
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Повторяем оригинальный запрос с новым токеном
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        // Не удалось обновить - выкидываем на логин
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// ========== МЕТОДЫ ДЛЯ РАБОТЫ С ТОВАРАМИ ==========
export const api = {
  // Получить все товары (открытый маршрут)
  getProducts: async () => {
    const response = await apiClient.get("/products");
    return response.data;
  },
  
  // Получить товар по ID (защищенный)
  getProductById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },
  
  // Создать товар (защищенный)
  createProduct: async (product) => {
    const response = await apiClient.post("/products", product);
    return response.data;
  },
  
  // Обновить товар (защищенный)
updateProduct: async (id, product) => {
  console.log("PUT запрос на /products/"+id, product); // ← ДОБАВЬТЕ
  const response = await apiClient.put(`/products/${id}`, product);
  return response.data;
},
  
  // Удалить товар (защищенный)
  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  }
};