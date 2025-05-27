
// const express = require('express');
// const utils = require('../utils');
// const multer = require('multer');
// const upload = multer({ dest: 'images' });
// const router = express.Router();
// const { pool } = require('../db');

// // CREATE user
// router.post('/', (req, res) => {
//   const { id, name, email, password } = req.body;
//   const stmt = 'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)';
//   pool.execute(stmt, [id, name, email, password], (err, result) => {
//     if (err) {
//       return res.status(500).json({ error: err });
//     }
//     res.json({ id: result.insertId });
//   });
// });

// // READ all users
// router.get('/get', (req, res) => {
//   const statement = `SELECT * FROM users`;
//   pool.query(statement, (error, results) => {
//     res.send(utils.createResult(error, results));
//   });
// });

// module.exports = router;

const express = require('express');
const utils = require('../utils');
const multer = require('multer');
const upload = multer({ dest: 'images' });
const router = express.Router();
const { pool } = require('../db');

// Create a user
router.post('/', (req, res) => {
  const { name, email, password } = req.body;
  const stmt = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  pool.execute(stmt, [name, email, password], (err, result) => {
    if (err) return res.status(500).json(utils.createError(err));
    res.json(utils.createSuccess({ id: result.insertId }));
  });
});

// Bulk add users
router.post('/bulk', (req, res) => {
  const users = req.body; // Expecting an array of {name, email, password}
  const stmt = 'INSERT INTO users (name, email, password) VALUES ?';
  const values = users.map(user => [user.name, user.email, user.password]);
  pool.query(stmt, [values], (err, result) => {
    if (err) return res.status(500).json(utils.createError(err));
    res.json(utils.createSuccess({ inserted: result.affectedRows }));
  });
});

// Get all users
router.get('/', (req, res) => {
  const stmt = 'SELECT * FROM users';
  pool.query(stmt, (err, results) => {
    res.send(utils.createResult(err, results));
  });
});

// Get user by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const stmt = 'SELECT * FROM users WHERE id = ?';
  pool.execute(stmt, [id], (err, results) => {
    res.send(utils.createResult(err, results[0]));
  });
});

// Filter users by name
router.get('/filter/name', (req, res) => {
  const { name } = req.query;
  const stmt = 'SELECT * FROM users WHERE name LIKE ?';
  pool.execute(stmt, [`%${name}%`], (err, results) => {
    res.send(utils.createResult(err, results));
  });
});

// Delete user by ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const stmt = 'DELETE FROM users WHERE id = ?';
  pool.execute(stmt, [id], (err, result) => {
    res.send(utils.createResult(err, { deleted: result.affectedRows }));
  });
});

// Update user by ID
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
  const stmt = 'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?';
  pool.execute(stmt, [name, email, password, id], (err, result) => {
    res.send(utils.createResult(err, { updated: result.affectedRows }));
  });
});

// Paginated users
router.get('/paginated', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const stmt = 'SELECT * FROM users LIMIT ? OFFSET ?';
  pool.execute(stmt, [limit, offset], (err, results) => {
    res.send(utils.createResult(err, results));
  });
});

module.exports = router;

