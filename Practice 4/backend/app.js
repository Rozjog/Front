const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Подключаем Swagger 
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const userStorage = require('./users');

const app = express();
const port = 3000;

const JWT_SECRET = 'my_super_secret_key_2026';
const REFRESH_SECRET = 'my_refresh_super_secret_key_2026';

const ACCESS_EXPIRES_IN = '5s';
const REFRESH_EXPIRES_IN = '7d'; 

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:3001" }));

let refreshTokens = new Set();

// Функция генерации access-токена
function generateAccessToken(user) {
  return jwt.sign(
    { 
      sub: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );
}

// Функция генерации refresh-токена
function generateRefreshToken(user) {
  return jwt.sign(
    { 
      sub: user.id,
      email: user.email,
      role: user.role
    },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );
}

// Логирование
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
  });
  next();
});

// Функция для хеширования пароля
async function hashPassword(password) {
  const rounds = 10; // стандартное значение
  return bcrypt.hash(password, rounds);
}

// Функция для проверки пароля
async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

// Данные спортивного магазина
let products = [
  { id: nanoid(6), name: 'Футбольный мяч', category: 'Футбол', description: 'Профессиональный мяч размер 5', price: 3500, stock: 25, image: '/images/ball.jpg' },
  { id: nanoid(6), name: 'Кроссовки для бега', category: 'Бег', description: 'Легкие кроссовки с амортизацией', price: 8500, stock: 15, image: '/images/snikers.webp' },
  { id: nanoid(6), name: 'Теннисная ракетка', category: 'Теннис', description: 'Карбоновая ракетка', price: 6200, stock: 8, image: '/images/tennis.webp' },
  { id: nanoid(6), name: 'Гантели 5 кг', category: 'Фитнес', description: 'Резиновые гантели, комплект 2 шт', price: 2800, stock: 30, image: '/images/dumbbell.webp' },
  { id: nanoid(6), name: 'Велосипед горный', category: 'Велоспорт', description: '26 дюймов, 21 скорость', price: 28500, stock: 5, image: '/images/bike.webp' },
  { id: nanoid(6), name: 'Баскетбольный мяч', category: 'Баскетбол', description: 'Официальный размер 7', price: 3200, stock: 18, image: '/images/basketball.webp' },
  { id: nanoid(6), name: 'Коврик для йоги', category: 'Йога', description: 'Противоскользящий, 6 мм', price: 1900, stock: 22, image: '/images/carpet.webp' },
  { id: nanoid(6), name: 'Шлем для скейтборда', category: 'Скейтбординг', description: 'Регулируемый, защита от ударов', price: 4300, stock: 12, image: '/images/hat.jpg' },
  { id: nanoid(6), name: 'Лыжи беговые', category: 'Лыжи', description: 'Классические, длина 190 см', price: 8900, stock: 7, image: '/images/ski.webp' },
  { id: nanoid(6), name: 'Скакалка', category: 'Фитнес', description: 'Скоростная, с подсчетом калорий', price: 650, stock: 40, image: '/images/jumprope.webp' }
];

// Swagger настройки
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API спортивного магазина с JWT',
      version: '2.0.0',
      description: 'API с аутентификацией через JWT',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Локальный сервер',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./app.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware для проверки JWT токена
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");
  
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ 
      error: "Отсутствует или неверный заголовок Authorization. Используйте формат: Bearer <token>" 
    });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    req.user = payload; 
  
    next();
  } catch (err) {
    return res.status(401).json({ 
      error: "Недействительный или истекший токен" 
    });
  }
}

// Middleware для проверки, что пользователь - продавец
function sellerMiddleware(req, res, next) {
  const userId = req.user.sub;
  const user = userStorage.findById(userId);
  
  if (!user) {
    return res.status(401).json({ error: "Пользователь не найден" });
  }
  
  if (user.role !== 'seller' && user.role !== 'admin') {
    return res.status(403).json({ error: "Недостаточно прав. Только для продавцов и админов" });
  }
  
  next();
}

// Middleware для проверки, что пользователь - админ
function adminMiddleware(req, res, next) {
  const userId = req.user.sub;
  const user = userStorage.findById(userId);
  
  if (!user) {
    return res.status(401).json({ error: "Пользователь не найден" });
  }
  
  if (user.role !== 'admin') {
    return res.status(403).json({ error: "Недостаточно прав. Только для админов" });
  }
  
  next();
}

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить данные текущего пользователя (защищенный маршрут)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные пользователя
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 first_name:
 *                   type: string
 *                 last_name:
 *                   type: string
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Пользователь не найден
 */
