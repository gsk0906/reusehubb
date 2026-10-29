import pool from '../config/db.js';

// Format request DB row to match frontend expectations
export const formatRequestRow = (row) => {
  return {
    id: row.id,
    _id: String(row.id),
    itemId: row.item_id,
    item: {
      id: row.item_id,
      _id: String(row.item_id),
      title: row.item_title,
      price: Number(row.item_price),
      category: row.item_category,
      imageUrl: row.item_image_url,
      image: row.item_image_url,
      isSold: Boolean(row.item_is_sold),
      status: row.item_status,
      seller: {
        id: row.seller_id,
        _id: String(row.seller_id),
        name: row.seller_name,
        email: row.seller_email,
        department: row.seller_department || row.seller_hostel || 'Campus Member',
        hostel: row.seller_hostel || row.seller_department || 'Campus Member',
        phone: row.seller_phone || '',
      },
    },
    buyer: {
      id: row.buyer_id,
      _id: String(row.buyer_id),
      name: row.buyer_name,
      email: row.buyer_email,
      department: row.buyer_department || row.buyer_hostel || 'Campus Member',
      hostel: row.buyer_hostel || row.buyer_department || 'Campus Member',
      phone: row.buyer_phone || '',
    },
    sender: {
      id: row.buyer_id,
      _id: String(row.buyer_id),
      name: row.buyer_name,
      email: row.buyer_email,
      department: row.buyer_department || row.buyer_hostel || 'Campus Member',
      phone: row.buyer_phone || '',
    },
    seller: {
      id: row.seller_id,
      _id: String(row.seller_id),
      name: row.seller_name,
      email: row.seller_email,
      department: row.seller_department || row.seller_hostel || 'Campus Member',
      hostel: row.seller_hostel || row.seller_department || 'Campus Member',
      phone: row.seller_phone || '',
    },
    note: row.note || '',
    message: row.note || '',
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

/**
 * Send a purchase request to an item seller
 * POST /api/requests
 */
export const sendRequest = async (req, res, next) => {
  try {
    const { itemId, item, note, message } = req.body;
    const buyerId = req.user.id;
    const targetItemId = itemId || item;

    if (!targetItemId) {
      return res.status(400).json({ message: 'Valid item ID is required.' });
    }

    // Verify item exists
    const [items] = await pool.query('SELECT * FROM items WHERE id = ?', [targetItemId]);
    if (items.length === 0) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    const targetItem = items[0];
    if (targetItem.seller_id === buyerId) {
      return res.status(400).json({ message: 'You cannot send a purchase request for your own listing.' });
    }

    const requestNote = (note || message || 'Interested in purchasing this campus item.').trim();

    const [result] = await pool.query(
      `INSERT INTO purchase_requests (item_id, buyer_id, note, status)
       VALUES (?, ?, ?, 'pending')`,
      [targetItemId, buyerId, requestNote]
    );

    const newRequestId = result.insertId;

    const query = `
      SELECT
        r.*,
        i.title AS item_title,
        i.price AS item_price,
        i.category AS item_category,
        i.image_url AS item_image_url,
        i.is_sold AS item_is_sold,
        i.status AS item_status,
        i.seller_id AS seller_id,
        u_seller.name AS seller_name,
        u_seller.email AS seller_email,
        u_seller.department AS seller_department,
        u_seller.hostel AS seller_hostel,
        u_seller.phone AS seller_phone,
        u_buyer.name AS buyer_name,
        u_buyer.email AS buyer_email,
        u_buyer.department AS buyer_department,
        u_buyer.hostel AS buyer_hostel,
        u_buyer.phone AS buyer_phone
      FROM purchase_requests r
      JOIN items i ON r.item_id = i.id
      JOIN users u_seller ON i.seller_id = u_seller.id
      JOIN users u_buyer ON r.buyer_id = u_buyer.id
      WHERE r.id = ?
    `;

    const [rows] = await pool.query(query, [newRequestId]);

    return res.status(201).json({
      message: 'Request sent successfully',
      request: formatRequestRow(rows[0]),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all requests received by authenticated user (as seller)
 * GET /api/requests/received
 */
export const getReceivedRequests = async (req, res, next) => {
  try {
    const sellerId = req.user.id;

    const query = `
      SELECT
        r.*,
        i.title AS item_title,
        i.price AS item_price,
        i.category AS item_category,
        i.image_url AS item_image_url,
        i.is_sold AS item_is_sold,
        i.status AS item_status,
        i.seller_id AS seller_id,
        u_seller.name AS seller_name,
        u_seller.email AS seller_email,
        u_seller.department AS seller_department,
        u_seller.hostel AS seller_hostel,
        u_seller.phone AS seller_phone,
        u_buyer.name AS buyer_name,
        u_buyer.email AS buyer_email,
        u_buyer.department AS buyer_department,
        u_buyer.hostel AS buyer_hostel,
        u_buyer.phone AS buyer_phone
      FROM purchase_requests r
      JOIN items i ON r.item_id = i.id
      JOIN users u_seller ON i.seller_id = u_seller.id
      JOIN users u_buyer ON r.buyer_id = u_buyer.id
      WHERE i.seller_id = ?
      ORDER BY r.created_at DESC
    `;

    const [rows] = await pool.query(query, [sellerId]);

    return res.status(200).json({
      requests: rows.map(formatRequestRow),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all requests sent by authenticated user (as buyer)
 * GET /api/requests/sent
 */
export const getSentRequests = async (req, res, next) => {
  try {
    const buyerId = req.user.id;

    const query = `
      SELECT
        r.*,
        i.title AS item_title,
        i.price AS item_price,
        i.category AS item_category,
        i.image_url AS item_image_url,
        i.is_sold AS item_is_sold,
        i.status AS item_status,
        i.seller_id AS seller_id,
        u_seller.name AS seller_name,
        u_seller.email AS seller_email,
        u_seller.department AS seller_department,
        u_seller.hostel AS seller_hostel,
        u_seller.phone AS seller_phone,
        u_buyer.name AS buyer_name,
        u_buyer.email AS buyer_email,
        u_buyer.department AS buyer_department,
        u_buyer.hostel AS buyer_hostel,
        u_buyer.phone AS buyer_phone
      FROM purchase_requests r
      JOIN items i ON r.item_id = i.id
      JOIN users u_seller ON i.seller_id = u_seller.id
      JOIN users u_buyer ON r.buyer_id = u_buyer.id
      WHERE r.buyer_id = ?
      ORDER BY r.created_at DESC
    `;

    const [rows] = await pool.query(query, [buyerId]);

    return res.status(200).json({
      requests: rows.map(formatRequestRow),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update purchase request status (accepted | rejected)
 * PATCH /api/requests/:id
 */
export const updateRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const normalizedStatus = (status || '').toLowerCase().trim();
    if (!['accepted', 'rejected', 'pending'].includes(normalizedStatus)) {
      return res.status(400).json({ message: "Status must be 'accepted' or 'rejected'." });
    }

    // Verify request existence and seller ownership
    const [requests] = await pool.query(
      `SELECT r.*, i.seller_id FROM purchase_requests r
       JOIN items i ON r.item_id = i.id
       WHERE r.id = ?`,
      [id]
    );

    if (requests.length === 0) {
      return res.status(404).json({ message: 'Purchase request not found.' });
    }

    const targetReq = requests[0];
    if (targetReq.seller_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Only the item seller can update request status.' });
    }

    await pool.query('UPDATE purchase_requests SET status = ? WHERE id = ?', [normalizedStatus, id]);

    const query = `
      SELECT
        r.*,
        i.title AS item_title,
        i.price AS item_price,
        i.category AS item_category,
        i.image_url AS item_image_url,
        i.is_sold AS item_is_sold,
        i.status AS item_status,
        i.seller_id AS seller_id,
        u_seller.name AS seller_name,
        u_seller.email AS seller_email,
        u_seller.department AS seller_department,
        u_seller.hostel AS seller_hostel,
        u_seller.phone AS seller_phone,
        u_buyer.name AS buyer_name,
        u_buyer.email AS buyer_email,
        u_buyer.department AS buyer_department,
        u_buyer.hostel AS buyer_hostel,
        u_buyer.phone AS buyer_phone
      FROM purchase_requests r
      JOIN items i ON r.item_id = i.id
      JOIN users u_seller ON i.seller_id = u_seller.id
      JOIN users u_buyer ON r.buyer_id = u_buyer.id
      WHERE r.id = ?
    `;

    const [rows] = await pool.query(query, [id]);

    return res.status(200).json({
      message: 'Request status updated',
      request: formatRequestRow(rows[0]),
    });
  } catch (error) {
    next(error);
  }
};
