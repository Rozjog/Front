import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function UserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');
  
  const apiClient = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/users/${id}`);
      setUser(response.data);
      setEditForm(response.data);
    } catch (err) {
      setError('Ошибка загрузки пользователя');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      const response = await apiClient.put(`/users/${id}`, editForm);
      setUser(response.data);
      setIsEditing(false);
    } catch (err) {
      alert('Ошибка обновления пользователя');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) return;
    try {
      await apiClient.delete(`/users/${id}`);
      navigate('/users'); // После удаления возвращаемся к списку
    } catch (err) {
      alert('Ошибка удаления пользователя');
    }
  };

  if (loading) return <div className="page"><div className="container">Загрузка...</div></div>;
  if (error) return <div className="page"><div className="container">{error}</div></div>;
  if (!user) return <div className="page"><div className="container">Пользователь не найден</div></div>;

  return (
    <div className="page">
      <header className="header">
        <div className="header__inner">
          <div className="brand">Управление пользователями</div>
          <div className="header__right">
            <button className="btn" onClick={() => navigate('/users')}>
              ← Назад к списку
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {isEditing ? (
            // Режим редактирования
            <div className="user-edit">
              <h1>Редактирование пользователя</h1>
              <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <label className="label">
                  Email
                  <input
                    className="input"
                    name="email"
                    type="email"
                    value={editForm.email || ''}
                    onChange={handleChange}
                    required
                  />
                </label>
                
                <label className="label">
                  Имя
                  <input
                    className="input"
                    name="first_name"
                    value={editForm.first_name || ''}
                    onChange={handleChange}
                    required
                  />
                </label>
                
                <label className="label">
                  Фамилия
                  <input
                    className="input"
                    name="last_name"
                    value={editForm.last_name || ''}
                    onChange={handleChange}
                    required
                  />
                </label>
                
                <label className="label">
                  Роль
                  <select
                    className="input"
                    name="role"
                    value={editForm.role || 'user'}
                    onChange={handleChange}
                  >
                    <option value="user">Пользователь</option>
                    <option value="seller">Продавец</option>
                    <option value="admin">Администратор</option>
                  </select>
                </label>
                
                <div className="modal__footer">
                  <button type="button" className="btn" onClick={() => setIsEditing(false)}>
                    Отмена
                  </button>
                  <button type="submit" className="btn btn--primary">
                    Сохранить
                  </button>
                </div>
              </form>
            </div>
          ) : (
            // Режим просмотра
            <div className="user-detail">
              <h1 className="title">Профиль пользователя</h1>
              
              <div className="user-info">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Имя:</strong> {user.first_name} {user.last_name}</p>
                <p><strong>Роль:</strong> 
                  <span className={`role-badge role-${user.role}`}>
                    {user.role === 'admin' && '👑 '}
                    {user.role === 'seller' && '🛒 '}
                    {user.role}
                  </span>
                </p>
              </div>
              
              <div className="user-actions" style={{ marginTop: '20px' }}>
                <button className="btn btn--primary" onClick={handleEdit}>
                  Редактировать
                </button>
                <button className="btn btn--danger" onClick={handleDelete}>
                  Удалить пользователя
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}