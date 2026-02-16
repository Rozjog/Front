const express = require('express');
const app = express();
const port = 3000;

let products = [
    { id: 1, title: 'Арбуз', price: 2000 },
    { id: 2, title: 'Печенье', price: 150 },
    { id: 3, title: 'Кока-кола', price: 200 }
];


app.use(express.json());

app.get('/', (req, res) => {
    res.send('Главная страница магазина');
});

app.post('/products', (req, res) => {
    const { title, price } = req.body;
    
    const newProduct = {
        id: Date.now(),
        title,
        price,
    };
    
    products.push(newProduct);
    res.status(201).json(newProduct);
});

app.get('/products', (req, res) => {
    res.send(JSON.stringify(products));
});

app.get('/products/:id', (req, res) => {
    let product = products.find(p => p.id == req.params.id);
    res.send(JSON.stringify(product));
});

app.patch('/products/:id', (req, res) => {
    const product = products.find(p => p.id == req.params.id);
    const { title, price } = req.body;
    
    if (title !== undefined) product.title = title;
    if (price !== undefined) product.price = price;
    
    res.json(product);
});

app.delete('/products/:id', (req, res) => {
    products = products.filter(p => p.id != req.params.id);
    res.send('Ok');
});

app.listen(port, () => {
     console.log(`Сервер запущен на http://localhost:${port}`);
});