const express = require('express');
const router = express.Router();
const db = require('../../db/database');
const inputCheck = require('../../utils/inputCheck');

// -- get all voters who do not have a last name of Cooper or Jarman
// SELECT * FROM voters WHERE last_name != 'Cooper' AND last_name != 'Jarman';

// -- get all voters who have a .edu email address
// SELECT * FROM voters WHERE email LIKE '%.edu';

// -- get only the last created voter
// SELECT * FROM voters ORDER BY created_at DESC LIMIT 1;


// Get voters sorted by last name
router.get('/voters', (req, res) => {
    const sql = `SELECT * FROM voters ORDER BY last_name DESC`;
    const params = [];

    db.all(sql,params, (err,rows) => {
        if(err) {
            res.status(500).json({ error: err.message });
            return;
        }

        res.json({
            message: 'success',
            data: rows
        });
    });
});

// Get a single voter
router.get('/voter/:id', (req, res) => {
    const sql = `SELECT * FROM voters WHERE id = ?`;
    const params = [req.params.id];

    db.get(sql, params, (err, row) => {
        if(err) {
            res.status(400).json({ error: err.message });
            return;
        }

        res.json({
            message: 'success',
            data: row
        });
    });
});

// Add a voter
router.post('/voter', ({body}, res) => {
    // check for errors
    const errors = inputCheck(body, 'first_name', 'last_name', 'email');

    if (errors) {
    res.status(400).json({ error: errors });
    return;
    }

    const sql = `INSERT INTO voters (first_name, last_name, email) VALUES (?,?,?)`;
    const params = [body.first_name, body.last_name, body.email];

    db.run(sql, params, function(err, data) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        res.json({
            message: 'success',
            data: body,
            id: this.lastID
        });
    });
});

// Edit a voter's email
router.put('/voter/:id', (req,res) => {
    // Data validation
    const errors = inputCheck(req.body, 'email');
    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }

    // Prepare statement
    const sql = `UPDATE voters SET email = ? WHERE id = ?`;
    const params = [req.body.email, req.params.id];

    // Execute
    db.run(sql, params, function(err, data) {
        if(err) {
            res.status(400).json({ error: err.message});
            return;
        }

        res.json({
            message: 'success',
            data: req.body,
            changes: this.changes
        });
    });
});

// remove a voter
router.delete('/voter/:id', (req,res) => {
    const sql = `DELETE FROM voters WHERE id =?`;

    db.run(sql, req.params.id, function(err, result) {
        if(err) {
            res.status(400).json({ error: res.message });
            return;
        }

        res.json({ message: 'deleted', changes: this.changes });
    });
});

module.exports = router;