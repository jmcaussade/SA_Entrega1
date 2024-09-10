const nano = require('nano')('http://admin:admin@couchdb:5984');
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
 
  let sales = [];  // Ensure sales is initialized as an empty array by default

  try {
    if (useCache) {
      console.log('Attempting to fetch from cache');
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        console.log('Fetching sales from cache');
        sales = JSON.parse(cachedData);
      } else {
        console.log('Cache miss. Fetching sales from database');
        const result = await db.list({ include_docs: true });
        sales = result.rows.filter(row => row.doc.type === 'sale').map(row => row.doc);
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(sales));
      }
    } else {
      console.log('Fetching sales from database (cache disabled)');
      const result = await db.list({ include_docs: true });
      sales = result.rows.filter(row => row.doc.type === 'sale').map(row => row.doc);
    }

    if (!Array.isArray(sales)) {
      sales = []; // Ensure sales is an array if some unexpected data was returned
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

exports.updateSale = async (redisClient, req, res) => {
  console.log("dentro de updateSale"); // Debugging
  const useCache = process.env.USE_CACHE === 'true';

  try {
    // Fetch the current sale from the database
    const sale = await db.get(req.params.id);

    // Merge the existing sale with the updated data
    const updatedSale = { ...sale, ...req.body };

    // Update the sale in the database
    const result = await db.insert(updatedSale);
    console.log('CouchDB update sale result:', result);

    // Send the response to the client
    res.status(200).json(result);

    if (useCache) {
      // Ensure cache invalidation and update only if the response has not been sent
      console.log("invalidating cache for sale:", sale._id);
      await redisClient.del(`sale:${sale._id}`);

      // Invalidate the cache for the sales list
      console.log('Invalidating cache for sales list');
      await redisClient.del('sales');

      // Cache the updated sale data
      console.log('Caching updated sale data');
      await redisClient.setEx(`sale:${req.params.id}`, 3600, JSON.stringify(updatedSale));
    }
  } catch (error) {
    if (!res.headersSent) {
      // Ensure headers have not been sent before sending an error response
      res.status(500).json({ error: error.message });
    } else {
      // Log error if response headers have already been sent
      console.error('Error during updateSale after response sent:', error);
    }
  }
};


exports.deleteSale = async (redisClient, req, res) => {
  console.log("dentro de deleteSale"); // Debugging
  const useCache = process.env.USE_CACHE === 'true';

  try {
    const sale = await db.get(req.params.id);
    await db.destroy(sale._id, sale._rev);

    if (useCache) {
      console.log('Invalidating cache for the sale:', sale._id);
      await redisClient.del(`sale:${sale._id}`);

      // Optionally invalidate the cache for the entire sales list
      console.log('Invalidating cache for all sales');
      await redisClient.del('sales');
    }
    res.status(204).end();
  } catch (error) {
    console.log("Error deleting sale"); // Debugging
    res.status(500).json({ error: error.message });
  }
};
