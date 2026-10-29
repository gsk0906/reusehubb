import http from 'http';
import { parse as parseUrl } from 'url';

const PORT = 5000;

// Indian context seed users
let users = [
  {
    id: 'user_aarav',
    _id: 'user_aarav',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@college.edu.in',
    password: 'password123',
    department: 'CSE, Block A',
    hostel: 'Block A',
    phone: '+91 98765 43210',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_priya',
    _id: 'user_priya',
    name: 'Priya Nair',
    email: 'priya.nair@college.edu.in',
    password: 'password123',
    department: 'ECE, Block B',
    hostel: 'Block B',
    phone: '+91 91234 56789',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_rohan',
    _id: 'user_rohan',
    name: 'Rohan Reddy',
    email: 'rohan.reddy@college.edu.in',
    password: 'password123',
    department: 'Mechanical, Block C',
    hostel: 'Block C',
    phone: '+91 99887 76655',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_ananya',
    _id: 'user_ananya',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@college.edu.in',
    password: 'password123',
    department: 'Civil, Block A',
    hostel: 'Block A',
    phone: '+91 97654 32109',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_karthik',
    _id: 'user_karthik',
    name: 'Karthik Rao',
    email: 'karthik.rao@college.edu.in',
    password: 'password123',
    department: 'Chemical, Block D',
    hostel: 'Block D',
    phone: '+91 96543 21098',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_sneha',
    _id: 'user_sneha',
    name: 'Sneha Patel',
    email: 'sneha.patel@college.edu.in',
    password: 'password123',
    department: 'Biotech, Block B',
    hostel: 'Block B',
    phone: '+91 95432 10987',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_vikram',
    _id: 'user_vikram',
    name: 'Vikram Singh',
    email: 'vikram.singh@college.edu.in',
    password: 'password123',
    department: 'Electrical, Block C',
    hostel: 'Block C',
    phone: '+91 94321 09876',
    createdAt: new Date().toISOString(),
  },
];

