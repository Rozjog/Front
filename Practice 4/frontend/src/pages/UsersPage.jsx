import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getUserRole } from '../api/auth';
import { useNavigate } from 'react-router-dom'; 

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const navigate = useNavigate();
    const userRole = getUserRole();
    const token = localStorage.getItem('accessToken');

    // 1. Создаем apiClient через useMemo или выносим наружу
    const apiClient = React.useMemo(() => 
        axios.create({
            baseURL: 'http://localhost:3000/api',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }), [token] // Пересоздаем только при изменении токена
    );

    // 2. Правильно оборачиваем loadUsers в useCallback
    const loadUsers = useCallback(async () => {
        // Проверяем, что пользователь - админ
        if (userRole !== 'admin') {
            navigate('/');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const response = await apiClient.get('/users');
            setUsers(response.data);
        } catch (err) {
            console.error('Ошибка загрузки пользователей:', err);
            
            if (err.response?.status === 403) {
                setError('У вас нет прав для просмотра пользователей');
                setTimeout(() => navigate('/'), 3000);
            } else {
                setError('Ошибка загрузки пользователей: ' + (err.response?.data?.error || err.message));
            }
        } finally {
            setLoading(false);
        }
    }, [apiClient, userRole, navigate]); // Добавляем все зависимости

    // 3. Правильный useEffect с зависимостями
    useEffect(() => {
        loadUsers();
    }, [loadUsers]); // Зависимость от loadUsers

    const handleRoleChange = async (userId, newRole) => {
        try {
            await apiClient.put(`/users/${userId}`, { role: newRole });
            await loadUsers(); // Ждем перезагрузки
            setEditingUser(null);
        } catch (err) {
            console.error('Ошибка обновления роли:', err);
            alert('Ошибка обновления роли: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            return;
        }

        try {
            await apiClient.delete(`/users/${userId}`);
            await loadUsers(); // Ждем перезагрузки
        } catch (err) {
            console.error('Ошибка удаления пользователя:', err);
            alert('Ошибка удаления пользователя: ' + (err.response?.data?.error || err.message));
        }
    };

    // Проверка прав доступа
    if (userRole !== 'admin') {
        return (
            <div className="page">
                <div className="container">
                    <h2>Доступ запрещен</h2>
                    <p>Только администратор может управлять пользователями.</p>
                    <button 
                        className="btn" 
                        onClick={() => navigate('/')}
                        style={{ marginTop: '20px' }}
                    >
                        На главную
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <header className="header">
                <div className="header__inner">
                    <div className="brand">Управление пользователями</div>
                    <div className="header__right">
                        Роль: {userRole}
                        <button
                            className="btn"
                            onClick={() => navigate(-1)}
                            style={{ marginLeft: '10px' }}
                        >
                            Назад
                        </button>
                    </div>
                </div>
            </header>

            <main className="main">
                <div className="container">
                    <h1 className="title">Пользователи</h1>

                    {loading && <div className="empty">Загрузка...</div>}
                    
                    {error && (
                        <div className="empty" style={{ color: 'red', padding: '20px' }}>
                            {error}
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="list">
                            {users.length === 0 ? (
                                <div className="empty">Нет пользователей</div>
                            ) : (
                                users.map(user => (
                                    <div
                                        key={user.id}
                                        className="userRow"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div 
                                            className="userMain"
                                            onClick={() => navigate(`/users/${user.id}`)}
                                        >
                                            <div className="userName">{user.first_name} {user.last_name}</div>
                                            <div className="userEmail">{user.email}</div>
                                            <div className="userRole">
                                                {editingUser === user.id ? (
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                        onBlur={() => setEditingUser(null)}
                                                        autoFocus
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <option value="user">Пользователь</option>
                                                        <option value="seller">Продавец</option>
                                                        <option value="admin">Администратор</option>
                                                    </select>
                                                ) : (
                                                    <span
                                                        className={`role-badge role-${user.role}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingUser(user.id);
                                                        }}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        {user.role === 'admin'}
                                                        {user.role === 'seller'}
                                                        {user.role}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="userActions">
                                            <button
                                                className="btn btn--danger"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteUser(user.id);
                                                }}
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}