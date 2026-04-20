const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'front_db',
    password: '2487',
    port: 5432,
});

// POST /users
app.post('/users', async (req, res) => {
    try {
        const { first_name, last_name, age } = req.body;
        const now = Math.floor(Date.now() / 1000);
        
        const result = await pool.query(
            "INSERT INTO users (first_name, last_name, age, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [first_name, last_name, age, now, now]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /users
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /users/:id
app.get('/users/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /users/:id
app.patch('/users/:id', async (req, res) => {
    try {
        const { first_name, last_name, age } = req.body;
        const now = Math.floor(Date.now() / 1000);
        
        const current = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
        if (current.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newFirstName = first_name !== undefined ? first_name : current.rows[0].first_name;
        const newLastName = last_name !== undefined ? last_name : current.rows[0].last_name;
        const newAge = age !== undefined ? age : current.rows[0].age;
        
        const result = await pool.query(
            "UPDATE users SET first_name = $1, last_name = $2, age = $3, updated_at = $4 WHERE id = $5 RETURNING *",
            [newFirstName, newLastName, newAge, now, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE /users/:id
app.delete('/users/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => {
    console.log('Server on http://localhost:3000');
});