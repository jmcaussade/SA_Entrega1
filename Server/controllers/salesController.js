const nano = require('nano')('http://admin:admin@127.0.0.1:5984');
const db = nano.use('bookstore');

exports.createSale = async (req, res) => {
  try {
    const sale = { ...req.body, type: 'sale' };
    const result = await db.insert(sale);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSales = async (req, res) => {
  try {
    const result = await db.list({ include_docs: true });
    const sales = result.rows.filter(row => row.doc.type === 'sale').map(row => row.doc);
    res.status(200).json(sales);
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
