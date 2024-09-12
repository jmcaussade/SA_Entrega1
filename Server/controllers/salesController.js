const nano = require('nano')('http://admin:admin@localhost:5984');
const db = nano.use('bookstore');

// Obtener todas las ventas
exports.getSales = async (redisClient, req, res) => {
  console.log("Inside getSales"); // Debugging
  const useCache = process.env.USE_CACHE === 'true';
  const cacheKey = 'sales';

  if (useCache) {
    // Check if sales are in cache
    console.log("Attempting to fetch from cache"); // Debugging
    
    try {
      const data = await redisClient.get(cacheKey);
      if (data) {
        console.log("Fetching sales from cache"); // Debugging
        const sales = JSON.parse(data);
        return res.json(sales);
      } else {
        console.log("Cache miss. Fetching sales from database"); // Debugging
        const result = await db.list({ include_docs: true });
        const sales = result.rows.filter(row => row.doc.type === 'sale').map(row => row.doc);
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(sales));
        return res.json(sales);
      }
    } catch (err) {
      console.error('Error fetching from cache:', err);
      return res.status(500).json({ error: 'Error fetching from cache' });
    }
  } else {
    console.log("Fetching sales from database (cache disabled)"); // Debugging
    try {
      const result = await db.list({ include_docs: true });
      const sales = result.rows.filter(row => row.doc.type === 'sale').map(row => row.doc);
      return res.json(sales);
    } catch (dbError) {
      console.error('Error fetching sales from database:', dbError);
      return res.status(500).json({ error: 'Error fetching sales from database' });
    }
  }
};

exports.createSale = async (req, res) => {
  try {
    const sale = { ...req.body, type: 'sale' };
    const result = await db.insert(sale);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



exports.updateSale = async (req, res) => {
  try {
    const sale = await db.get(req.params.id);
    const updatedSale = { ...sale, ...req.body };
    const result = await db.insert(updatedSale);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSale = async (req, res) => {
  try {
    const sale = await db.get(req.params.id);
    await db.destroy(sale._id, sale._rev);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSaleById = async (req, res) => {
  try {
    const sale = await db.get(req.params.id);
    if (sale.type === 'sale') {
      res.status(200).json(sale);
    } else {
      res.status(404).json({ error: 'Sale not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};