app.get("/api/auth/me", authMiddleware, (req, res) => {
  // 1. Получаем ID пользователя из токена (req.user.sub)
  const userId = req.user.sub;
  
  // 2. Ищем пользователя в базе
  const user = userStorage.findById(userId);
  
  if (!user) {
    return res.status(404).json({ error: "Пользователь не найден" });
  }
  
  // 3. Отправляем данные (без пароля!)
  res.json({
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role
  });
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - price
 *         - stock
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный ID товара
 *         name:
 *           type: string
 *           description: Название товара
 *         category:
 *           type: string
 *           description: Категория товара
 *         description:
 *           type: string
 *           description: Описание товара
 *         price:
 *           type: number
 *           description: Цена товара в рублях
 *         stock:
 *           type: integer
 *           description: Количество на складе
 *       example:
 *         id: "abc123"
 *         name: "Футбольный мяч"
 *         category: "Футбол"
 *         description: "Профессиональный мяч размер 5"
 *         price: 3500
 *         stock: 25
 */

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Управление товарами
 */

// Функция-помощник
function findProductOr404(id, res) {
  const product = products.find(p => p.id == id);
  if (!product) {
    res.status(404).json({ error: "Товар не найден" });
    return null;
  }
  return product;
}

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создает новый товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - price
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Товар создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
app.post("/api/products", authMiddleware, sellerMiddleware,(req, res) => {
  const { name, category, description, price, stock, image } = req.body;
  
  if (!name || !category || !price) {
    return res.status(400).json({ 
      error: "Обязательные поля: name, category, price" 
    });
  }
  const newProduct = {
    id: nanoid(6),
    name: name.trim(),
    category: category.trim(),
    description: description?.trim() || '',
    price: Number(price),
    stock: Number(stock),
    image: image
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Возвращает список всех товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get("/api/products", (req, res) => {
  res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получает товар по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Данные товара
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */
app.get("/api/products/:id", authMiddleware, (req, res) => {
  const id = req.params.id;
  const product = products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ error: "Товар не найден" });
  }
  res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Полностью обновить товар (нужны все поля)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - price
 *             properties:
 *               na,e:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Обновленный товар
 *       400:
 *         description: Отсутствуют обязательные поля
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Товар не найден
 */
app.put("/api/products/:id", authMiddleware, sellerMiddleware, (req, res) => {
  console.log("🔵 PUT запрос на товар:", req.params.id);
  console.log("🔵 Тело запроса:", req.body);
  const id = req.params.id;
  const { name, category, description, price, stock, image } = req.body;
  
  // Проверяем обязательные поля
  if (!name || !category || !price) {
    console.log("🔴 Ошибка: отсутствуют обязательные поля");
    console.log("   name:", name);
    console.log("   category:", category);
    console.log("   price:", price);
    return res.status(400).json({ 
      error: "Обязательные поля: name, category, price",
      received: { name, category, price, stock, image }
    });
  }
  
  // Ищем товар
  const productIndex = products.findIndex(p => p.id === id);
  if (productIndex === -1) {
    return res.status(404).json({ error: "Товар не найден" });
  }
  
  // Полностью заменяем товар
  products[productIndex] = {
    id,
    name: name.trim(),
    category: category.trim(),
    description: description?.trim() || '',
    price: Number(price),
    stock: Number(stock) || products[productIndex].stock,
    image: image || products[productIndex].image
  };
  
  res.json(products[productIndex]);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удаляет товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     responses:
 *       204:
 *         description: Товар успешно удален
 *       404:
 *         description: Товар не найден
 */
app.delete("/api/products/:id",authMiddleware, adminMiddleware, (req, res) => {
  const id = req.params.id;
  const exists = products.some(p => p.id === id);
  if (!exists) return res.status(404).json({ error: "Товар не найден" });
  products = products.filter(p => p.id !== id);
  res.status(204).send();
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - first_name
 *               - last_name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: ivan@mail.com
 *               first_name:
 *                 type: string
 *                 example: Иван
 *               last_name:
 *                 type: string
 *                 example: Петров
 *               password:
 *                 type: string
 *                 example: qwerty123
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *       400:
 *         description: Ошибка в данных
 *       409:
 *         description: Пользователь уже существует
 */
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, first_name, last_name, password, role } = req.body;

    if (!email || !first_name || !last_name || !password) {
      return res.status(400).json({
        error: "Все поля обязательны: email, first_name, last_name, password"
      });
    }

    const existingUser = userStorage.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "Пользователь с таким email уже существует" });
    }

    const hashedPassword = await hashPassword(password);

    // Разрешенные роли: если роль не указана или недопустима, ставим 'user'
    let userRole = 'user';
    if (role && ['user', 'seller', 'admin'].includes(role)) {
      userRole = role;
    }

    const newUser = userStorage.create({
      email,
      first_name,
      last_name,
      hashedPassword,
      role: userRole
    });

    res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      role: newUser.role
    });

  } catch (error) {
    console.error("Ошибка регистрации:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход пользователя (получение JWT токена)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: ivan@mail.com
 *               password:
 *                 type: string
 *                 example: qwerty123
 *     responses:
 *       200:
 *         description: Успешный вход, возвращает JWT токен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *       400:
 *         description: Отсутствуют поля
 *       401:
 *         description: Неверный пароль
 *       404:
 *         description: Пользователь не найден
 */
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Проверяем поля
    if (!email || !password) {
      return res.status(400).json({ error: "Email и пароль обязательны" });
    }
    
    // Ищем пользователя
    const user = userStorage.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }
    
    // Проверяем пароль 
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Неверный пароль" });
    }
    
    // Генерируем оба токена 
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Сохраняем refresh-токен в хранилище 
    refreshTokens.add(refreshToken);
    
    // Отправляем ОБА токена
    res.status(200).json({ 
      accessToken,
      refreshToken, 
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error("Ошибка входа:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновить пару токенов по refresh-токену
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Действующий refresh-токен
 *     responses:
 *       200:
 *         description: Успешно, возвращает новую пару токенов
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Отсутствует refreshToken
 *       401:
 *         description: Недействительный refresh-токен
 *       404:
 *         description: Пользователь не найден
 */
app.post("/api/auth/refresh", (req, res) => {
  try {
    // 1. Получаем refresh-токен из тела запроса
    const { refreshToken } = req.body;
    
    // 2. Проверяем, что токен передан
    if (!refreshToken) {
      return res.status(400).json({ error: "refreshToken обязателен" });
    }
    
    // 3. Проверяем, есть ли токен в нашем хранилище
    if (!refreshTokens.has(refreshToken)) {
      return res.status(401).json({ error: "Недействительный refresh-токен" });
    }
    
    // 4. Проверяем, что токен не истек и подпись верна
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    
    // 5. Ищем пользователя по ID из токена
    const user = userStorage.findById(payload.sub);
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }
    
    // 6. РОТАЦИЯ: удаляем старый refresh-токен
    refreshTokens.delete(refreshToken);
    
    // 7. Генерируем НОВУЮ пару токенов
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    
    // 8. Сохраняем новый refresh-токен
    refreshTokens.add(newRefreshToken);
    
    // 9. Отправляем новую пару
    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
    
  } catch (err) {
    // Если токен не прошел verify (истек или поддельный)
    return res.status(401).json({ error: "Недействительный или истекший refresh-токен" });
  }
});

// ========== УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ (ТОЛЬКО АДМИН) ==========

// GET /api/users - список всех пользователей (только админ)
app.get("/api/users", authMiddleware, adminMiddleware, (req, res) => {
  const allUsers = userStorage.getAll();
  res.json(allUsers);
});

// GET /api/users/:id - получить пользователя по ID (только админ)
app.get("/api/users/:id", authMiddleware, adminMiddleware, (req, res) => {
  const id = req.params.id;
  const user = userStorage.findById(id);
  
  if (!user) {
    return res.status(404).json({ error: "Пользователь не найден" });
  }
  
  res.json({
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role
  });
});

// PUT /api/users/:id - обновить пользователя (только админ)
app.put("/api/users/:id", authMiddleware, adminMiddleware, (req, res) => {
  const id = req.params.id;
  const { email, first_name, last_name, role } = req.body;
  
  const updated = userStorage.update(id, { email, first_name, last_name, role });
  
  if (!updated) {
    return res.status(404).json({ error: "Пользователь не найден" });
  }
  
  res.json({
    id: updated.id,
    email: updated.email,
    first_name: updated.first_name,
    last_name: updated.last_name,
    role: updated.role
  });
});

// DELETE /api/users/:id - заблокировать пользователя (только админ)
app.delete("/api/users/:id", authMiddleware, adminMiddleware, (req, res) => {
  const id = req.params.id;
  const currentUserId = req.user.sub;
  
  // Нельзя удалить самого себя
  if (id === currentUserId) {
    return res.status(400).json({ error: "Нельзя удалить самого себя" });
  }
  
  const deleted = userStorage.delete(id);
  
  if (!deleted) {
    return res.status(404).json({ error: "Пользователь не найден" });
  }
  
  res.status(204).send();
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Обработчик ошибок
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Спорт-магазин запущен на http://localhost:${port}`);
  console.log(`Документация Swagger: http://localhost:${port}/api-docs`);
});