const express = require('express');
const nano = require('nano')('http://admin:admin@127.0.0.1:5984'); // CouchDB credentials
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Use your database
const db = nano.db.use('bookstore');

// CREATE: Add a new document
app.post('/documents', async (req, res) => {
    try {
        const response = await db.insert(req.body);
        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// READ: Get a document by ID
app.get('/documents/:id', async (req, res) => {
    try {
        const doc = await db.get(req.params.id);
        res.status(200).json(doc);
    } catch (error) {
        res.status(404).json({ error: 'Document not found' });
    }
});

// UPDATE: Update a document by ID
app.put('/documents/:id', async (req, res) => {
    try {
        const doc = await db.get(req.params.id);
        const updatedDoc = { ...doc, ...req.body, _rev: doc._rev };
        const response = await db.insert(updatedDoc);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Delete a document by ID
app.delete('/documents/:id', async (req, res) => {
    try {
        const doc = await db.get(req.params.id);
        const response = await db.destroy(req.params.id, doc._rev);
        res.status(200).json(response);
    } catch (error) {
        res.status(404).json({ error: 'Document not found' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