// Indian context seed items (prices in INR ₹)
let items = [
  {
    id: 'item_1',
    _id: 'item_1',
    title: 'Higher Engineering Mathematics by B.S. Grewal (44th Edition)',
    description: 'Standard textbook for 1st & 2nd year engineering mathematics. Clean pages with minimal pencil notes. Essential for calculus, ODE, and transform calculus.',
    category: 'Textbooks',
    price: 450,
    condition: 'Like New',
    status: 'Available',
    isSold: false,
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    seller: {
      id: 'user_priya',
      _id: 'user_priya',
      name: 'Priya Nair',
      email: 'priya.nair@college.edu.in',
      department: 'ECE, Block B',
      phone: '+91 91234 56789',
    },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'item_2',
    _id: 'item_2',
    title: 'Casio fx-991EX ClassWiz Scientific Calculator',
    description: 'Non-programmable college exam approved calculator. Dual solar and battery power, high-res LCD screen. Comes with slide-on protective case.',
    category: 'Calculators',
    price: 850,
    condition: 'Good',
    status: 'Available',
    isSold: false,
    imageUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80',
    seller: {
      id: 'user_aarav',
      _id: 'user_aarav',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@college.edu.in',
      department: 'CSE, Block A',
      phone: '+91 98765 43210',
    },
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'item_3',
    _id: 'item_3',
    title: 'White Cotton Lab Coat (Size 38) + Chemical Splash Goggles',
    description: 'Required for 1st year Chemistry and Physics labs. Washed, crisp 100% cotton with deep front pockets and transparent safety eyewear.',
    category: 'Lab Equipment',
    price: 250,
    condition: 'Good',
    status: 'Available',
    isSold: false,
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
    seller: {
      id: 'user_priya',
      _id: 'user_priya',
      name: 'Priya Nair',
      email: 'priya.nair@college.edu.in',
      department: 'ECE, Block B',
      phone: '+91 91234 56789',
    },
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'item_4',
    _id: 'item_4',
    title: 'Omega Mini Drafter with Stainless Steel Rods & Sheet Holder',
    description: 'Essential for Engineering Graphics (ED) drawing sheets. Smooth 360-degree protractor clamp, scratch-free transparent acrylic scales.',
    category: 'Drawing Instruments',
    price: 420,
    condition: 'Like New',
    status: 'Available',
    isSold: false,
    imageUrl: 'https://images.unsplash.com/photo-1585336261026-6a4574972f07?auto=format&fit=crop&w=600&q=80',
    seller: {
      id: 'user_rohan',
      _id: 'user_rohan',
      name: 'Rohan Reddy',
      email: 'rohan.reddy@college.edu.in',
      department: 'Mechanical, Block C',
      phone: '+91 99887 76655',
    },
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'item_5',
    _id: 'item_5',
    title: 'Hostel Study Table Lamp (Rechargeable LED) & Spike Guard',
    description: '3 color light modes with dimmable touch control, 6-hour backup. Includes 4-socket surge protector extension board for hostel room.',
    category: 'Hostel Essentials',
    price: 350,
    condition: 'Good',
    status: 'Available',
    isSold: false,
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
    seller: {
      id: 'user_rohan',
      _id: 'user_rohan',
      name: 'Rohan Reddy',
      email: 'rohan.reddy@college.edu.in',
      department: 'Mechanical, Block C',
      phone: '+91 99887 76655',
    },
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: 'item_6',
    _id: 'item_6',
    title: 'Engineering Mechanics by S.S. Bhavikatti (New Age International)',
    description: 'Textbook for Statics & Dynamics with solved university question papers. Great for Civil & Mechanical branches.',
    category: 'Textbooks',
    price: 280,
    condition: 'Good',
    status: 'Available',
    isSold: false,
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    seller: {
      id: 'user_aarav',
      _id: 'user_aarav',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@college.edu.in',
      department: 'CSE, Block A',
      phone: '+91 98765 43210',
    },
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'item_7',
    _id: 'item_7',
    title: 'Rotring Isograph Technical Drawing Pen Set (0.2, 0.3, 0.5 mm)',
    description: 'Precision German drafting technical pens for architectural and civil engineering drawings. Comes with waterproof black drawing ink.',
    category: 'Drawing Instruments',
    price: 650,
    condition: 'Like New',
    status: 'Available',
    isSold: false,
    imageUrl: 'https://images.unsplash.com/photo-1585336261026-6a4574972f07?auto=format&fit=crop&w=600&q=80',
    seller: {
      id: 'user_ananya',
      _id: 'user_ananya',
      name: 'Ananya Iyer',
      email: 'ananya.iyer@college.edu.in',
      department: 'Civil, Block A',
      phone: '+91 97654 32109',
    },
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: 'item_8',
    _id: 'item_8',
    title: 'Hero Sprint 26T Campus Bicycle with Heavy Duty Basket & Lock',
    description: 'Single speed campus cycle in smooth running condition. New brake pads, anti-theft chain lock included. Saves commute time between hostel and lecture halls.',
    category: 'Hostel Essentials',
    price: 1800,
    condition: 'Good',
    status: 'Available',
    isSold: false,
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80',
    seller: {
      id: 'user_karthik',
      _id: 'user_karthik',
      name: 'Karthik Rao',
      email: 'karthik.rao@college.edu.in',
      department: 'Chemical, Block D',
      phone: '+91 96543 21098',
    },
    createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
  },
];

