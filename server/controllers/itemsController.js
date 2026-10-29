import pool from '../config/db.js';

// Format item DB row into the exact shape expected by frontend components
export const formatItemRow = (row) => {
  return {
    id: row.id,
    _id: String(row.id),
    title: row.title,
    description: row.description,
    category: row.category,
    price: Number(row.price),
    condition: row.condition_type || row.condition,
    condition_type: row.condition_type || row.condition,
    status: row.status,
    isSold: Boolean(row.is_sold),
    imageUrl: row.image_url,
    image: row.image_url,
    seller: {
      id: row.seller_id,
      _id: String(row.seller_id),
      name: row.seller_name || 'Campus Student',
      email: row.seller_email || '',
      department: row.seller_department || row.seller_hostel || 'Campus Member',
      hostel: row.seller_hostel || row.seller_department || 'Campus Member',
      phone: row.seller_phone || '',
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

/**
 * List marketplace items with search, category, condition, and sort filters
 * GET /api/items
 */
export const getItems = async (req, res, next) => {
  try {
    const { search, category, condition, sort } = req.query;

    const whereClauses = [];
    const params = [];

    if (search && search.trim()) {
      whereClauses.push('(LOWER(i.title) LIKE ? OR LOWER(i.description) LIKE ?)');
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term, term);
    }

    if (category && category !== 'All' && category.trim()) {
      whereClauses.push('LOWER(i.category) = ?');
      params.push(category.trim().toLowerCase());
    }

    if (condition && condition !== 'All' && condition.trim()) {
      whereClauses.push('LOWER(i.condition_type) = ?');
      params.push(condition.trim().toLowerCase());
    }

    let orderClause = 'ORDER BY i.created_at DESC';
    if (sort === 'price_asc') {
      orderClause = 'ORDER BY i.price ASC';
    } else if (sort === 'price_desc') {
      orderClause = 'ORDER BY i.price DESC';
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
      SELECT
        i.*,
        u.name AS seller_name,
        u.email AS seller_email,
        u.department AS seller_department,
        u.hostel AS seller_hostel,
        u.phone AS seller_phone
      FROM items i
      JOIN users u ON i.seller_id = u.id
      ${whereSql}
      ${orderClause}
    `;

    const [rows] = await pool.query(query, params);

    return res.status(200).json({
      items: rows.map(formatItemRow),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get items listed by authenticated user
 * GET /api/items/mine
 */
export const getMyItems = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT
        i.*,
        u.name AS seller_name,
        u.email AS seller_email,
        u.department AS seller_department,
        u.hostel AS seller_hostel,
        u.phone AS seller_phone
      FROM items i
      JOIN users u ON i.seller_id = u.id
      WHERE i.seller_id = ?
      ORDER BY i.created_at DESC
    `;

    const [rows] = await pool.query(query, [userId]);

    return res.status(200).json({
      items: rows.map(formatItemRow),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single item by ID
 * GET /api/items/:id
 */
export const getItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        i.*,
        u.name AS seller_name,
        u.email AS seller_email,
        u.department AS seller_department,
        u.hostel AS seller_hostel,
        u.phone AS seller_phone
      FROM items i
      JOIN users u ON i.seller_id = u.id
      WHERE i.id = ?
    `;

    const [rows] = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Item listing not found' });
    }

    return res.status(200).json({
      item: formatItemRow(rows[0]),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new item listing
 * POST /api/items
 */
export const createItem = async (req, res, next) => {
  try {
    const { title, description, category, price, condition, condition_type, imageUrl, image } = req.body;
    const sellerId = req.user.id;

    const chosenCondition = (condition || condition_type || 'Good').trim();
    const chosenImage = (imageUrl || image || '').trim();

    const [result] = await pool.query(
      `INSERT INTO items (seller_id, title, description, category, price, condition_type, status, is_sold, image_url)
       VALUES (?, ?, ?, ?, ?, ?, 'Available', 0, ?)`,
      [
        sellerId,
        title.trim(),
        description.trim(),
        category.trim(),
        parseFloat(price) || 0,
        chosenCondition,
        chosenImage || null,
      ]
    );

    const newItemId = result.insertId;

    const [rows] = await pool.query(
      `SELECT
        i.*,
        u.name AS seller_name,
        u.email AS seller_email,
        u.department AS seller_department,
        u.hostel AS seller_hostel,
        u.phone AS seller_phone
      FROM items i
      JOIN users u ON i.seller_id = u.id
      WHERE i.id = ?`,
      [newItemId]
    );

    return res.status(201).json({
      message: 'Item listed successfully',
      item: formatItemRow(rows[0]),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing listing
 * PUT /api/items/:id
 */
export const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check item existence and ownership
    const [existing] = await pool.query('SELECT * FROM items WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Item listing not found' });
    }

    const item = existing[0];
    if (item.seller_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You can only edit your own listings.' });
    }

    const { title, description, category, price, condition, condition_type, imageUrl, image } = req.body;

    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title.trim());
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description.trim());
    }
    if (category !== undefined) {
      updates.push('category = ?');
      params.push(category.trim());
    }
    if (price !== undefined) {
      updates.push('price = ?');
      params.push(parseFloat(price) || 0);
    }
    if (condition !== undefined || condition_type !== undefined) {
      updates.push('condition_type = ?');
      params.push((condition || condition_type).trim());
    }
    if (imageUrl !== undefined || image !== undefined) {
      updates.push('image_url = ?');
      params.push((imageUrl || image || '').trim() || null);
    }

    if (updates.length > 0) {
      params.push(id);
      await pool.query(`UPDATE items SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const [rows] = await pool.query(
      `SELECT
        i.*,
        u.name AS seller_name,
        u.email AS seller_email,
        u.department AS seller_department,
        u.hostel AS seller_hostel,
        u.phone AS seller_phone
      FROM items i
      JOIN users u ON i.seller_id = u.id
      WHERE i.id = ?`,
      [id]
    );

    return res.status(200).json({
      message: 'Item updated successfully',
      item: formatItemRow(rows[0]),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark listing as sold
 * PATCH /api/items/:id/sold
 */
export const markItemAsSold = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const [existing] = await pool.query('SELECT * FROM items WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Item listing not found' });
    }

    const item = existing[0];
    if (item.seller_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You can only update your own listings.' });
    }

    await pool.query('UPDATE items SET is_sold = 1, status = ? WHERE id = ?', ['Sold', id]);

    const [rows] = await pool.query(
      `SELECT
        i.*,
        u.name AS seller_name,
        u.email AS seller_email,
        u.department AS seller_department,
        u.hostel AS seller_hostel,
        u.phone AS seller_phone
      FROM items i
      JOIN users u ON i.seller_id = u.id
      WHERE i.id = ?`,
      [id]
    );

    return res.status(200).json({
      message: 'Item marked as sold',
      item: formatItemRow(rows[0]),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a listing
 * DELETE /api/items/:id
 */
export const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const [existing] = await pool.query('SELECT * FROM items WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Item listing not found' });
    }

    const item = existing[0];
    if (item.seller_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own listings.' });
    }

    await pool.query('DELETE FROM items WHERE id = ?', [id]);

    return res.status(200).json({
      message: 'Item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
