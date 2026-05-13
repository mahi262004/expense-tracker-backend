# Expense Tracker Backend

A Node.js + Express backend for an Expense Tracker website.  
This API is intended to handle user authentication, income/expense records, categories, and dashboard summaries.

## Tech Stack

- Node.js
- Express
- MongoDB
- Mongoose

## Project Status

This repository is currently a starter scaffold.  
Core backend files are present, and this README defines the recommended structure and API design.

## Features (Planned / Typical)

- User registration and login
- JWT-based authentication
- Add, update, delete, and list transactions
- Category-based tracking (Food, Travel, Bills, etc.)
- Monthly and custom date range summaries
- Basic analytics (total income, total expense, balance)

## Project Structure

```text
expense-tracker-backend/
|- index.js
|- db.js
|- package.json
|- README.md
```

As the project grows, you can expand to:

```text
expense-tracker-backend/
|- src/
|  |- controllers/
|  |- models/
|  |- routes/
|  |- middleware/
|  |- utils/
|- .env
|- index.js
|- db.js
```

## Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB Atlas account or local MongoDB instance
- npm

## Installation

1. Clone the repository:

```bash
git clone https://github.com/mahi262004/expense-tracker-backend.git
cd expense-tracker-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
NODE_ENV=development
```

4. Start the server (after adding a start script in `package.json`):

```bash
npm run dev
```

## Suggested `package.json` Scripts

Add these scripts to improve local development:

```json
"scripts": {
  "start": "node index.js",
  "dev": "node --watch index.js"
}
```

## API Base URL

```text
http://localhost:5000/api
```

## Recommended API Endpoints

### Auth

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get token

### Transactions

- `GET /transactions` - Get all user transactions
- `POST /transactions` - Add a new transaction
- `PUT /transactions/:id` - Update a transaction
- `DELETE /transactions/:id` - Delete a transaction

### Categories

- `GET /categories` - Get all categories
- `POST /categories` - Create a category

### Summary

- `GET /summary` - Get totals (income, expense, balance)
- `GET /summary/monthly` - Get month-wise summaries

## Example Transaction Payload

```json
{
  "title": "Grocery Shopping",
  "amount": 1500,
  "type": "expense",
  "category": "Food",
  "date": "2026-05-13"
}
```

## Sample Response

```json
{
  "success": true,
  "message": "Transaction added successfully",
  "data": {
    "_id": "663ff3a6a0f39e6f9f726cd1",
    "title": "Grocery Shopping",
    "amount": 1500,
    "type": "expense",
    "category": "Food",
    "date": "2026-05-13T00:00:00.000Z"
  }
}
```

## Error Response Format

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Amount must be greater than 0"]
}
```

## Security Best Practices

- Hash passwords with `bcrypt`
- Use JWT expiration and refresh strategy
- Validate all request payloads
- Enable CORS only for trusted frontend origins
- Never commit `.env` files

## Frontend Integration Notes

For your expense tracker website frontend:

- Store JWT securely (prefer HttpOnly cookies in production)
- Attach token in `Authorization: Bearer <token>`
- Fetch dashboard summary on login and after transaction changes

## Deployment

You can deploy this backend to:

- Render
- Railway
- Cyclic
- VPS (Node + PM2 + Nginx)

Set production environment variables in your hosting platform dashboard.

## Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Commit your changes
4. Push and create a pull request

## License

ISC