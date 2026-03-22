import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const register = async (email, first_name, last_name, password, role = 'user') => {
  try {
    const response = await apiClient.post('/auth/register', {
      email,
      first_name,
      last_name,
      password,
      role,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Ошибка регистрации');
  }
};

export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

export const getMe = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('Не авторизован');
    }
    
    const response = await apiClient.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (response.data.role) {
      localStorage.setItem('userRole', response.data.role);
    }
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Ошибка получения данных');
  }
};

// Получить роль текущего пользователя
export const getUserRole = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.role;
    } catch {
      return null;
    }
  }
  return null;
};

// При входе сохраняем и роль
export const login = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    
    const { accessToken, refreshToken, user } = response.data;
    
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return { user };
  } catch (error) {
    throw error.response?.data || { error: 'Ошибка входа' };
  }
};