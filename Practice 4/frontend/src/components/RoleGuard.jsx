import React from 'react';
import { getUserRole } from '../api/auth';

// Компонент для защиты по ролям
export default function RoleGuard({ children, allowedRoles }) {
  const userRole = getUserRole();
  
  // Проверяем, есть ли роль пользователя в списке разрешенных
  if (!allowedRoles.includes(userRole)) {
    // Если нет - показываем сообщение или редиректим
    return (
      <div className="page">
        <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2>Доступ запрещен</h2>
          <p>У вас нет прав для просмотра этой страницы.</p>
          <p>Ваша роль: {userRole}</p>
          <p>Требуется роль: {allowedRoles.join(' или ')}</p>
          <button 
            className="btn btn--primary" 
            onClick={() => window.history.back()}
            style={{ marginTop: '20px' }}
          >
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }
  
  // Если всё ок - показываем дочерний компонент
  return children;
}