require('dotenv').config();
const mysql = require('mysql2');
const express = require('express');
const app = express();
const port = process.env.APP_PORT || 3000;

// Middleware untuk parsing JSON
app.use(express.json());

// Membuat koneksi ke database MySQL
const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database as ID', connection.threadId);
});

// 1. Menampilkan semua notes
app.get('/api/notes', (req, res) => {
  connection.query('SELECT * FROM notes', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// 2. Menampilkan satu note berdasarkan ID
app.get('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  connection.query('SELECT * FROM notes WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(results[0]);
  });
});

// 3. Membuat note baru
app.post('/api/notes', (req, res) => {
  const { title, datetime, note } = req.body;
  
  if (!title || !datetime || !note) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = 'INSERT INTO notes (title, datetime, note) VALUES (?, ?, ?)';
  connection.query(query, [title, datetime, note], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ message: 'Note added successfully', noteId: results.insertId });
  });
});

// 4. Mengubah note (judul, tanggal, dan catatan)
app.put('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const { title, datetime, note } = req.body;

  if (!title || !datetime || !note) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = 'UPDATE notes SET title = ?, datetime = ?, note = ? WHERE id = ?';
  connection.query(query, [title, datetime, note, id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ message: 'Note updated successfully' });
  });
});

// 5. Menghapus note
app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM notes WHERE id = ?';
  
  connection.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ message: 'Note deleted successfully' });
  });
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
