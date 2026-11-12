# ♻️ ReUseHub: Give Things a Second Life

> **"Pass it on. Save more. Waste less."**

ReUseHub is a full-stack campus marketplace where college students can buy, sell, and exchange used items such as textbooks, calculators, lab equipment, drawing instruments, and hostel essentials. It promotes affordable shopping and reduces waste within the campus community.

---

## 📸 Screenshots

### Login
![Home](https://github.com/user-attachments/assets/ef65d6a8-10ec-4939-9d9e-e1694ddb217b) 
### Home
![Details](https://github.com/user-attachments/assets/6c615e80-a97c-4924-8ee5-3fe1a3b2d152) 
### Item Details
![Requests](https://github.com/user-attachments/assets/ea1c161f-0de1-4dbe-95d6-5b3c7509df97) 
### Selling an item
<img width="960" height="540" alt="2026-10-28 (10)" src="https://github.com/user-attachments/assets/ed7cc238-e3ba-4f50-8115-98a4077c5c26" />


---

## ✨ Features

- Secure registration and login with JWT authentication
- Search items by keyword, category, and condition, with price sorting
- List items with description, price (₹), condition, and image
- Send, accept, or reject purchase requests
- Seller contact details revealed once a request is accepted
- Manage listings: edit, delete, and mark as sold
- Colored status badges: Available, Sold, Pending, Accepted, Rejected
- Profile view and edit
- Protected routes, loading and empty states, form validation, toast alerts
- Fully responsive design with prices in Indian Rupees (₹)

---

## 🔄 How It Works

1. **List:** The seller posts an item with details and a photo.
2. **Discover:** Buyers search and filter listings.
3. **Request:** A buyer sends a purchase request.
4. **Decide:** The seller accepts or rejects it.
5. **Connect:** Both students coordinate the exchange on campus.
6. **Complete:** The seller marks the item as sold.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React JS (Vite), React Router, Axios, CSS |
| Backend | Node.js, Express JS |
| Database | MySQL |
| Communication | REST APIs |
| Authentication | JSON Web Tokens (JWT) |

---

## 📁 Project Structure

```
reusehub/
├── backend/
│   └── ...
└── frontend/
    ├── src/
    │   ├── api/          # Axios instance and API calls
    │   ├── components/   # Navbar, ItemCard, ItemImage, StatusBadge, Toast...
    │   ├── context/      # AuthContext
    │   ├── pages/        # Login, Register, Home, ItemDetails, Sell...
    │   ├── styles/       # CSS files
    │   ├── utils/        # formatPrice, helpers
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or later)
- MySQL
- npm

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/reusehub.git
cd reusehub
```

### 2. Set up the database
```sql
CREATE DATABASE reusehub;
```
Then import the schema file provided in the backend folder.

### 3. Run the backend
```bash
cd backend
npm install
```
Create a `.env` file:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=reusehub
JWT_SECRET=your_secret_key
```
Start the server:
```bash
npm start
```

### 4. Run the frontend
```bash
cd frontend
npm install
```
Create a `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the app:
```bash
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in and receive a JWT |
| GET | `/api/items` | List items (search, category, condition, sort) |
| GET | `/api/items/:id` | Get item details |
| POST | `/api/items` | Create a listing |
| PUT | `/api/items/:id` | Update a listing |
| DELETE | `/api/items/:id` | Delete a listing |
| PATCH | `/api/items/:id/sold` | Mark an item as sold |
| GET | `/api/items/mine` | Get the logged-in user's listings |
| POST | `/api/requests` | Send a purchase request |
| GET | `/api/requests/received` | Requests received as seller |
| GET | `/api/requests/sent` | Requests sent as buyer |
| PATCH | `/api/requests/:id` | Accept or reject a request |
| GET | `/api/users/me` | Get profile |
| PUT | `/api/users/me` | Update profile |

---

## 🌱 Impact

- **Students:** Lower costs on academic and daily-use items
- **Environment:** Less waste and more reuse across campus
- **Community:** A culture of sharing, trust, and sustainability

---

## 🔮 Future Enhancements

- In-app chat between buyer and seller
- Image upload instead of image URLs
- Wishlist and notifications
- Ratings and reviews for sellers
- Admin panel for moderation

---



---

## 📄 License

This project is licensed under the MIT License.

---

*ReUseHub is more than a marketplace. It is a small step towards a greener, more connected campus.*
