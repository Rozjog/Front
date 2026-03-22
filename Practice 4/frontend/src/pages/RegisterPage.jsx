import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    role: 'user', // По умолчанию обычный пользователь
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const { email, first_name, last_name, password, role } = formData;
      await register(email, first_name, last_name, password, role);
      setSuccess('Регистрация успешна! Сейчас вы будете перенаправлены на страницу входа.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '400px', margin: '50px auto' }}>
        <h1 className="title">Регистрация</h1>
        
        {error && (
          <div style={{ color: 'red', marginBottom: '15px' }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ color: 'green', marginBottom: '15px' }}>
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label className="label">
              Email
              <input
                type="email"
                name="email"
                className="input"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
              />
            </label>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label className="label">
              Имя
              <input
                type="text"
                name="first_name"
                className="input"
                value={formData.first_name}
                onChange={handleChange}
                required
                placeholder="Иван"
              />
            </label>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label className="label">
              Фамилия
              <input
                type="text"
                name="last_name"
                className="input"
                value={formData.last_name}
                onChange={handleChange}
                required
                placeholder="Петров"
              />
            </label>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label className="label">
              Пароль
              <input
                type="password"
                name="password"
                className="input"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="********"
              />
            </label>
          </div>
          
          {/* НОВОЕ: Выбор роли */}
          <div style={{ marginBottom: '20px' }}>
            <label className="label">
              Роль
              <select
                name="role"
                className="input"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="user">Пользователь (только просмотр)</option>
                <option value="seller">Продавец (может добавлять/редактировать товары)</option>
                <option value="admin">Администратор (полный доступ)</option>
              </select>
            </label>
          </div>
          
          <button 
            type="submit" 
            className="btn btn--primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px' }}
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        
        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
} 