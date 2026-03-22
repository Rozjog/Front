const { nanoid } = require('nanoid');

let users = [];

// Создаем админа и продавца при старте
const createInitialUsers = () => {
  const bcrypt = require('bcrypt');
  
  // Админ
  if (!users.some(u => u.role === 'admin')) {
    users.push({
      id: nanoid(6),
      email: 'admin@mail.com',
      first_name: 'Admin',
      last_name: 'Adminov',
      hashedPassword: bcrypt.hashSync('admin123', 10),
      role: 'admin'
    });
  }
  
  // Продавец (может создавать/редактировать товары)
  if (!users.some(u => u.role === 'seller')) {
    users.push({
      id: nanoid(6),
      email: 'seller@mail.com',
      first_name: 'Seller',
      last_name: 'Sellerov',
      hashedPassword: bcrypt.hashSync('seller123', 10),
      role: 'seller'
    });
  }
  
  // Обычный пользователь (только просмотр)
  if (!users.some(u => u.role === 'user')) {
    users.push({
      id: nanoid(6),
      email: 'user@mail.com',
      first_name: 'User',
      last_name: 'Userov',
      hashedPassword: bcrypt.hashSync('user123', 10),
      role: 'user'
    });
  }

};

module.exports = {
  findByEmail: (email) => {
    return users.find(user => user.email === email);
  },
  
  findById: (id) => {
    return users.find(user => user.id === id);
  },
  
  create: (userData) => {
    const newUser = {
      id: nanoid(6),
      role: 'user', // По умолчанию обычный пользователь
      ...userData
    };
    users.push(newUser);
    return newUser;
  },
  
  getAll: () => {
    return users.map(user => ({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role
    }));
  },
  
  update: (id, updates) => {
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      return users[index];
    }
    return null;
  },
  
  delete: (id) => {
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      const deleted = users[index];
      users.splice(index, 1);
      return deleted;
    }
    return null;
  }
};

// Запускаем создание начальных пользователей
createInitialUsers();