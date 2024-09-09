const nano = require('nano')('http://admin:admin@127.0.0.1:5984');
const db = nano.use('bookstore');

exports.createSale = async (redisClient, req, res) => {
  console.log("dentro de createSale"); // Debugging
  const useCache = process.env.USE_CACHE === 'true';
  try {
    console.log("Request sale Body:", req.body); // Debugging

    const sale = { ...req.body, type: 'sale' };
    const result = await db.insert(sale);
    console.log('CouchDB create sale result:', result);

    if (useCache) {
      // Invalidate the cache for the sales list
      console.log('Invalidating cache for sales list');
      await redisClient.del('sales');

      // Cache the newly created sale data
      const newSaleId = result.id;
      const cacheData = { ...req.body, _id: newSaleId };
      await redisClient.setEx(`sale:${newSaleId}`, 3600, JSON.stringify(cacheData));
    }

    res.status(201).json(result);
  } catch (error) {
    console.log("Error creating sale:", error.message); // Debugging
    res.status(500).json({ error: error.message });
  }
};

exports.getSales = async (redisClient, req, res) => {
  console.log("dentro de getSales"); // Debugging
  const useCache = process.env.USE_CACHE === 'true';
  const cacheKey = 'sales';

  try {
    if (useCache) {
      console.log('Attempting to fetch from cache');
      const cachedData = await redisClient.get(cacheKey);
      //console.log('cachedData:', cachedData); // Debugging

      if (cachedData) {
        console.log('Fetching sales from cache');
        sales = JSON.parse(cachedData);

      } else {
        console.log('Cache miss. Fetching sales from database');
        const result = await db.list({ include_docs: true });
        const sales = result.rows.filter(row => row.doc.type === 'sale').map(row => row.doc);
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(sales));

      }
    } else {
    const result = await db.list({ include_docs: true });
    const sales = result.rows.filter(row => row.doc.type === 'sale').map(row => row.doc);
    }

    res.status(200).json(sales);
  } catch (error) {
    console.log("Error fetching sales:", error.message); // Debugging
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