let requests = [
  {
    id: 'req_1',
    _id: 'req_1',
    item: items[2], // Lab coat
    itemId: 'item_3',
    buyer: users[0], // Aarav
    sender: users[0],
    seller: users[1], // Priya
    note: 'Hi Priya! I have Chemistry lab practicals starting this Thursday. Can we meet near the Central Canteen to exchange?',
    message: 'Hi Priya! I have Chemistry lab practicals starting this Thursday. Can we meet near the Central Canteen to exchange?',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'req_2',
    _id: 'req_2',
    item: items[3], // Mini drafter
    itemId: 'item_4',
    buyer: users[0], // Aarav
    sender: users[0],
    seller: users[2], // Rohan
    note: 'Hey Rohan, is the mini drafter still available? Can meet at Block C hostel gate.',
    message: 'Hey Rohan, is the mini drafter still available? Can meet at Block C hostel gate.',
    status: 'accepted',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

// Auth helper: NEVER fallback to default user; must match valid token strictly
const getAuthUser = (req) => {
  const authHeader = req.headers['authorization'] || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;

  const matchedUser = users.find((u) => u.email === token || u.id === token || token === `token_${u.id}`);
  return matchedUser || null;
};

// Body parser helper
const parseJsonBody = (req) => {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
};

const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
};

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  const parsed = parseUrl(req.url, true);
  const pathname = parsed.pathname;
  const query = parsed.query;
  const method = req.method;

  // 1. AUTH: POST /api/auth/register
  if (method === 'POST' && pathname === '/api/auth/register') {
    const body = await parseJsonBody(req);
    const { name, email, password, department, phone } = body;
    if (!name || !email || !password) {
      return sendJson(res, 400, { message: 'Name, email, and password are required' });
    }
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return sendJson(res, 400, { message: 'A student with this email is already registered.' });
    }
    const newUser = {
      id: 'user_' + Date.now(),
      _id: 'user_' + Date.now(),
      name,
      email,
      password,
      department: department || 'Campus Member',
      hostel: department || 'Campus Member',
      phone: phone || '',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    const token = newUser.id;
    return sendJson(res, 201, {
      message: 'Registration successful',
      token,
      user: {
        id: newUser.id,
        _id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        department: newUser.department,
        hostel: newUser.hostel,
        phone: newUser.phone,
      },
    });
  }

  // 2. AUTH: POST /api/auth/login
  if (method === 'POST' && pathname === '/api/auth/login') {
    const body = await parseJsonBody(req);
    const { email, password } = body;
    if (!email || !password) {
      return sendJson(res, 400, { message: 'Please provide both email and password.' });
    }
    const user = users.find(
      (u) => u.email.toLowerCase() === (email || '').toLowerCase()
    );
    if (!user || user.password !== password) {
      return sendJson(res, 401, { message: 'Invalid email or password. Please check your credentials.' });
    }
    const token = user.id;
    return sendJson(res, 200, {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        _id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        hostel: user.hostel,
        phone: user.phone,
      },
    });
  }

  // 3. USER: GET /api/users/me
  if (method === 'GET' && pathname === '/api/users/me') {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return sendJson(res, 401, { message: 'Unauthorized. No active session or token invalid.' });
    }
    return sendJson(res, 200, {
      user: {
        id: authUser.id,
        _id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        department: authUser.department,
        hostel: authUser.hostel,
        phone: authUser.phone,
      },
    });
  }

  // 4. USER: PUT /api/users/me
  if (method === 'PUT' && pathname === '/api/users/me') {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return sendJson(res, 401, { message: 'Unauthorized. Please log in.' });
    }
    const body = await parseJsonBody(req);
    if (body.name) authUser.name = body.name;
    if (body.department) {
      authUser.department = body.department;
      authUser.hostel = body.department;
    }
    if (body.phone) authUser.phone = body.phone;

    return sendJson(res, 200, {
      message: 'Profile updated successfully',
      user: authUser,
    });
  }

  // 5. ITEMS: GET /api/items/mine
  if (method === 'GET' && pathname === '/api/items/mine') {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return sendJson(res, 401, { message: 'Unauthorized. Please log in.' });
    }
    const myItems = items.filter((item) => {
      const sellerId = typeof item.seller === 'object' ? item.seller.id || item.seller._id : item.seller;
      return sellerId === authUser.id;
    });
    return sendJson(res, 200, { items: myItems });
  }

  // 6. ITEMS: GET /api/items
  if (method === 'GET' && pathname === '/api/items') {
    let result = [...items];
    const { search, category, condition, sort } = query;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      );
    }
    if (category && category !== 'All') {
      result = result.filter(
        (i) => i.category.toLowerCase() === category.toLowerCase()
      );
    }
    if (condition && condition !== 'All') {
      result = result.filter(
        (i) => i.condition.toLowerCase() === condition.toLowerCase()
      );
    }
    if (sort === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return sendJson(res, 200, { items: result });
  }

  // 7. ITEMS: GET /api/items/:id
  const itemMatch = pathname.match(/^\/api\/items\/([^/]+)$/);
  if (method === 'GET' && itemMatch && itemMatch[1] !== 'mine') {
    const id = itemMatch[1];
    const item = items.find((i) => i.id === id || i._id === id);
    if (!item) {
      return sendJson(res, 404, { message: 'Item not found' });
    }
    return sendJson(res, 200, { item });
  }

  // 8. ITEMS: POST /api/items
  if (method === 'POST' && pathname === '/api/items') {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return sendJson(res, 401, { message: 'Unauthorized. Please log in.' });
    }
    const body = await parseJsonBody(req);
    const newItem = {
      id: 'item_' + Date.now(),
      _id: 'item_' + Date.now(),
      title: body.title,
      description: body.description,
      category: body.category,
      price: parseFloat(body.price) || 0,
      condition: body.condition,
      status: 'Available',
      isSold: false,
      imageUrl: body.imageUrl || body.image,
      seller: {
        id: authUser.id,
        _id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        department: authUser.department,
        phone: authUser.phone,
      },
      createdAt: new Date().toISOString(),
    };
    items.unshift(newItem);
    return sendJson(res, 201, { message: 'Item listed successfully', item: newItem });
  }

  // 9. ITEMS: PUT /api/items/:id
  if (method === 'PUT' && itemMatch) {
    const authUser = getAuthUser(req);
    if (!authUser) return sendJson(res, 401, { message: 'Unauthorized. Please log in.' });
    const id = itemMatch[1];
    const item = items.find((i) => i.id === id || i._id === id);
    if (!item) return sendJson(res, 404, { message: 'Item not found' });

    const body = await parseJsonBody(req);
    if (body.title) item.title = body.title;
    if (body.description) item.description = body.description;
    if (body.category) item.category = body.category;
    if (body.price !== undefined) item.price = parseFloat(body.price);
    if (body.condition) item.condition = body.condition;
    if (body.imageUrl || body.image) item.imageUrl = body.imageUrl || body.image;

    return sendJson(res, 200, { message: 'Item updated successfully', item });
  }

  // 10. ITEMS: DELETE /api/items/:id
  if (method === 'DELETE' && itemMatch) {
    const authUser = getAuthUser(req);
    if (!authUser) return sendJson(res, 401, { message: 'Unauthorized. Please log in.' });
    const id = itemMatch[1];
    items = items.filter((i) => i.id !== id && i._id !== id);
    return sendJson(res, 200, { message: 'Item deleted successfully' });
  }

  // 11. ITEMS: PATCH /api/items/:id/sold
  const soldMatch = pathname.match(/^\/api\/items\/([^/]+)\/sold$/);
  if (method === 'PATCH' && soldMatch) {
    const authUser = getAuthUser(req);
    if (!authUser) return sendJson(res, 401, { message: 'Unauthorized. Please log in.' });
    const id = soldMatch[1];
    const item = items.find((i) => i.id === id || i._id === id);
    if (!item) return sendJson(res, 404, { message: 'Item not found' });
    item.isSold = true;
    item.status = 'Sold';
    return sendJson(res, 200, { message: 'Item marked as sold', item });
  }

  // 12. REQUESTS: POST /api/requests
  if (method === 'POST' && pathname === '/api/requests') {
    const authUser = getAuthUser(req);
    if (!authUser) return sendJson(res, 401, { message: 'Unauthorized. Please log in.' });
    const body = await parseJsonBody(req);
    const itemId = body.itemId || body.item;
    const targetItem = items.find((i) => i.id === itemId || i._id === itemId);
    if (!targetItem) return sendJson(res, 404, { message: 'Item not found' });

    const newReq = {
      id: 'req_' + Date.now(),
      _id: 'req_' + Date.now(),
      item: targetItem,
      itemId: targetItem.id,
      buyer: authUser,
      sender: authUser,
      seller: targetItem.seller,
      note: body.note || body.message || 'Interested in buying',
      message: body.message || body.note || 'Interested in buying',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    requests.unshift(newReq);
    return sendJson(res, 201, { message: 'Request sent successfully', request: newReq });
  }

  // 13. REQUESTS: GET /api/requests/received
  if (method === 'GET' && pathname === '/api/requests/received') {
    const authUser = getAuthUser(req);
    if (!authUser) return sendJson(res, 401, { message: 'Unauthorized. Please log in.' });
    const received = requests.filter((r) => {
      const sellerId = typeof r.seller === 'object' ? r.seller.id || r.seller._id : r.seller;
      return sellerId === authUser.id;
    });
    return sendJson(res, 200, { requests: received });
  }

  // 14. REQUESTS: GET /api/requests/sent
  if (method === 'GET' && pathname === '/api/requests/sent') {
    const authUser = getAuthUser(req);
    if (!authUser) return sendJson(res, 401, { message: 'Unauthorized. Please log in.' });
    const sent = requests.filter((r) => {
      const buyerId = typeof r.buyer === 'object' ? r.buyer.id || r.buyer._id : r.buyer;
      return buyerId === authUser.id;
    });
    return sendJson(res, 200, { requests: sent });
  }

  // 15. REQUESTS: PATCH /api/requests/:id
  const reqMatch = pathname.match(/^\/api\/requests\/([^/]+)$/);
  if (method === 'PATCH' && reqMatch) {
    const authUser = getAuthUser(req);
    if (!authUser) return sendJson(res, 401, { message: 'Unauthorized. Please log in.' });
    const id = reqMatch[1];
    const targetReq = requests.find((r) => r.id === id || r._id === id);
    if (!targetReq) return sendJson(res, 404, { message: 'Request not found' });
    const body = await parseJsonBody(req);
    if (body.status) {
      targetReq.status = body.status;
    }
    return sendJson(res, 200, { message: 'Request status updated', request: targetReq });
  }

  // Fallback
  return sendJson(res, 404, { message: 'Endpoint not found' });
});

server.listen(PORT, () => {
  console.log(`ReUseHub Backend API Server running at http://localhost:${PORT}`);
});
