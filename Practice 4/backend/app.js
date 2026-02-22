const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');

const app = express();
const port = 3000;

// Спортивные товары
let products = [
  { 
    id: nanoid(6), 
    name: 'Футбольный мяч', 
    category: 'Футбол', 
    description: 'Профессиональный мяч размер 5, камерный', 
    price: 3500, 
    stock: 25 
  },
  { 
    id: nanoid(6), 
    name: 'Кроссовки для бега', 
    category: 'Бег', 
    description: 'Легкие кроссовки с амортизацией, размер 42', 
    price: 8500, 
    stock: 15 
  },
  { 
    id: nanoid(6), 
    name: 'Теннисная ракетка', 
    category: 'Теннис', 
    description: 'Карбоновая ракетка для любителей', 
    price: 6200, 
    stock: 8 
  },
  { 
    id: nanoid(6), 
    name: 'Гантели 5 кг', 
    category: 'Фитнес', 
    description: 'Резиновые гантели, комплект 2 шт', 
    price: 2800, 
    stock: 30 
  },
  { 
    id: nanoid(6), 
    name: 'Велосипед горный', 
    category: 'Велоспорт', 
    description: '26 дюймов, 21 скорость, дисковые тормоза', 
    price: 28500, 
    stock: 5 
  },
  { 
    id: nanoid(6), 
    name: 'Баскетбольный мяч', 
    category: 'Баскетбол', 
    description: 'Официальный размер 7, резина', 
    price: 3200, 
    stock: 18 
  },
  { 
    id: nanoid(6), 
    name: 'Коврик для йоги', 
    category: 'Йога', 
    description: 'Противоскользящий, 6 мм', 
    price: 1900, 
    stock: 22 
  },
  { 
    id: nanoid(6), 
    name: 'Шлем для скейтборда', 
    category: 'Скейтбординг', 
    description: 'Регулируемый, защита от ударов', 
    price: 4300, 
    stock: 12 
  },
  { 
    id: nanoid(6), 
    name: 'Лыжи беговые', 
    category: 'Лыжи', 
    description: 'Классические, длина 190 см', 
    price: 8900, 
    stock: 7 
  },
  { 
    id: nanoid(6), 
    name: 'Скакалка', 
    category: 'Фитнес', 
    description: 'Скоростная, с подсчетом калорий', 
    price: 650, 
    stock: 40 
  }
];

app.use(express.json());
app.use(cors({ 
  origin: "http://localhost:3001", 
  methods: ["GET", "POST", "PATCH", "DELETE"], 
  allowedHeaders: ["Content-Type", "Authorization"] 
}));

// Логирование
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      console.log('Body:', req.body);
    }
  });
  next();
});

// Функция-помощник
function findProductOr404(id, res) {
  const product = products.find(p => p.id == id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return null;
  }
  return product;
}

// POST /api/products - создание товара
app.post("/api/products", (req, res) => {
  const { name, category, description, price, stock } = req.body;
  const newProduct = { 
    id: nanoid(6), 
    name: name.trim(), 
    category: category.trim(),
    description: description.trim(),
    price: Number(price), 
    stock: Number(stock)
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// GET /api/products - список всех товаров
app.get("/api/products", (req, res) => {
  res.json(products);
});

// GET /api/products/:id - товар по ID
app.get("/api/products/:id", (req, res) => {
  const id = req.params.id;
  const product = findProductOr404(id, res);
  if (!product) return;
  res.json(product);
});

// PATCH /api/products/:id - обновление товара
app.patch("/api/products/:id", (req, res) => {
  const id = req.params.id;
  const product = findProductOr404(id, res);
  if (!product) return;
  
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Nothing to update" });
  }
  
  const { name, category, description, price, stock } = req.body;
  if (name !== undefined) product.name = name.trim();
  if (category !== undefined) product.category = category.trim();
  if (description !== undefined) product.description = description.trim();
  if (price !== undefined) product.price = Number(price);
  if (stock !== undefined) product.stock = Number(stock);
  
  res.json(product);
});

// DELETE /api/products/:id - удаление товара
app.delete("/api/products/:id", (req, res) => {
  const id = req.params.id;
  const exists = products.some((p) => p.id === id);
  if (!exists) return res.status(404).json({ error: "Product not found" });
  products = products.filter((p) => p.id !== id);
  res.status(204).send();
});

// 404 для всех остальных маршрутов
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Спорт-магазин запущен на http://localhost:${port}`);
  console.log(`Маршрут для товаров: http://localhost:${port}/api/products`);
});